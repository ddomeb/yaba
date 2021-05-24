import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {CategoriesService} from './categories.service';
import {BehaviorSubject, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {MainCategory, MainCategoryDetails} from '../common_models/category.interface';
import {NewCategoryComponent} from './new-category/new-category.component';
import {SimpleConfirmModalComponent} from '../common_components/simple-confirm-modal/simple-confirm-modal.component';
import {CategoryDetailsComponent} from './category-details/category-details.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent implements OnInit, OnDestroy {
  public incomeCategories: BehaviorSubject<Array<MainCategory>>;
  public expenseCategories: BehaviorSubject<Array<MainCategory>>;
  public currentMainCategoryDetails: BehaviorSubject<MainCategoryDetails | null>;
  public activeTab = 'expense';

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly modalService: NgbModal
  ) {
    this.incomeCategories = this.categoriesService.incomeCategoriesPublisher;
    this.expenseCategories = this.categoriesService.expenseCategoriesPublisher;
    this.currentMainCategoryDetails = this.categoriesService.currentMainCategoryPublisher;
    this.categoriesService.loadMainCategories().subscribe();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.modalService.hasOpenModals()){
      this.modalService.dismissAll('nok');
    }
  }

  public addNewCategory(): void {
    this.modalService.open(NewCategoryComponent);
  }

  public deleteMainCategory(id: number): void {
    const modalRef = this.modalService.open(SimpleConfirmModalComponent);
    modalRef.componentInstance.message = 'Are you sure you want to delete this category and all of its subcategories?\n'
      + 'This will also revert all of the transactions associated with it.';
    modalRef.closed.pipe(
      switchMap(result => result === 'ok' ? this.categoriesService.deleteMainCategory((id)) : of(false))
    ).subscribe();
  }

  showCategoryDetails(category: MainCategory): void {
    const modalRef = this.modalService.open(CategoryDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.categoryId = category.id;
  }

}
