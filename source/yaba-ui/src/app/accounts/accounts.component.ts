import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ApiService } from '../services/apiservice.service';
import { BehaviorSubject } from 'rxjs';
import {AccountInfo} from '../common_models/account.interface';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AccountDetailsComponent} from './account-details/account-details.component';
import {switchMap, tap} from 'rxjs/operators';


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
  private static readonly ACCOUNT_ENDPOINT = 'accounts/';
  public accounts: Array<AccountInfo> = [];
  public accountsPublisher: BehaviorSubject<Array<AccountInfo>> = new BehaviorSubject<Array<AccountInfo>>([]);

  constructor(private readonly apiService: ApiService, private modalService: NgbModal) {}

  ngOnInit(): void {
      this.loadAccounts();
  }

  private loadAccounts(): void {
    this.apiService.getWithType<Array<AccountInfo>>(AccountsComponent.ACCOUNT_ENDPOINT).subscribe(
      (response: Array<AccountInfo>) => {
        this.accounts = response;
        this.accountsPublisher.next(this.accounts);
      }
    );
  }

  startEditing(id: number): void {
    const account: AccountInfo | undefined = this.accounts.find(acc => acc.id === id);
    if (!account) {
      console.log('something went wrong');
      return;
    }
    const modalRef = this.modalService.open(AccountDetailsComponent);
    modalRef.componentInstance.account = JSON.parse(JSON.stringify(account));
    modalRef.closed.pipe(
      switchMap( (result: AccountInfo) => this.apiService.put(
        AccountsComponent.ACCOUNT_ENDPOINT +  result.id.toString() + '/', result)
      ),
      tap(() => this.loadAccounts())
    ).subscribe();
    modalRef.dismissed.pipe(
      tap( res => console.log(res))
    ).subscribe();
  }

  newAccount(): void {
    const modalRef = this.modalService.open(AccountDetailsComponent);
    modalRef.componentInstance.account = JSON.parse(JSON.stringify(newAccount));
    modalRef.closed.pipe(
      switchMap( (result: AccountInfo) => this.apiService.post(
        AccountsComponent.ACCOUNT_ENDPOINT, result)
      ),
      tap(() => this.loadAccounts())
    ).subscribe();
    modalRef.dismissed.pipe(
      tap( res => console.log(res))
    ).subscribe();
  }

  deleteAccount(id: number): void {
    this.apiService.delete(AccountsComponent.ACCOUNT_ENDPOINT + id.toString() + '/').pipe(
      tap(() => this.loadAccounts())
    ).subscribe();
  }
}
