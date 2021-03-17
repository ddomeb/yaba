import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AccountsComponent } from './accounts/accounts.component';
import { ApiService } from './services/apiservice.service';
import { LoginComponent } from './login/login.component';
import {AuthenticationService} from './services/authentication.service';
import { httpInterceptorProviders } from './http-interceptors';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoriesComponent } from './categories/categories.component';
import { AccountDetailsComponent } from './accounts/account-details/account-details.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountsComponent,
    LoginComponent,
    DashboardComponent,
    CategoriesComponent,
    AccountDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  providers: [
    ApiService,
    AuthenticationService,
    httpInterceptorProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
