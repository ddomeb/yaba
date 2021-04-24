import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {RegisterService} from './register.service';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {catchError, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';
import {AuthenticationResponse} from '../common_models/authentication.interface';
import {Router} from '@angular/router';
import {ToastService} from '../common_components/toast-container/toast.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private readonly registerService: RegisterService,
    private readonly authService: AuthenticationService,
    private readonly router: Router,
    private readonly toast: ToastService,
  ) {
    this.form = new FormGroup(
        {
        username: new FormControl(
          '',
          Validators.compose(
            [
              Validators.required,
              Validators.pattern('[A-Za-z0-9@.+-_]+')
            ]
          )
        ),
        email: new FormControl(
          '',
          Validators.compose(
            [
              Validators.required,
              Validators.email
            ]
          )
        ),
        password1: new FormControl(
          '',
          Validators.compose(
            [
              Validators.required,
              Validators.pattern('[A-Za-z+\\-_@][A-Za-z0-9+\\-_@]*|[A-Za-z0-9+\\-_@]*[A-Za-z+\\-_@]'),
              Validators.minLength(8)
            ]
          )
        ),
        password2: new FormControl(
          '',
          Validators.compose(
            [
              Validators.required,
              Validators.minLength(8)
            ]
          )
        )
      },
      [this.passwordMatchValidator('password1', 'password2'), ]
    );
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


  ngOnInit(): void {
  }

  onSubmit(): void {
    if (!this.form.valid) { return; }

    this.registerService.sendRegistration(this.form.value.username, this.form.value.password1, this.form.value.email).pipe(
      tap(() => {
        this.form.get('password1')?.setValue('');
        this.form.get('password2')?.setValue('');
      }),
      tap(res => console.log('tap tap')),
      catchError(err => this.handleError(err))
    ).subscribe(result => this.handleRegistrationResult(result));
  }

  private handleRegistrationResult(result: any): void {
    if (result === false) {
      return;
    }
    const response = result as AuthenticationResponse;
    AuthenticationService.setSession(response);
    this.authService.loggedInPublisher.next(true);
    this.toast.showSuccess('Registration successful, Welcome!');
    this.router.navigateByUrl('/');
  }

  private handleError(error: any): Observable<any> {
    if (error.status !== 400) {
      this.toast.showDanger('Something went wrong, please try again later.');
      return of(false);
    }
    if (error.error.email) {
      this.form.get('email')?.setErrors({errors: error.error.email});
    }
    if (error.error.username) {
      this.form.get('username')?.setErrors({errors: error.error.usrname});
    }
    if (error.error.password) {
      this.form.get('password1')?.setErrors({errors: error.error.password});
    }
    return of(false);
  }
}
