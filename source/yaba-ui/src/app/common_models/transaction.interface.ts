import {SubCategory} from './category.interface';
import {AccountInfo} from './account.interface';

interface TransactionInfoBase {
  note?: string;
  amount: number;
  readonly id: number;
  readonly created: Date;
}

export interface TransactionDetails extends TransactionInfoBase {
  readonly subcategory: SubCategory;
  readonly account: AccountInfo;
}

export interface TransactionInfo extends TransactionInfoBase {
  readonly subcategory: number;
  readonly account: number;
}


export interface PaginatedTransactionList {
  readonly count: number;
  readonly pages: number;
  readonly results: Array<TransactionDetails>;
}
