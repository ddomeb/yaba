import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MainCategory, MainCategoryDetails, SubCategory} from '../../common_models/category.interface';
import {BehaviorSubject, of, concat, Subject, Observable} from 'rxjs';
import {CategoriesService} from '../categories.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SimpleConfirmModalComponent} from '../../common_components/simple-confirm-modal/simple-confirm-modal.component';
import {catchError, switchMap, tap} from 'rxjs/operators';
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
  public subCategoryForm: FormGroup | null = null;
  public currentEditedSubcategory = new BehaviorSubject<SubCategory | null>(null);
  private unsubscribe = new Subject<void>();
  private editedSubcategory: SubCategory | null = null;
  private categoryInfo: {name: string, description?: string} | null = null;

  constructor(
    private readonly categoryService: CategoriesService,
    readonly activeModal: NgbActiveModal,
    private readonly modalService: NgbModal
  ) {
    this.currentMainCategoryDetails = this.categoryService.currentMainCategoryPublisher;
    this.form = new FormGroup({
        name: new FormControl('', Validators.compose(
          [
            Validators.required,
            Validators.maxLength(50)
          ]
        )),
        description: new FormControl('', Validators.maxLength(100))
      }
    );
  }

  ngOnInit(): void {
    this.categoryService.loadMainCategoryDetails(this.categoryId).pipe(
      tap((response: MainCategoryDetails) => {
        if (this.form.contains('name')){
          // tslint:disable-next-line:no-non-null-assertion
          this.form.get('name')!.setValue(response.name, {emitEvent: true});
        }
        if (this.form.contains('description')){
          // tslint:disable-next-line:no-non-null-assertion
          this.form.get('description')!.setValue(response.description, {emitEvent: false});
        }
        this.categoryInfo = {name: response.name, description: response.description};
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

  onStartEditSubCategory(subCategory: SubCategory): void {
    this.subCategoryForm = new FormGroup({
      name: new FormControl(subCategory.name, Validators.compose([Validators.required, Validators.maxLength(50)])),
      description: new FormControl(subCategory.description, Validators.maxLength(100))
    });
    this.currentEditedSubcategory.next(subCategory);
    this.editedSubcategory = subCategory;
  }

  onCancelEditSubCategory(subCategory: SubCategory): void {
    this.currentEditedSubcategory.next(null);
    this.subCategoryForm = null;
  }

  onConfirmEditSubCategory(subCategory: SubCategory): void {
    if (this.subCategoryForm === null || !this.subCategoryForm?.valid) {
      return;
    }
    const editedSubcategory = {
      name: this.subCategoryForm.value.name,
      description: this.subCategoryForm.value.description,
      // tslint:disable-next-line:no-non-null-assertion
      id: this.editedSubcategory!.id
    };
    this.categoryService.updateSubCategory(editedSubcategory.id, editedSubcategory).subscribe(
      _ => {
        this.subCategoryForm = null;
        this.currentEditedSubcategory.next(null);
      }
    );
  }


  addNewSubCategory(): void {
    const modalRef = this.modalService.open(NewCategoryComponent);
    modalRef.componentInstance.isSubcategory = true;
    modalRef.componentInstance.mainCategoryId = this.currentMainCategoryDetails.value?.id;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
  }

  public updateMainCategory(): void {
    if (!this.form.valid || this.form.pristine) {
      this.form.reset();
      // tslint:disable-next-line:no-non-null-assertion
      this.form.get('name')!.setValue(this.categoryInfo!.name, {emitEvent: false});
      // tslint:disable-next-line:no-non-null-assertion
      this.form.get('description')!.setValue(this.categoryInfo!.description, {emitEvent: false});
      return;
    }
    const updatedCategory: MainCategory = {
      description: this.form.value.description,
      // tslint:disable-next-line:no-non-null-assertion
      id: this.currentMainCategoryDetails.value!.id,
      name: this.form.value.name,
      // tslint:disable-next-line:no-non-null-assertion
      isIncome: this.currentMainCategoryDetails.value!.isIncome,
    };
    this.categoryInfo = {name: updatedCategory.name, description: updatedCategory.description};
    this.categoryService.updateMainCategory(updatedCategory.id, updatedCategory).pipe(
      tap(() => this.form.markAsPristine()),
    ).subscribe();
  }

}
