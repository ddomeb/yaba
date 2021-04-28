import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardInterface, SeriesData} from '../dashboard.interface';
import {DashboardService} from '../dashboard.service';

@Component({
  selector: 'app-expense-card-grid',
  templateUrl: './expense-card-grid.component.html',
  styleUrls: ['./expense-card-grid.component.scss']
})
export class ExpenseCardGridComponent implements OnInit {
  view: [number, number] = [1000, 400];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  cardColor = '#232837';

  public data: BehaviorSubject<SeriesData[] | null>;

  constructor(private readonly dashService: DashboardService) {
    this.data = this.dashService.subCatStatPublisher;
  }

  ngOnInit(): void {
  }

  onSelect($event: any): void {
    console.log($event);
  }

}
