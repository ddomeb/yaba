import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {tap} from 'rxjs/operators';

import {PaginatedTransactionList} from '../../common_models/transaction.interface';
import {AccountsService} from '../accounts.service';
import {AccountInfo} from '../../common_models/account.interface';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  // @ts-ignore
  @Input() account: AccountInfo;

  public currentPagePublisher: BehaviorSubject<PaginatedTransactionList>;
  public currentPage = 1;
  public showPaginationLinks: BehaviorSubject<{next: boolean, prev: boolean}>;
  private currentTransactionPage: PaginatedTransactionList;

  constructor(
    public activeModal: NgbActiveModal,
    private accountsService: AccountsService,
    ) {
    this.currentTransactionPage = {results: [], pages: 0, count: 0};
    this.currentPagePublisher = new BehaviorSubject<PaginatedTransactionList>(this.currentTransactionPage);
    this.showPaginationLinks = new BehaviorSubject<{next: boolean; prev: boolean}>(
      {next: false, prev: false}
    );
  }

  ngOnInit(): void {
    this.getPageData();
  }

  public changePage(direction: number): void {
    this.currentPage += direction;
    this.getPageData();
  }

  public dismiss(): void {
    this.activeModal.dismiss('closed');
  }

  private getPageData(): void {
    this.accountsService.getTransactions(this.account.id, this.currentPage).pipe(
      tap((response: PaginatedTransactionList) => {
        this.currentTransactionPage = response;
        this.currentPagePublisher.next(this.currentTransactionPage);
        this.setPaginationLinkVisibility();
      })
    ).subscribe();
  }

  private setPaginationLinkVisibility(): void {
    this.showPaginationLinks.next(
      {
        prev: this.currentPage > 1,
        next: this.currentPage < this.currentTransactionPage.pages
      }
    );
  }

}
