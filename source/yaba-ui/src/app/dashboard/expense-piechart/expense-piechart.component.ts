import { Component } from '@angular/core';
import {DashboardInterface} from '../dashboard.interface';
import {BehaviorSubject} from 'rxjs';
import {DashboardService} from '../dashboard.service';


@Component({
  selector: 'app-expense-piechart',
  templateUrl: './expense-piechart.component.html',
  styleUrls: ['./expense-piechart.component.scss']
})
export class ExpensePiechartComponent {
  view: [number, number] = [1000, 400];
  gradient = true;
  showLegend = false;
  showLabels = true;
  label = 'Total (HUF)';

  public data: BehaviorSubject<DashboardInterface | null>;
  public showPrevMonthData: BehaviorSubject<boolean>;

  constructor(private readonly dashService: DashboardService) {
    this.data = this.dashService.dashDataPublisher;
    this.showPrevMonthData = this.dashService.showPrevMonthData;
  }

  nameFormatting(name: string): any { return name + ' (HUF)'; }

  onSelect($event: any): void {
    this.dashService.loadSubCategoryStats($event.extra.id);
  }
}
