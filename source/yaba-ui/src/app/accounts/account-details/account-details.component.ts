import {Component, Input, OnInit} from '@angular/core';
import {AccountInfo} from '../../common_models/account.interface';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent {
  // @ts-ignore
  @Input() account: AccountInfo;

  ACCOUNT_TYPES = [ 'account', 'savings'];

  constructor(public activeModal: NgbActiveModal) {}

  public onSubmit(): void {
    this.activeModal.close(this.account);
  }

  public cancelEdit(): void {
    this.activeModal.dismiss('canceled');
  }
}
