import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {TransactionService} from './transaction.service.';
import {PaginatedTransactionList} from '../common_models/transaction.interface';
import {BehaviorSubject, concat, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {FilterParams} from './filter-params.interface';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NewTransactionComponent} from './new-transaction/new-transaction.component';
import {SimpleConfirmModalComponent} from '../common_components/simple-confirm-modal/simple-confirm-modal.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, OnDestroy {
  public transactionPublisher: BehaviorSubject<PaginatedTransactionList | null>;
  public currentPage = 1;
  public showPaginationLinks: {next: boolean, previous: boolean} = {next: false, previous: false};
  public showPaginationLinksPublisher =
    new  BehaviorSubject<{next: boolean, previous: boolean}>(this.showPaginationLinks);

  private currentFilterParams: FilterParams = {
    dateFrom: undefined,
    dateTo: undefined,
    direction: undefined,
    accountId: undefined,
    mainCategoryId: undefined,
    subcategoryId: undefined
  };

  constructor(
    private readonly transactionService: TransactionService,
    private readonly modalService: NgbModal
    ) {
    this.transactionPublisher = transactionService.transactionsPublisher;
  }

  ngOnInit(): void {
    concat(
      this.transactionService.loadAccounts(),
      this.transactionService.loadMainCategories(),
      this.transactionService.queryTransactions(this.currentPage).pipe(
        tap((response: PaginatedTransactionList) => {
          this.showPaginationLinks = {
            next: response.pages > this.currentPage,
            previous: this.currentPage > 1
          };
          this.showPaginationLinksPublisher.next(this.showPaginationLinks);
        })
    )).subscribe();
  }

  public revertTransaction(transactionId: number): void {
    const modal = this.modalService.open(SimpleConfirmModalComponent);
    modal.componentInstance.message = 'Are you sure you want to revert this transaction?';
    modal.closed.pipe(
      switchMap((result: string) => result === 'ok' ?
        concat(
          this.transactionService.deleteTransaction(transactionId),
          this.transactionService.queryTransactions(this.currentPage)
        )
        : of(false)),
    ).subscribe();
  }

  public changePage(page: 1 | -1 | 0): void {
    this.transactionService.queryTransactions(
      this.currentPage + page,
      this.currentFilterParams.dateFrom,
      this.currentFilterParams.dateTo,
      this.currentFilterParams.accountId,
      this.currentFilterParams.mainCategoryId,
      this.currentFilterParams.subcategoryId,
      this.currentFilterParams.direction
      ).pipe(
      tap((response: PaginatedTransactionList) => {
        this.currentPage += page;
        this.showPaginationLinks = {
          next: response.pages > this.currentPage,
          previous: this.currentPage > 1
        };
        this.showPaginationLinksPublisher.next(this.showPaginationLinks);
      })
    ).subscribe();
  }

  queryTransactions($event: FilterParams): void {
    this.transactionService.queryTransactions(
      1,
      $event.dateFrom,
      $event.dateTo,
      $event.accountId,
      $event.mainCategoryId,
      $event.subcategoryId,
      $event.direction
    ).pipe(
      tap((response: PaginatedTransactionList) => {
        this.currentFilterParams = $event;
        this.currentPage = 1;
        this.showPaginationLinks = {
          next: response.pages > this.currentPage,
          previous: this.currentPage > 1
        };
        this.showPaginationLinksPublisher.next(this.showPaginationLinks);
      })
    ).subscribe();
  }

  public addNewTransaction(dir: 'income' | 'expense'): void {
    const modalref = this.modalService.open(NewTransactionComponent, {size: 'lg'});
    modalref.componentInstance.isIncome = dir === 'income';
    modalref.closed.pipe(
      tap((response: string) => {
        if (response === 'ok') {
          this.changePage(0);
        }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
    }
  }

}
