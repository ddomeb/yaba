import { Injectable } from '@angular/core';
import {ApiService} from '../services/apiservice.service';
import {DashboardInterface, GroupedStats, SeriesData, StatsResponse} from './dashboard.interface';
import {tap} from 'rxjs/operators';
import {TransactionDetails} from '../common_models/transaction.interface';
import {BehaviorSubject, concat, Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  public static DASHBOARD_URL = 'dashboard/';
  public static MONTHLY_STAT_URL = DashboardService.DASHBOARD_URL + 'monthly_stats/';
  public static LAST_TRANSACTIONS_URL = DashboardService.DASHBOARD_URL + 'transaction_history/';
  public static EXPENSE_STATS_URL = DashboardService.DASHBOARD_URL + 'expense_stats/';

  private dashData: DashboardInterface = {};
  public dashDataPublisher = new BehaviorSubject<DashboardInterface | null>(null);
  public subCatStatPublisher = new BehaviorSubject<SeriesData[] | null>(null);
  public showPrevMonthData = new BehaviorSubject<boolean>(false);

  constructor(private readonly apiService: ApiService) {
    this.loadData();
  }

  public loadData(): Observable<any> {
    return concat(
      this.loadMonthlyStats(),
      this.loadLastTransactions(),
      this.loadExpenseStats(),
    ).pipe(
      tap(() => this.dashDataPublisher.next(this.dashData))
    );
  }

  public loadSubCategoryStats(id: number): void {
    this.apiService.get<GroupedStats>(DashboardService.EXPENSE_STATS_URL + id.toString() + '/').pipe(
      tap((response: GroupedStats) =>
        this.subCatStatPublisher.next(this.showPrevMonthData.value ? response.prevMonth : response.thisMonth))
    ).subscribe();
  }

  private loadMonthlyStats(): Observable<StatsResponse> {
    return this.apiService.get<StatsResponse>(DashboardService.MONTHLY_STAT_URL).pipe(
      tap((response: StatsResponse) => {
        this.dashData.monthlyStats = {
          thisMonth: {...response.thisMonth, sum: response.thisMonth.income + response.thisMonth.expense},
          lastMonth: {...response.prevMonth, sum: response.prevMonth.income + response.prevMonth.expense}
        };
      })
    );
  }

  private loadLastTransactions(count: number = 10): Observable<TransactionDetails[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.apiService.get<TransactionDetails[]>(
      DashboardService.LAST_TRANSACTIONS_URL, undefined, params
    ).pipe(
      tap((response: TransactionDetails[]) => {
        this.dashData.lastTransactions = response;
      })
    );
  }

  private loadExpenseStats(): Observable<GroupedStats> {
    return this.apiService.get<GroupedStats>(DashboardService.EXPENSE_STATS_URL).pipe(
      tap((response: GroupedStats) => this.dashData.expenseByMainCategory = response)
    );
  }
}
