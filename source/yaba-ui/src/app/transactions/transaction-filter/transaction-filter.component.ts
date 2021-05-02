import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {FilterParams} from '../filter-params.interface';
import {MainCategory, MainCategoryDetails} from '../../common_models/category.interface';
import {BehaviorSubject, concat} from 'rxjs';
import {TransactionService} from '../transaction.service.';
import {AccountInfo} from '../../common_models/account.interface';

function makeDateFromModel(dateModel: NgbDateStruct | null): Date | undefined {
  if (!dateModel){
    return undefined;
  }
  return new Date(dateModel.year, dateModel.month - 1, dateModel.day);
}

interface FormModel {
  dateFromModel: NgbDateStruct | null;
  dateToModel: NgbDateStruct | null;
  mainCategoryModel: string | null;
  subcategoryModel: string | null;
  accountModel: string | null;
  direction: 'in' | 'out' | '' | null;
}

@Component({
  selector: 'app-transaction-filter',
  templateUrl: './transaction-filter.component.html',
  styleUrls: ['./transaction-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFilterComponent implements OnInit {

  public mainCategories: BehaviorSubject<MainCategory[]>;
  public accounts: BehaviorSubject<AccountInfo[]>;
  public mainCategoryDetails: BehaviorSubject<MainCategoryDetails | null>;
  public showDisabledSubCatSelect = new BehaviorSubject<boolean>(true);

  @Output() applyParams: EventEmitter<FilterParams> = new EventEmitter<FilterParams>();

  model: FormModel = {
    dateFromModel: null,
    dateToModel: null,
    accountModel: null,
    mainCategoryModel: null,
    subcategoryModel: null,
    direction: '',
  };

  constructor(private readonly transactionService: TransactionService) {
    this.mainCategories = this.transactionService.mainCategoriesPublisher;
    this.accounts = this.transactionService.accountsPublisher;
    this.mainCategoryDetails = this.transactionService.currentMainCategoryPublisher;
  }

  ngOnInit(): void {
  }

  onSubmitParams(): void {
    this.applyParams.emit(
      {
        subcategoryId: this.model.subcategoryModel ? this.model.subcategoryModel : undefined,
        mainCategoryId: this.model.mainCategoryModel ? this.model.mainCategoryModel : undefined,
        accountId: this.model.accountModel ? this.model.accountModel : undefined,
        direction: this.model.direction ? this.model.direction : undefined,
        dateTo: makeDateFromModel(this.model.dateToModel),
        dateFrom: makeDateFromModel(this.model.dateFromModel),
      }
    );
  }

  onChangeCategory($event: any): void {
    if ($event === '') {
      this.model.mainCategoryModel = null;
      $event = null;
    }
    this.showDisabledSubCatSelect.next($event === null);
    this.model.subcategoryModel = null;
    this.transactionService.loadSubcategories($event).subscribe();
  }

  onResetParams(): void {
    this.model = {
      dateFromModel: null,
      dateToModel: null,
      accountModel: null,
      mainCategoryModel: null,
      subcategoryModel: null,
      direction: null,
    };
    this.onSubmitParams();
  }
}
