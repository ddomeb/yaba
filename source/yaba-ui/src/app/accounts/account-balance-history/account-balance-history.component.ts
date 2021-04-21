import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {tap} from 'rxjs/operators';

import {AccountsService} from '../accounts.service';
import {AccountHistory} from '../../common_models/account-history.interface';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-account-balance-history',
  templateUrl: './account-balance-history.component.html',
  styleUrls: ['./account-balance-history.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountBalanceHistoryComponent implements OnChanges {
  // @ts-ignore
  @Input() accountId: number;
  // @ts-ignore
  @Input() data: BehaviorSubject<Array<AccountHistory>>;
  // @ts-ignore
  @Input() dataPublisher: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public activeModal: NgbActiveModal,
    public accountsService: AccountsService
    ){}

  ngOnChanges(): void {
    if (this.data) {
      this.dataPublisher.next(true);
    }
  }
}

