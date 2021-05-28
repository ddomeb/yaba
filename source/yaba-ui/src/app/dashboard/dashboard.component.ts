import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

import {DashboardInterface, SeriesData} from './dashboard.interface';
import {DashboardService} from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  public dashDataPublisher: BehaviorSubject<DashboardInterface | null>;
  public subCatStatPublisher: BehaviorSubject<SeriesData[] | null>;
  public showPrevMonthData: BehaviorSubject<boolean>;

  constructor(private readonly dashService: DashboardService) {
    this.dashDataPublisher = this.dashService.dashDataPublisher;
    this.subCatStatPublisher = this.dashService.subCatStatPublisher;
    this.showPrevMonthData = this.dashService.showPrevMonthData;
  }

  ngOnInit(): void {
    this.dashService.loadData().subscribe();
  }

  changeStatsMonth(s: string): void {
    this.dashService.changeStatsMonth(s);
  }
}
