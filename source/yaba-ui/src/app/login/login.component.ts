import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthenticationService,
    private readonly router: Router
  ) {

    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    const formData = this.form.value;
    if (formData.username && formData.password) {
      this.authService.login(formData.username, formData.password).subscribe(
          () => this.router.navigateByUrl('/')
        );
    }
  }

  ngOnInit(): void {
    if (this.authService.loggedInPublisher.value) {
      this.router.navigateByUrl('dashboard');
    }
  }
}
