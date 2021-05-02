import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AuthenticationResponse} from '../common_models/authentication.interface';
import {ToastService} from '../common_components/toast-container/toast.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit {
  public form: FormGroup;
  public showBackendErrors = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly authService: AuthenticationService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {
    this.form = new FormGroup({
      newPassword1: new FormControl(
        '',
        Validators.compose(
          [
            Validators.required,
            Validators.pattern('[A-Za-z+\\-_@][A-Za-z0-9+\\-_@]*|[A-Za-z0-9+\\-_@]*[A-Za-z+\\-_@]'),
            Validators.minLength(8)
          ]
        )
      ),
      newPassword2: new FormControl(
        '',
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(8)
          ]
        )
      ),
      oldPassword: new FormControl(
        '',
        Validators.compose(
          [
            Validators.required,
          ]
        )
      ),
    },
      [this.passwordMatchValidator('newPassword1', 'newPassword2'), ]
    );
  }

  ngOnInit(): void {
  }

  passwordMatchValidator(field1: string, field2: string): ValidatorFn  {
    // tslint:disable-next-line:only-arrow-functions
    return function(frm: AbstractControl): {[key: string]: any} | null {
      if (frm.get(field1) === null || frm.get(field2) === null){
        return  {error: 'missing fields'};
      }
      // tslint:disable-next-line:no-non-null-assertion
      const psw1 = frm.get(field1)!.value;
      // tslint:disable-next-line:no-non-null-assertion
      const psw2 = frm.get(field2)!.value;
      if (psw1 !== '' && psw1 !== psw2) {
        // tslint:disable-next-line:no-non-null-assertion
        frm.get(field2)!.setErrors({ notMatch: 'passwords does not match' });
        return { notMatch: 'passwords does not match' };
      }
      return null;
    };
  }

  onSubmit(): void {
    if (!this.form.valid) { return; }
    this.showBackendErrors.next(false);
    this.authService.changePassword(this.form.value.newPassword1, this.form.value.oldPassword).pipe(
      tap(() => {
        this.form.get('newPassword1')?.setValue('');
        this.form.get('newPassword2')?.setValue('');
        this.form.get('oldPassword')?.setValue('');
      }),
      catchError(err => this.handleError(err)),
    ).subscribe(result => this.handlePassChangeResult(result));
  }

  private handlePassChangeResult(result: any): void {
    if (result === false) {
      return;
    }
    this.authService.clearSessionInfo();
    this.authService.userDataPublisher.next(null);
    this.authService.loggedInPublisher.next(false);
    this.toast.showSuccess('Password changed successfully, please log in!');
    this.router.navigate(['login']);
  }

  private handleError(error: any): Observable<any> {
    if (error.status !== 400) {
      this.toast.showDanger('Something went wrong, please try again later.');
      return of(false);
    }
    if (error.error.new_password1) {
      this.form.controls.newPassword1.setErrors({errors: error.error.new_password1.join(' ')});
      this.showBackendErrors.next(true);
    }
    if (error.error.new_password2) {
      this.form.controls.newPassword2.setErrors({errors: error.error.new_password2.join(' ')});
      this.showBackendErrors.next(true);
    }
    if (error.error.old_password) {
      this.form.controls.oldPassword.setErrors({errors: error.error.old_password.join(' ')});
      this.showBackendErrors.next(true);
    }
    return of(false);
  }
}
