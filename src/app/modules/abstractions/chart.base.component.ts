import {EventEmitter, Input, Output} from '@angular/core';

export abstract class ChartBaseComponent {
    @Input() showButtons;
    @Input() selectedType;
    @Input() chartAxisNames: any[];
    @Input() chartName: string;

    @Output() eventClicked: EventEmitter<any> = new EventEmitter();
    @Output() eventHovered: EventEmitter<any> = new EventEmitter();

    private _chartName;
    private _xAxis = '';
    private _yAxis = '';
    public lineChartLegend: boolean;
    public lineChartType: string;
    public lineChartOptions: any;

    protected initChart() {
        if (this.chartName) {
            this._chartName = this.chartName;
        } else {
            this._chartName = 'Chart';
        }
        this._xAxis = (this.chartAxisNames && this.chartAxisNames.length > 0 ? this.chartAxisNames[0] : '');
        this._yAxis = (this.chartAxisNames && this.chartAxisNames.length > 1 ? this.chartAxisNames[1] : '')

        this.lineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: this._xAxis
                    }
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: this._yAxis
                    }
                }]
            }
        };
        this.lineChartLegend = true;
        this.lineChartType = 'line';
    }
}
