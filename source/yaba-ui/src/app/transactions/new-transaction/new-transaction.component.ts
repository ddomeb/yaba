import {Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {TransactionService} from '../transaction.service.';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject, concat} from 'rxjs';
import {MainCategory, MainCategoryDetails} from '../../common_models/category.interface';
import {AccountInfo} from '../../common_models/account.interface';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {tap} from 'rxjs/operators';
import {TransactionInfo} from '../../common_models/transaction.interface';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewTransactionComponent implements OnInit {
  public mainCategories: BehaviorSubject<MainCategory[]>;
  public accounts: BehaviorSubject<AccountInfo[]>;
  public mainCategoryDetails: BehaviorSubject<MainCategoryDetails | null>;
  public showDisabledSubCatSelect = new BehaviorSubject<boolean>(true);
  public form: FormGroup;

  @Input() isIncome = false;
  @Output() newTransactionAdded = new EventEmitter<boolean>();

  constructor(
    private readonly transactionService: TransactionService,
    public activeModal: NgbActiveModal
  ) {
    this.mainCategories = this.transactionService.mainCategoriesPublisher;
    this.accounts = this.transactionService.accountsPublisher;
    this.mainCategoryDetails = this.transactionService.currentMainCategoryPublisher;
    concat(
      this.transactionService.loadAccounts(),
      this.transactionService.loadMainCategories()
    ).subscribe();

    this.form = new FormGroup({
      accountId: new FormControl('', Validators.required),
      mainCategoryId: new FormControl('', Validators.required),
      subCategoryId: new FormControl('', Validators.required),
      note: new FormControl('', Validators.maxLength(150)),
      amount: new FormControl('1000',
        Validators.compose(
          [
            Validators.required,
            Validators.min(1)
          ]
        )
      )
    });

    this.form.get('subCategoryId')?.disable();
    this.form.get('mainCategoryId')?.valueChanges.pipe(
      tap(val => this.onMainCategoryChanged(val))
    ).subscribe();
  }

  ngOnInit(): void {
  }

  private onMainCategoryChanged(id: string): void {
    this.transactionService.loadSubcategories(id === '' ? null : id).pipe(
      tap(() => {
        if (id === ''){
          this.form.get('subCategoryId')?.disable();
          this.form.get('subCategoryId')?.setValue('');
          this.showDisabledSubCatSelect.next(true);
        }
        else {
          this.form.get('subCategoryId')?.enable();
          this.showDisabledSubCatSelect.next(false);
        }
      })
    ).subscribe();
  }

  public onSubmit(): void {
    if (!this.form.valid){
      return;
    }
    const tr: TransactionInfo = {
      note: this.form.value.note,
      account: this.form.value.accountId,
      amount: this.isIncome ? this.form.value.amount : (-1) * this.form.value.amount,
      subcategory: this.form.value.subCategoryId,
      created: new Date(),
      id: 0
    };
    this.transactionService.addTransaction(tr).pipe(
      tap(() => this.activeModal.close('ok'))
    ).subscribe();
  }

}
