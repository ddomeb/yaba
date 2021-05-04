import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import {AccountInfo} from '../../common_models/account.interface';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AccountsService} from '../accounts.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:align
export class AccountDetailsComponent implements OnInit {
  // @ts-ignore
  @Input() account: AccountInfo;
  @Input() isEdit = true;
  public form: FormGroup;

  ACCOUNT_TYPES = [ 'account', 'savings'];

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly accService: AccountsService,
  ) {
    this.form = new FormGroup({
      name: new FormControl('', Validators.compose(
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      )),
      description: new FormControl('', Validators.compose(
        [
          Validators.required,
          Validators.maxLength(250)
        ]
      )),
      balance: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required)
    });
  }

  public onSubmit(): void {
    if (!this.form.valid) { return; }
    const acc: AccountInfo = {
      name: this.form.value.name,
      description: this.form.value.description,
      balance: this.form.value.balance,
      type: this.form.value.type,
      isEnabled: true,
      id: this.isEdit ? this.account.id : 0,
      created: new Date()
    };
    if (this.isEdit) {
      this.accService.modifyAccount(acc).subscribe(resp => this.activeModal.close('ok')); // TODO: set errors
    }
    else {
      this.accService.addAccount(acc).subscribe(resp => this.activeModal.close('ok'));
    }
  }

  public cancelEdit(): void {
    this.activeModal.dismiss('canceled');
  }

  ngOnInit(): void {
    if (this.isEdit && this.account) {
      this.form.controls.name.setValue(this.account.name);
      this.form.controls.description.setValue(this.account.description);
      this.form.controls.balance.setValue(this.account.balance);
      this.form.controls.type.setValue(this.account.type);
    }
  }
}
