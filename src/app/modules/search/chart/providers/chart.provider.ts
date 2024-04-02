import { Injectable } from '@angular/core';
import { ChartConfig } from '../chart.config';

export interface ChartProviderInterface {
    config: ChartConfig;
    selectedChannel;
    selectedType;
    tmpReadyCount;
    tmpWarnCount;
    tmpErrorCount;
    tmpColors;

    /*
    * load Data For Chart
    */
    loadDataForChart(params): void;

    /*
    * select filter
    */
    selectParam(e, type): void;

    getIsReady(): boolean;
}

@Injectable()
export class ChartProvider implements ChartProviderInterface {
    config: ChartConfig;
    selectedChannel = '';
    selectedType = '';
    tmpReadyCount = {data: [], label: 'Ready'};
    tmpWarnCount = {data: [], label: 'Warning'};
    tmpErrorCount = {data: [], label: 'Problem'};
    tmpColors = [
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

    loadDataForChart(params): void {
        const self = this;
        this.config.options.service.getChartData(params).subscribe(
            (res: any) => {
                this.tmpReadyCount.data = [];
                this.tmpWarnCount.data = [];
                this.tmpErrorCount.data = [];
                if (res && res.length > 0) {
                    const tmpLabels = [];
                    const tmpDataArr = [];
                    for (let i = 0; i < res.length; i++) {
                        tmpLabels.push(res[i].Period);
                        this.tmpReadyCount.data.push(res[i].ReadyCount);
                        this.tmpWarnCount.data.push(res[i].WarnCount);
                        this.tmpErrorCount.data.push(res[i].ErrorCount);
                    }
                    tmpDataArr.push(this.tmpReadyCount);
                    tmpDataArr.push(this.tmpWarnCount);
                    tmpDataArr.push(this.tmpErrorCount);
                    self.config.options.lineChartColors = this.tmpColors;
                    self.config.options.lineChartData = tmpDataArr;
                    self.config.options.lineChartLabels = tmpLabels;
                    self.config.options.chartData = {
                        cd: self.config.options.lineChartData,
                        cl: self.config.options.lineChartLabels,
                        cc: self.config.options.lineChartColors
                    };
                } else {
                    self.config.options.chartData = {
                        cd: [this.tmpReadyCount, this.tmpWarnCount, this.tmpErrorCount],
                        cl: [''],
                        cc: this.tmpColors
                    };
                }
            }
        );
    }

    selectParam(e, type): void {
        if (type) {
            this.selectedType = e.target.value;
        } else {
            this.selectedChannel = e.target.value;
        }
        const paramsObject = {
            channel: this.selectedChannel,
            form: this.selectedType
        };
        this.loadDataForChart(paramsObject);
    }

    getIsReady(): boolean {
        return (this.config) ? this.config.moduleContext.isReady : false;
    }
}
