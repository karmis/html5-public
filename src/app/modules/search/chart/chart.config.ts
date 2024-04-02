import {ModuleWithProviders} from '@angular/core';
import {ChartServiceInterface} from './services/chart.service';
import {ChartProviderInterface} from './providers/chart.provider';

export class ChartSettings {
    /**
     * Service for working with Chart
     */
    service?: ChartServiceInterface;

    /**
     * Provider for working with Chart
     */
    provider?: ChartProviderInterface;
    
    lineChartColors?: Array<any>;
    lineChartData?: Array<any>;
    lineChartLabels?: Array<any>;
    chartData?: any;
    chartAxis?: Array<String>;
    chartTitle?: String;
}

export class ChartConfig {
    /**
     * Context of top component
     */
    public componentContext: any;
    /**
     * Context of module
     */
    public moduleContext?: any;

    /**
     * Model of Chart settings
     * @type {{}}
     */
    public options: ChartSettings = {
        lineChartColors: [],
        lineChartData: [],
        lineChartLabels: [],
        chartData: {},
        chartAxis: [],
        chartTitle: ''
    };
}