import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';


import {AccountInfo} from '../common_models/account.interface';
import {ApiService} from '../services/apiservice.service';
import {map, tap} from 'rxjs/operators';
import {PaginatedTransactionList} from '../common_models/transaction.interface';
import {AccountHistory, SeriesData} from '../common_models/account-history.interface';


@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private static readonly ACCOUNTS_ENDPOINT = 'accounts/';
  private static readonly TRANSACTIONS_ENDPOINT = 'transactions/';
  private static readonly DASHBOARD_ENDPOINT = 'dashboard/';

  private accounts: Array<AccountInfo> = [];
  public accountsPublisher: BehaviorSubject<Array<AccountInfo>> =
    new BehaviorSubject<Array<AccountInfo>>([]);

  constructor(private readonly apiService: ApiService) {
    // this.loadAccounts();
  }

  public loadAccounts(): void {
    this.apiService.get<Array<AccountInfo>>(AccountsService.ACCOUNTS_ENDPOINT).subscribe(
      (response: Array<AccountInfo>) => {
        this.accounts = response;
        this.accountsPublisher.next(this.accounts);
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

  public getAccountBalanceHistory(accountId: number, timedelta: string): Observable<AccountHistory> {
    const params = new HttpParams().set('timedelta', timedelta);
    return this.apiService.get<AccountHistory>(
      AccountsService.DASHBOARD_ENDPOINT + accountId.toString() + '/',
      undefined,
      params
    ).pipe(
      map((response: AccountHistory) => {
        // @ts-ignore
        response.series = response.series.map((elem: SeriesData) => {
          // @ts-ignore
          return {name: new Date(elem.name), value: elem.value};
        });
        return response;
      })
    );
  }
}
