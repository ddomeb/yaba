import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';

import {ApiService} from '../services/apiservice.service';
import {PaginatedTransactionList, TransactionInfo} from '../common_models/transaction.interface';
import {MainCategory, MainCategoryDetails} from '../common_models/category.interface';
import {AccountInfo} from '../common_models/account.interface';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private static readonly TRANSACTIONS_ENDPOINT = 'transactions/';
  private static readonly CATEGORIES_ENDPOINT = 'categories/';
  private static readonly ACCOUNTS_ENDPOINT = 'accounts/';

  private transactions: PaginatedTransactionList | null = null;
  private mainCategories: MainCategory[] = [];
  private accounts: AccountInfo[] = [];
  private currentMainCategoryDetails: MainCategoryDetails | null = null;
  public mainCategoriesPublisher = new BehaviorSubject<MainCategory[]>([]);
  public incomeCategoriesPublisher = new BehaviorSubject<MainCategory[]>([]);
  public expenseCategoriesPublisher = new BehaviorSubject<MainCategory[]>([]);
  public currentMainCategoryPublisher = new BehaviorSubject<MainCategoryDetails | null>(this.currentMainCategoryDetails);
  public transactionsPublisher = new BehaviorSubject<PaginatedTransactionList | null>(this.transactions);
  public accountsPublisher = new BehaviorSubject<AccountInfo[]>(this.accounts);

  constructor(private readonly apiService: ApiService) { }

  public queryTransactions(
    page?: number,
    datefrom?: Date,
    dateto?: Date,
    account?: string,
    category?: string,
    subcategory?: string,
    direction?: 'in' | 'out',
  ): Observable<PaginatedTransactionList> {
    let params = new HttpParams();
    params = datefrom ? params.set('datefrom', datefrom.toISOString()) : params;
    params = dateto ? params.set('dateto', dateto.toISOString()) : params;
    params = account ? params.set('account', account) : params;
    params = category ? params.set('category', category) : params;
    params = subcategory ? params.set('subcategory', subcategory) : params;
    params = direction ? params.set('direction', direction) : params;

    page = page ? page : 1;
    return  this.queryTransactionsWithPagination(params, page).pipe(
      tap((results: PaginatedTransactionList) => {
        this.transactions = results;
        this.transactionsPublisher.next(this.transactions);
      })
    );
  }

  public addTransaction(transaction: TransactionInfo): Observable<any> {
    return this.apiService.post(
      TransactionService.TRANSACTIONS_ENDPOINT,
      transaction
    );
  }

  public deleteTransaction(transactionId: number): Observable<any> {
    return this.apiService.delete(
      TransactionService.TRANSACTIONS_ENDPOINT + transactionId.toString() + '/'
    );
  }

  private queryTransactionsWithPagination(params: HttpParams, page: number): Observable<PaginatedTransactionList>  {
    params = params.set('page', page.toString());
    return this.apiService.get<PaginatedTransactionList>(
      TransactionService.TRANSACTIONS_ENDPOINT,
      undefined,
      params
    );
  }

  public loadMainCategories(): Observable<any> {
    return this.apiService.get<Array<MainCategory>>(TransactionService.CATEGORIES_ENDPOINT).pipe(
      tap((response: Array<MainCategory>) => {
        this.mainCategories = response;
        this.mainCategoriesPublisher.next(this.mainCategories);
        this.incomeCategoriesPublisher.next(response.filter(val => val.isIncome));
        this.expenseCategoriesPublisher.next(response.filter(val => !val.isIncome));
      })
    );
  }

  public loadAccounts(): Observable<any> {
    return this.apiService.get<Array<AccountInfo>>(TransactionService.ACCOUNTS_ENDPOINT).pipe(
      tap((response: Array<AccountInfo>) => {
        this.accounts = response;
        this.accountsPublisher.next(this.accounts);
      })
    );
  }

  public loadSubcategories(mainCategoryId: null | string): Observable<any> {
    if (mainCategoryId === null){
      this.currentMainCategoryDetails = null;
      this.currentMainCategoryPublisher.next(this.currentMainCategoryDetails);
      return of(this.currentMainCategoryDetails);
    }
    return this.apiService.get<MainCategoryDetails>(
      TransactionService.CATEGORIES_ENDPOINT + mainCategoryId + '/'
    ).pipe(
      tap((response: MainCategoryDetails) => {
        this.currentMainCategoryDetails = response;
        this.currentMainCategoryPublisher.next(this.currentMainCategoryDetails);
      })
    );
  }

}
