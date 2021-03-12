import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ApiService } from "../services/apiservice.service";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsComponent implements OnInit {
  private readonly ACCOUNT_ENDPOINT = "accounts/";
  public accounts: Array<Account> = [];
  public accountsPublisher: BehaviorSubject<Array<Account>> = new BehaviorSubject<Array<Account>>([]);

  constructor(private readonly apiService: ApiService) {}

  ngOnInit() {
      this.loadAccounts();
  }

  private loadAccounts(): void {
    this.apiService.getWithType<Array<Account>>(this.ACCOUNT_ENDPOINT).subscribe(
      (response: Array<Account>) => {
        this.accounts = response;
        this.accountsPublisher.next(this.accounts);
        console.log(response);
        console.log("load accounts");
      }
    )
  }
}
