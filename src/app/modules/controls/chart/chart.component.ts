/*
 http://www.chartjs.org/docs/ - DOCUMENTATION
 http://valor-software.com/ng2-charts/ - NG WRAPPER
 */
import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import "chart.js";
import {ChartBaseComponent} from "../../abstractions/chart.base.component";
@Component({
  selector: 'chart',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class ChartComponent extends ChartBaseComponent {
    @Input() lineChartData;
    @Input() lineChartLabels;
    @Input() lineChartColors;

    ngOnInit() {
        this.initChart();
    }

    // events
    public chartClicked(e: any): void {
        this.eventClicked.emit(e);
    }

    public chartHovered(e: any): void {
        this.eventHovered.emit(e);
    }

    changeChartType(type) {
        this.lineChartType = type;
    }
}
