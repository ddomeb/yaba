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
      return;
    }
    const updatedCategory: MainCategory = {
      description: this.form.value.description,
      // tslint:disable-next-line:no-non-null-assertion
      id: this.currentMainCategoryDetails.value!.id,
      name: this.form.value.name
    };
    this.categoryService.updateMainCategory(updatedCategory.id, updatedCategory).pipe(
      tap(() => this.form.markAsPristine())
    ).subscribe();
  }

  editSubcategory(subcategory: any): void {
    console.log(subcategory);
  }
}
