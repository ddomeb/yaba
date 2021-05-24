import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';

import {AccountInfo} from '../common_models/account.interface';
import {ApiService} from '../services/apiservice.service';
import {PaginatedTransactionList} from '../common_models/transaction.interface';
import {AccountsByType} from './accounts.interface';

const EMPTY_ACCOUNTS = {
  accounts: [],
  savings: [],
  investments: [],
  others: []
};

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private static readonly ACCOUNTS_ENDPOINT = 'accounts/';
  private static readonly TRANSACTIONS_ENDPOINT = 'transactions/';

  private accounts: Array<AccountInfo> = [];
  public partitionedAccountsPublisher = new BehaviorSubject<AccountsByType>(JSON.parse(JSON.stringify(EMPTY_ACCOUNTS)));

  constructor(private readonly apiService: ApiService) {}

  public loadAccounts(): void {
    this.apiService.get<Array<AccountInfo>>(AccountsService.ACCOUNTS_ENDPOINT).subscribe(
      (response: Array<AccountInfo>) => {
        this.accounts = response;
        const partitionedAccounts: AccountsByType = JSON.parse(JSON.stringify(EMPTY_ACCOUNTS));
        response.forEach(
          value => {
            switch (value.type) {
              case 'account':
                partitionedAccounts.accounts.push(value);
                break;
              case 'investment':
                partitionedAccounts.investments.push(value);
                break;
              case 'savings':
                partitionedAccounts.savings.push(value);
                break;
              default:
                partitionedAccounts.others.push(value);
            }
          }
        );
        this.partitionedAccountsPublisher.next(partitionedAccounts);
      }
    );
  }

  public addAccount(account: AccountInfo): Observable<any> {
    return this.apiService.post(AccountsService.ACCOUNTS_ENDPOINT, account).pipe(
      tap(() => this.loadAccounts())
    );
  }

  public getAccountById(id: number): AccountInfo | undefined {
    return this.accounts.find(acc => acc.id === id);
  }

  public modifyAccount(account: AccountInfo): Observable<any> {
    return this.apiService.put(
      AccountsService.ACCOUNTS_ENDPOINT +  account.id.toString() + '/',
      account
    ).pipe(
      tap(() => this.loadAccounts())
    );
  }

  public deleteAccount(id: number): Observable<any> {
    return this.apiService.delete(
      AccountsService.ACCOUNTS_ENDPOINT + id.toString() + '/'
    ).pipe(
      tap(() => this.loadAccounts())
    );
  }

 public getTransactions(accountId: number, page: number): Observable<PaginatedTransactionList> {
    let params = new HttpParams().set('page', page.toString());
    params = params.set('account', accountId.toString());
    return this.apiService.get<PaginatedTransactionList>(
      AccountsService.TRANSACTIONS_ENDPOINT,
      undefined,
      params
    );
  }

}
