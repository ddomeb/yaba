import {AccountInfo} from '../common_models/account.interface';

export interface AccountsByType {
  accounts: Array<AccountInfo>;
  savings: Array<AccountInfo>;
  investments: Array<AccountInfo>;
  others: Array<AccountInfo>;
}
