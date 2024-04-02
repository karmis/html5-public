import * as $ from 'jquery';
import {
    Component,
    Input,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { ChartConfig } from './chart.config'
import { ChartServiceInterface, ChartService } from './services/chart.service';
import { ChartProvider, ChartProviderInterface } from './providers/chart.provider';
import { LookupService } from '../../../services/lookup/lookup.service';
import { BaseSearchUtil } from '../utils/utils';

@Component({
    selector: 'charts',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ChartProvider,
        ChartService,
        LookupService
    ]
})

export class SearchChartComponent extends BaseSearchUtil {
    /**
     * Default config
     * @type {ViewsConfig}
     */
    private config = {
        componentContext: null as any,
        moduleContext: this,
        options: {
            service: null as ChartServiceInterface,
            provider: null as ChartProviderInterface,
            lineChartColors: [],
            lineChartData: [],
            lineChartLabels: [],
            chartData: {},
            chartAxis: [],
            chartTitle: ''
        },
    } as ChartConfig;
    private channels = [];
    private itemTypes = [];
    private filterLoaded = false;
    private isReady: boolean = false;

    /**
     * Extend default config
     * @param config
     */
    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    constructor(private lookupService: LookupService,
                private cdr: ChangeDetectorRef,
                protected service: ChartService,
                protected provider: ChartProvider) {
        super();
    }

    ngOnInit() {
        // Set default provider/services if custom is null
        this.initializeData(this, 'provider');
        this.initializeData(this, 'service');
        this.passConfigToProvider(this);

        const self = this;
        this.lookupService.getLookupsAsync(['Channels', 'ItemTypes']).subscribe((res: any) => {
            self.channels = res[0];
            self.itemTypes = res[1];
            self.filterLoaded = true;
        });

        this.loadDataForChart(false);
    }

    ngAfterViewInit() {
        this.isReady = true;
        this.cdr.detectChanges();
    }

    loadDataForChart(params) {
        this.config.options.provider.loadDataForChart(params);
    }

    selectParam(e, type) {
        this.config.options.provider.selectParam(e, type);
    }
}
