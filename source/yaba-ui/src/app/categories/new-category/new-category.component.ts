import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {tap} from 'rxjs/operators';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import {CategoriesService} from '../categories.service';
import {MainCategory, SubcategoryWithPk} from '../../common_models/category.interface';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewCategoryComponent {
  @Input() isSubcategory = false;
  @Input() mainCategoryId = 0;
  public form: FormGroup;

  constructor(
    private readonly categoriesService: CategoriesService,
    public activeModal: NgbActiveModal
  ) {
    this.form = new FormGroup(
      {
        name : new FormControl('',
          Validators.compose(
            [
              Validators.required,
              Validators.maxLength(50)
            ]
          )
        ),
        description: new FormControl('', Validators.maxLength(100)),
        isIncome: new FormControl('expense', Validators.required)
      }
    );
  }

  onSubmit(): void {
    if (!this.form.valid){
      return;
    }
    if (this.isSubcategory){
      const subCat: SubcategoryWithPk = {
        name: this.form.value.name,
        description: this.form.value.description,
        main_category: this.mainCategoryId,
        id: 0,
      };
      this.categoriesService.addSubCategory(subCat).pipe(
        tap(() => this.activeModal.dismiss('ok'))
      ).subscribe();
    }
    else {
      const cat: MainCategory = {
        description: this.form.value.description,
        name: this.form.value.name,
        id: 0,
        isIncome: this.form.value.isIncome === 'income',
      };
      this.categoriesService.addMainCategory(cat).pipe(
        tap(() => this.activeModal.dismiss('ok'))
      ).subscribe();
    }
  }
}
