import { Injectable } from '@angular/core';
import {ApiService} from '../services/apiservice.service';
import {DashboardInterface, SeriesData, StatsResponse} from './dashboard.interface';
import {tap} from 'rxjs/operators';
import {TransactionDetails} from '../common_models/transaction.interface';
import {BehaviorSubject, concat, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  public static DASHBOARD_URL = '/dashboard';
  public static MONTHLY_STAT_URL = DashboardService.DASHBOARD_URL + '/monthly_stats/';
  public static LAST_TRANSACTIONS_URL = DashboardService.DASHBOARD_URL + '/transaction_history/';
  public static EXPENSE_STATS_URL = DashboardService.DASHBOARD_URL + '/expense_stats/';

  private dashData: DashboardInterface = {};
  public dashDataPublisher = new BehaviorSubject<DashboardInterface | null>(null);
  public subCatStatPublisher = new BehaviorSubject<SeriesData[] | null>(null);

  constructor(private readonly apiService: ApiService) {
    this.loadData();
  }

  public loadData(): void {
    concat(
      this.loadMonthlyStats(),
      this.loadLastTransactions(),
      this.loadExpenseStats(),
    ).pipe(
      tap(() => this.dashDataPublisher.next(this.dashData))
    ).subscribe();
  }

  public loadSubCategoryStats(id: number): void {
    this.apiService.get<SeriesData[]>(DashboardService.EXPENSE_STATS_URL + id.toString() + '/').pipe(
      tap((response: SeriesData[]) => this.subCatStatPublisher.next(response))
    ).subscribe();
  }

  private loadMonthlyStats(): Observable<StatsResponse> {
    return this.apiService.get<StatsResponse>(DashboardService.MONTHLY_STAT_URL).pipe(
      tap((response: StatsResponse) => {
        this.dashData.monthlyStats = {
          thisMonth: {...response.thisMonth, sum: response.thisMonth.income - response.thisMonth.expense},
          lastMonth: {...response.lastMonth, sum: response.lastMonth.income - response.lastMonth.expense}
        };
      })
    );
  }

  // TODO send count as query string
  private loadLastTransactions(count: number = 10): Observable<TransactionDetails[]> {
    return this.apiService.get<TransactionDetails[]>(
      DashboardService.LAST_TRANSACTIONS_URL + count.toString() + '/'
    ).pipe(
      tap((response: TransactionDetails[]) => {
        this.dashData.lastTransactions = response;
      })
    );
  }

  private loadExpenseStats(): Observable<SeriesData[]> {
    return this.apiService.get<SeriesData[]>(DashboardService.EXPENSE_STATS_URL).pipe(
      tap((response: SeriesData[]) => this.dashData.expenseByMainCategory = response)
    );
  }
}
