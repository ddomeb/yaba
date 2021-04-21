import {Component, Input} from '@angular/core';
// import {curveStepAfter} from 'd3-shape';

@Component({
  selector: 'app-account-balance-graph',
  templateUrl: './account-balance-graph.component.html',
  styleUrls: ['./account-balance-graph.component.scss']
})
export class AccountBalanceGraphComponent {
  // @ts-ignore
  @Input() data: any[];
  view: [number, number] = [1000, 500];
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'Date';
  yAxisLabel = 'Balance';
  timeline = false;
  // curve = curveStepAfter;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

}
