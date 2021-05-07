import {Injectable} from '@angular/core';
import {BehaviorSubject, concat, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ApiService} from '../services/apiservice.service';
import {
  MainCategory,
  MainCategoryDetails,
  SubCategory,
  SubCategoryDetails,
  SubcategoryWithPk
} from '../common_models/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private static readonly CATEGORIES_ENDPOINT = 'categories/';
  private static readonly SUBCATEGORIES_ENDPOINT = 'subcategories/';

  private currentSubcategory: SubCategoryDetails | null = null;
  private currentMainCategory: MainCategoryDetails | null = null;
  private mainCategories: Array<MainCategory> = [];

  public currentSubcategoryPublisher = new BehaviorSubject<SubCategoryDetails | null>(this.currentSubcategory);
  public currentMainCategoryPublisher = new BehaviorSubject<MainCategoryDetails | null>(this.currentMainCategory);
  public mainCategoriesPublisher = new BehaviorSubject<Array<MainCategory>>([]);
  public incomeCategoriesPublisher = new BehaviorSubject<Array<MainCategory>>([]);
  public expenseCategoriesPublisher = new BehaviorSubject<Array<MainCategory>>([]);

  constructor(private readonly apiService: ApiService) { }

  public loadMainCategories(): Observable<Array<MainCategory>>{
    return this.apiService.get<Array<MainCategory>>(
      CategoriesService.CATEGORIES_ENDPOINT
    ).pipe(
      tap((response: MainCategory[]) => {
        this.mainCategories = response;
        this.mainCategoriesPublisher.next(this.mainCategories);
        this.incomeCategoriesPublisher.next(response.filter(val => val.isIncome)); // REFACTOR: use partition fun
        this.expenseCategoriesPublisher.next(response.filter(val => !val.isIncome));
      })
    );
  }

  public loadMainCategoryDetails(mainCategoryId: number): Observable<MainCategoryDetails> {
    return this.apiService.get<MainCategoryDetails>(
      CategoriesService.CATEGORIES_ENDPOINT + mainCategoryId.toString() + '/'
    ).pipe(
      tap((response: MainCategoryDetails) => {
        this.currentMainCategory = response;
        this.currentMainCategoryPublisher.next(this.currentMainCategory);
      })
    );
  }

  public deleteMainCategory(mainCategoryId: number): Observable<any> {
    return concat(
      this.apiService.delete(CategoriesService.CATEGORIES_ENDPOINT + mainCategoryId.toString() + '/'),
      this.loadMainCategories()
    );
  }

  public addMainCategory(mainCategory: MainCategory): Observable<any> {
    return concat(
      this.apiService.post(CategoriesService.CATEGORIES_ENDPOINT, mainCategory),
      this.loadMainCategories()
    );
  }

  public deleteSubCategory(subcategoryId: number): Observable<any> {
    return concat(
      this.apiService.delete(CategoriesService.SUBCATEGORIES_ENDPOINT + subcategoryId.toString() + '/'),
      this.loadMainCategories(),
      this.currentMainCategory ? this.loadMainCategoryDetails(this.currentMainCategory.id) : of(true)
    );
  }

  public addSubCategory(subCategory: SubcategoryWithPk): Observable<any> {
    return concat(
      this.apiService.post(CategoriesService.SUBCATEGORIES_ENDPOINT, subCategory),
      this.loadMainCategories(),
      this.currentMainCategory ? this.loadMainCategoryDetails(this.currentMainCategory.id) : of(true)
    );
  }

  updateMainCategory(id: number, updatedCategory: MainCategory): Observable<any> {
    return concat(
      this.apiService.put(CategoriesService.CATEGORIES_ENDPOINT + id.toString() + '/', updatedCategory),
      this.loadMainCategories(),
      this.currentMainCategory ? this.loadMainCategoryDetails(this.currentMainCategory.id) : of(true)
    );
  }

  updateSubCategory(id: number, updatedCategory: SubCategory): Observable<any> {
    return concat(
      this.apiService.put(CategoriesService.SUBCATEGORIES_ENDPOINT + id.toString() + '/', updatedCategory),
      this.currentMainCategory ? this.loadMainCategoryDetails(this.currentMainCategory.id) : of(true)
    );
  }
}
