import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MainCategory, MainCategoryDetails} from '../../common_models/category.interface';
import {BehaviorSubject, of, concat, Subject, Observable} from 'rxjs';
import {CategoriesService} from '../categories.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SimpleConfirmModalComponent} from '../../common_components/simple-confirm-modal/simple-confirm-modal.component';
import {catchError, debounceTime, switchMap, takeUntil, tap} from 'rxjs/operators';
import {NewCategoryComponent} from '../new-category/new-category.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  @Input() categoryId = 0;
  public currentMainCategoryDetails: BehaviorSubject<MainCategoryDetails | null>;
  public form: FormGroup;
  private unsubscribe = new Subject<void>();

  constructor(
    private readonly categoryService: CategoriesService,
    readonly activeModal: NgbActiveModal,
    private readonly modalService: NgbModal
  ) {
    this.currentMainCategoryDetails = this.categoryService.currentMainCategoryPublisher;
    this.form = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required)
      }
    );
  }

  ngOnInit(): void {
    this.categoryService.loadMainCategoryDetails(this.categoryId).pipe(
      tap((response: MainCategoryDetails) => {
        if (this.form.contains('name')){
          // tslint:disable-next-line:no-non-null-assertion
          this.form.get('name')!.setValue(response.name, {emitEvent: false});
        }
        if (this.form.contains('description')){
          // tslint:disable-next-line:no-non-null-assertion
          this.form.get('description')!.setValue(response.description, {emitEvent: false});
        }
        this.form.valueChanges.pipe(
          debounceTime(1000),
          switchMap(res => this.form.valid ? this.updateMainCategory(res) : of(false)),
          takeUntil(this.unsubscribe),
        ).subscribe();
      }),
      catchError(() => of(false))
    ).subscribe();
  }

  deleteSubCategory(subCategoryId: number): void {
    const modalRef = this.modalService.open(SimpleConfirmModalComponent);
    modalRef.componentInstance.message =
      'Are you sure you want to delete this subcategory?\nThis will also revert all transactions associated with it.';
    modalRef.closed.pipe(
      switchMap(
        (result: string) => result === 'ok' ?
          concat(
            this.categoryService.deleteSubCategory(subCategoryId),
            this.categoryService.loadMainCategoryDetails(this.categoryId)
          ) : of(false))
    ).subscribe();
  }

  deleteMainCategory(subCategoryId: number): void {
    const modalRef = this.modalService.open(SimpleConfirmModalComponent);
    modalRef.componentInstance.message =
      'Are you sure you want to delete this category?\nThis will also delete all of it\'s subcategories and revert all transactions associated with it.';
    modalRef.closed.pipe(
      switchMap(
        (result: string) => result === 'ok' ? this.categoryService.deleteMainCategory(subCategoryId) : of(false)),
    ).subscribe(result => {
      if (!result) {
        this.activeModal.close('deleted');
      }
    });
  }

  addNewSubCategory(): void {
    const modalRef = this.modalService.open(NewCategoryComponent);
    modalRef.componentInstance.isSubcategory = true;
    modalRef.componentInstance.mainCategoryId = this.currentMainCategoryDetails.value?.id;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
  }

  private updateMainCategory(res: any): Observable<any> {
    if (!this.form.valid) {
      return of(false);
    }
    const updatedCategory: MainCategory = {
      description: this.form.value.description,
      // tslint:disable-next-line:no-non-null-assertion
      id: this.currentMainCategoryDetails.value!.id,
      name: this.form.value.name
    };
    return this.categoryService.updateMainCategory(updatedCategory.id, updatedCategory);
  }

  editSubcategory(subcategory: any) {

  }
}
