import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {SeriesData} from '../dashboard.interface';
import {DashboardService} from '../dashboard.service';

@Component({
  selector: 'app-expense-card-grid',
  templateUrl: './expense-card-grid.component.html',
  styleUrls: ['./expense-card-grid.component.scss']
})
export class ExpenseCardGridComponent implements OnInit {
  view: [number, number] = [1000, 400];
  cardColor = '#232837';

  public data: BehaviorSubject<SeriesData[] | null>;

  constructor(private readonly dashService: DashboardService) {
    this.data = this.dashService.subCatStatPublisher;
  }

  valueFormatting(n: SeriesData): string {
    return n.value.toString() + ' HUF';
  }

  ngOnInit(): void {
  }
}
