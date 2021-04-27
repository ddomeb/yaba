import { Component, OnInit } from '@angular/core';
import {DashboardInterface} from '../dashboard.interface';
import {BehaviorSubject} from 'rxjs';
import {DashboardService} from '../dashboard.service';


@Component({
  selector: 'app-expense-piechart',
  templateUrl: './expense-piechart.component.html',
  styleUrls: ['./expense-piechart.component.scss']
})
export class ExpensePiechartComponent implements OnInit {
  view: [number, number] = [1000, 400];

  // nameFormatting = function(name: any) { return name + ' HUF'; };

  // options
  gradient = true;
  showLegend = false;
  showLabels = true;
  label = 'Total (HUF)';
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  public data: BehaviorSubject<DashboardInterface | null>;

  constructor(private readonly dashService: DashboardService) {
    this.data = this.dashService.dashDataPublisher;
  }

  nameFormatting(name: string): any { return name + ' (HUF)'; }

  ngOnInit(): void {
  }

  onSelect($event: any): void {
    console.log($event);
  }
}
