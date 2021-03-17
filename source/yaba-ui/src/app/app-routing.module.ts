import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AccountsComponent} from './accounts/accounts.component';
import {LoginComponent} from './login/login.component';
import {CategoriesComponent} from './categories/categories.component';
import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [

  { path: 'login', component: LoginComponent},
  { path: 'accounts', component: AccountsComponent},
  { path: 'categories', component: CategoriesComponent},
  { path: 'dashboard', component: DashboardComponent},
  // { path: '**', component:  PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
