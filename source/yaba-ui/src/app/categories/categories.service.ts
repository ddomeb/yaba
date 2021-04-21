import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ApiService} from '../services/apiservice.service';
import {MainCategory, MainCategoryDetails, SubCategory, SubCategoryDetails} from '../common_models/category.interface';

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
  public mainCategoriesPublisher = new BehaviorSubject<Array<MainCategory>>(this.mainCategories);

  constructor(private readonly apiService: ApiService) { }

  public loadMainCategories(): Observable<Array<MainCategory>>{
    return this.apiService.get<Array<MainCategory>>(
      CategoriesService.CATEGORIES_ENDPOINT
    ).pipe(
      tap((response: MainCategory[]) => {
        this.mainCategories = response;
        this.mainCategoriesPublisher.next(this.mainCategories);
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
    return this.apiService.delete(
      CategoriesService.CATEGORIES_ENDPOINT + mainCategoryId.toString() + '/'
    ).pipe(
      tap(() => this.loadMainCategories())
    );
  }

  public addMainCategory(mainCategory: MainCategory): Observable<any> {
    return this.apiService.post(
      CategoriesService.CATEGORIES_ENDPOINT,
      mainCategory
    ).pipe(
      tap(() => this.loadMainCategories())
    );
  }

  public deleteSubCategory(subcategoryId: number): Observable<any> {
    return this.apiService.delete(
      CategoriesService.SUBCATEGORIES_ENDPOINT + subcategoryId.toString() + '/'
    ).pipe(
      tap(() => this.loadMainCategories()),
      tap(() => {
        if (this.currentMainCategory){
          this.loadMainCategoryDetails(this.currentMainCategory.id);
        }
      })
    );
  }

  public addSubCategory(subCategory: SubCategory): Observable<any> {
    return this.apiService.post(
      CategoriesService.SUBCATEGORIES_ENDPOINT,
      subCategory
    ).pipe(
      tap(() => this.loadMainCategories()),
      tap(() => {
        if (this.currentMainCategory){
          this.loadMainCategoryDetails(this.currentMainCategory.id);
        }
      })
    );
  }
}
