import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AccountsComponent} from './accounts/accounts.component';
import {LoginComponent} from './login/login.component';
import {CategoriesComponent} from './categories/categories.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TransactionsComponent} from './transactions/transactions.component';
import {RegisterComponent} from './register/register.component';
import {AboutComponent} from './about/about.component';
import {PasswordChangeComponent} from './password-change/password-change.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'accounts', component: AccountsComponent},
  { path: 'categories', component: CategoriesComponent},
  { path: 'dashboard', component: DashboardComponent},
  { path: 'transactions', component: TransactionsComponent},
  { path: 'about', component: AboutComponent},
  { path: 'changePassword', component: PasswordChangeComponent},
  // { path: '**', component:  PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
