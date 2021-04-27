import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LineChartModule, NgxChartsModule} from '@swimlane/ngx-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AccountsComponent} from './accounts/accounts.component';
import {ApiService} from './services/apiservice.service';
import {LoginComponent} from './login/login.component';
import {AuthenticationService} from './services/authentication.service';
import {httpInterceptorProviders} from './http-interceptors';
import {DashboardComponent} from './dashboard/dashboard.component';
import {CategoriesComponent} from './categories/categories.component';
import {AccountDetailsComponent} from './accounts/account-details/account-details.component';
import {RegisterComponent} from './register/register.component';
import {TransactionListComponent} from './accounts/transaction-list/transaction-list.component';
import {AccountBalanceGraphComponent} from './graph-components/account-balance-graph/account-balance-graph.component';
import {AccountBalanceHistoryComponent} from './accounts/account-balance-history/account-balance-history.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TransactionFilterComponent } from './transactions/transaction-filter/transaction-filter.component';
import { NewTransactionComponent } from './transactions/new-transaction/new-transaction.component';
import { SimpleConfirmModalComponent } from './common_components/simple-confirm-modal/simple-confirm-modal.component';
import { CategoryDetailsComponent } from './categories/category-details/category-details.component';
import { NewCategoryComponent } from './categories/new-category/new-category.component';
import { ToastContainerComponent } from './common_components/toast-container/toast-container.component';
import { ExpensePiechartComponent } from './dashboard/expense-piechart/expense-piechart.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountsComponent,
    LoginComponent,
    DashboardComponent,
    CategoriesComponent,
    AccountDetailsComponent,
    RegisterComponent,
    TransactionListComponent,
    AccountBalanceGraphComponent,
    AccountBalanceHistoryComponent,
    TransactionsComponent,
    TransactionFilterComponent,
    NewTransactionComponent,
    SimpleConfirmModalComponent,
    CategoryDetailsComponent,
    NewCategoryComponent,
    ToastContainerComponent,
    ExpensePiechartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    ReactiveFormsModule,
    NgbModule,
    LineChartModule,
    NgxChartsModule,
  ],
  providers: [
    ApiService,
    AuthenticationService,
    httpInterceptorProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
