import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

import {AuthenticationService} from '../services/authentication.service';
import {ToastService} from '../common_components/toast-container/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public showAuthFail = new BehaviorSubject<boolean>(false);
  public showPasswordToggle = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthenticationService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.form.valueChanges.subscribe(() => this.showAuthFail.next(false));
  }

  login(): void {
    if (this.form.valid) {
      this.authService.login(this.form.value.username, this.form.value.password).pipe(
        tap(() => this.form.controls.password.setValue('')),
        tap((result: boolean) => {
          if (result) {
            this.toast.showSuccess('Welcome back!');
            this.router.navigate(['dashboard']);
          }
          else {
            this.showPasswordToggle.next(false);
            this.showAuthFail.next(true);
          }
        })
      ).subscribe();
    }
  }

  ngOnInit(): void {
    if (this.authService.loggedInPublisher.value) {
      this.router.navigate(['dashboard']);
    }
  }
}
