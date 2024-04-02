import {
  Component, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Input, Output,
  EventEmitter, ViewChild
} from '@angular/core';
import {MisrSearchService} from "../../../../services/viewsearch/misr.service";
import "chart.js";
import { OverlayComponent } from '../../../../modules/overlay/overlay';
import {ChartBaseComponent} from "../../../../modules/abstractions/chart.base.component";
@Component({
  moduleId: 'chart',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss',
    '../../../../modules/styles/index.scss'
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  providers: [
    MisrSearchService
  ]
})
export class ChartDashComponent extends ChartBaseComponent {

    constructor(private misrService: MisrSearchService,
                private cd: ChangeDetectorRef) {
        super();
    }

    @ViewChild('overlay', {static: false}) private overlay: OverlayComponent;
    @ViewChild('cahartwrapper', {static: false}) private cahartwrapper: any;

    private lineChartData = [{data: [], label: 'Ready'}, {data: [], label: 'Warning'}, {data: [], label: 'Problem'}];
    private lineChartLabels = [''];
    private lineChartColors = [{ // Ready
        backgroundColor: '#5cb85c',
        borderColor: '#3f7e3f',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
        { // Warning
            backgroundColor: '#ffb84c',
            borderColor: '#885300',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        { // Error
            backgroundColor: '#ff8884',
            borderColor: '#a13232',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }];

    ngOnInit() {

        this.loadDataForChart(null);
    }

    ngAfterViewInit() {
        // this.overlay.show(this.cahartwrapper.nativeElement);
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

    loadDataForChart(params) {
        let self = this;
        this.misrService.getChartData(params).subscribe(
            (res: any) => {
                if (res && res.length > 0) {
                    let tmpLabels = [];
                    let tmpDataArr = [];
                    let tmpReadyCount = {data: [], label: 'Ready'};
                    let tmpWarnCount = {data: [], label: 'Warning'};
                    let tmpErrorCount = {data: [], label: 'Problem'};
                    for (let i = 0; i < res.length; i++) {
                        tmpLabels.push(res[i].Period);
                        tmpReadyCount.data.push(res[i].ReadyCount);
                        tmpWarnCount.data.push(res[i].WarnCount);
                        tmpErrorCount.data.push(res[i].ErrorCount);
                    }
                    tmpDataArr.push(tmpReadyCount);
                    tmpDataArr.push(tmpWarnCount);
                    tmpDataArr.push(tmpErrorCount);
                    let tmpColors = [
                        { // Ready
                            backgroundColor: '#5cb85c',
                            borderColor: '#3f7e3f',
                            pointBackgroundColor: 'rgba(148,159,177,1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                        },
                        { // Warning
                            backgroundColor: '#ffb84c',
                            borderColor: '#885300',
                            pointBackgroundColor: 'rgba(77,83,96,1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(77,83,96,1)'
                        },
                        { // Error
                            backgroundColor: '#ff8884',
                            borderColor: '#a13232',
                            pointBackgroundColor: 'rgba(148,159,177,1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                        }
                    ];
                    self.lineChartData = tmpDataArr;
                    self.lineChartLabels = tmpLabels;
                    self.lineChartColors = tmpColors;
                    self.cd.markForCheck();
                } else {
                    let tmpReadyCount = {data: [], label: 'Ready'};
                    let tmpWarnCount = {data: [], label: 'Warning'};
                    let tmpErrorCount = {data: [], label: 'Problem'};
                    let tmpColors = [
                        { // Ready
                            backgroundColor: '#5cb85c',
                            borderColor: '#3f7e3f',
                            pointBackgroundColor: 'rgba(148,159,177,1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                        },
                        { // Warning
                            backgroundColor: '#ffb84c',
                            borderColor: '#885300',
                            pointBackgroundColor: 'rgba(77,83,96,1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(77,83,96,1)'
                        },
                        { // Error
                            backgroundColor: '#ff8884',
                            borderColor: '#a13232',
                            pointBackgroundColor: 'rgba(148,159,177,1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                        }
                    ];

                    self.lineChartData = [tmpReadyCount, tmpWarnCount, tmpErrorCount];
                    self.lineChartLabels = [''];
                    self.lineChartColors = tmpColors;
                    self.cd.markForCheck();
                }
                self.initChart();
                if (this.selectedType)
                    this.lineChartType = this.selectedType;
            }
        );
    }
}
