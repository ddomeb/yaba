import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {AccountInfo} from '../common_models/account.interface';
import {AccountDetailsComponent} from './account-details/account-details.component';
import {AccountsService} from './accounts.service';
import {TransactionListComponent} from './transaction-list/transaction-list.component';
import {AccountBalanceHistoryComponent} from './account-balance-history/account-balance-history.component';
import {AccountHistory} from '../common_models/account-history.interface';
import {SimpleConfirmModalComponent} from '../common_components/simple-confirm-modal/simple-confirm-modal.component';


const newAccount: AccountInfo =  {
  name: '',
  description: '',
  balance: 0,
  type: 'account',
  isEnabled: true,
  id: -1,
  created: new Date()
};

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsComponent implements OnInit {
  public accountsPublisher: BehaviorSubject<Array<AccountInfo>> = new BehaviorSubject<Array<AccountInfo>>([]);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.accountsService.loadAccounts();
    this.accountsPublisher = this.accountsService.accountsPublisher;
  }

  public startEditing(id: number): void {
    const account: AccountInfo | undefined = this.accountsService.getAccountById(id);
    if (!account) {
      return;
    }
    const modalRef = this.modalService.open(AccountDetailsComponent);
    modalRef.componentInstance.account = JSON.parse(JSON.stringify(account));
    modalRef.componentInstance.isEdit = true;
    // modalRef.componentInstance.setInfo();
  }

  public newAccount(): void {
    const modalRef = this.modalService.open(AccountDetailsComponent);
    modalRef.componentInstance.isEdit = false;
  }

  public deleteAccount(id: number): void {
    const modalRef = this.modalService.open(SimpleConfirmModalComponent);
    modalRef.componentInstance.message = 'Are you sure you want to delete this account?'
      + '\nThis will also delete all transactions associated with it.';
    modalRef.closed.pipe(
      switchMap((result: string) => result === 'ok' ? this.accountsService.deleteAccount(id) : of(result))
    ).subscribe();
  }

  public showTransactions(account: AccountInfo): void {
    const modalRef = this.modalService.open(TransactionListComponent, {size: 'lg'});
    modalRef.componentInstance.account = account;
  }

  public showAccountHistory(id: number): void {
    this.accountsService.getAccountBalanceHistory(id, 'week').pipe(
      tap((response: AccountHistory) => {
        const modalRef = this.modalService.open(AccountBalanceHistoryComponent, {size: 'xl'});
        modalRef.componentInstance.accountId = id;
        modalRef.componentInstance.data =  new BehaviorSubject<Array<AccountHistory>>([response, ]);
        modalRef.componentInstance.dataPublisher.next(true);
      }),
    ).subscribe();
  }
}
