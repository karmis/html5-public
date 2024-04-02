import { ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
// Views
import { ViewsConfig } from '../../modules/search/views/views.config';
import { MisrViewsProvider } from './providers/views.provider';
// Form
import { SearchFormConfig } from '../../modules/search/form/search.form.config';
import { SearchFormProvider } from '../../modules/search/form/providers/search.form.provider';
// Search Modal
// Info Modal
// Search Settings
import { SearchRecentConfig } from '../../modules/search/recent/search.recent.config';
import { SearchRecentProvider } from '../../modules/search/recent/providers/search.recent.provider';

import { SearchAdvancedConfig } from '../../modules/search/advanced/search.advanced.config';
import { SearchAdvancedProvider } from '../../modules/search/advanced/providers/search.advanced.provider';
import { SearchSettingsConfig } from '../../modules/search/settings/search.settings.config';
// Modal
// Search Columns
import { SearchColumnsService } from '../../modules/search/columns/services/search.columns.service';
import { SearchColumnsProvider } from '../../modules/search/columns/providers/search.columns.provider';
// Charts
import { ChartConfig } from '../../modules/search/chart/chart.config';
import { ChartProvider } from '../../modules/search/chart/providers/chart.provider';
// constants
import { MisrAppSettings } from './constants/constants';
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
// grid
import { ExportProvider } from '../../modules/export/providers/export.provider';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchSettingsProvider } from '../../modules/search/settings/providers/search.settings.provider';
import { MisrSlickGridProvider } from './providers/misr.slickgrid.provider';
import { ChartService } from '../../modules/search/chart/services/chart.service';
import { SlickGridProvider } from '../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../modules/search/slick-grid/services/slick.grid.service';
import { CoreSearchComponent } from '../../core/core.search.comp';
import { SlickGridComponent } from '../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from '../../modules/search/slick-grid/slick-grid.config';
import { ViewsProvider } from '../../modules/search/views/providers/views.provider';
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SearchViewsComponent } from "../../modules/search/views/views";
import { SecurityService } from "../../services/security/security.service";
import { MisrService } from './services/service';
import { MisrSearchAdvancedProvider } from './providers/misr.search.advanced.provider';
import { RaiseWorkflowWizzardProvider } from '../../modules/rw.wizard/providers/rw.wizard.provider';
import { SearchAdvancedService } from '../../modules/search/advanced/services/search.advanced.service';
import { ServerGroupStorageService } from '../../services/storage/server.group.storage.service';
import { forkJoin, Observable, Subject } from 'rxjs';
import { SettingsGroupsService } from '../../services/system.config/settings.groups.service';
import {NotificationService} from "../../modules/notification/services/notification.service";
import {HttpErrorResponse} from "@angular/common/http";
import {ErrorMessageResponse} from "../../modules/search/saved/types";

@Component({
    selector: 'misr',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: MisrSlickGridProvider},
        ViewsProvider,
        {provide: ViewsProvider, useClass: MisrViewsProvider},
        SlickGridService,
        MisrAppSettings,
        SearchColumnsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        // SearchAdvancedProvider,
        {provide: SearchAdvancedProvider, useClass: MisrSearchAdvancedProvider},
        SearchAdvancedService,
        ChartProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        ChartService,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        MisrService,
        RaiseWorkflowWizzardProvider
    ]
})

export class MisrComponent extends CoreSearchComponent {
    isChartOpened: boolean = false;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            appSettings: <AppSettingsInterface>null,
            options: {
                provider: <SearchFormProvider>null,
            }
        }
    };
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            isOpen: true,
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: '-4008',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            buildBuilderUIByModel: true,
            advancedSearchMode: 'builder',
            allowEmptyForBuilder: true
        }
    };
    public refreshOn = false;
    public refreshStarted = false;
    public detailsFields: any[];
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                // searchType: 'ScheduleSearch',
                searchType: 'misr',
                exportPath: '-4008',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                pager: {},
                isTree: {
                    enabled: false,
                    startState: 'collapsed',
                    expandMode: 'firstLevel'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.misrSettingsPopup'
                    }
                },
                isExpandable: {
                    enabled: true,
                    startState: 'collapsed'
                },
                displayNoRowsToShowLabel: true
            },
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: '-4008',
        }
    };
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    private searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
        options: {
            provider: <SearchSettingsProvider>null
        }
    };

    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    private searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: 'adv.recent.searches.misr',
            itemsLimit: 10
        }
    };
    /**
     * Chart
     * @type {SearchFormConfig}
     */
    private chartConfig = <ChartConfig>{
        componentContext: this,
        options: {
            provider: <ChartProvider>null,
            //  service: <ChartService>null,
            lineChartColors: [],
            lineChartData: [],
            lineChartLabels: [],
            chartData: {},
            chartAxis: ['Hours', 'Events Count'],
            chartTitle: 'Events distribution'
        }
    };

    constructor(protected viewsProvider: ViewsProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected searchColumnsModalProvider: SearchColumnsProvider,
                protected searchColumnsModalService: SearchColumnsService,
                protected chartProvider: ChartProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: MisrAppSettings,
                public exportProvider: ExportProvider,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected searchAdvancedService: SearchAdvancedService,
                protected settingsGroupsService: SettingsGroupsService,
                protected injector: Injector,
                protected misrService: MisrService) {
        super(injector);
        // super(router, route);


        // grid provider
        // this.searchGridConfig.options.provider = searchGridProvider;
        // this.searchGridConfig.options.service = searchGridService;

        // views provider
        this.searchViewsConfig.options.provider = viewsProvider;


        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // charts
        this.chartConfig.options.provider = this.chartProvider;

        // export
        this.exportProvider.componentContext = this;

        // search settings
        this.searchSettingsConfig.options.provider = this.searchSettingsProvider;

        this.canRaisePreviewWf();


    }

    canRaisePreviewWf() {
        this.misrService.canRaisePreviewWf().subscribe((res: boolean) => {
            (this.slickGridComp.provider as MisrSlickGridProvider).canRaisePreviewWfBool = res;
            this.cdr.markForCheck();
        }, (err: any) => {
            (this.slickGridComp.provider as MisrSlickGridProvider).canRaisePreviewWfBool = false;
            this.cdr.markForCheck();
        })
    }

    onInitCustomAlways() {
        this.initDetailsFields();
    }

    initDetailsFields() {
        forkJoin(
            this.searchAdvancedService.getFields('Media'),
            this.settingsGroupsService.getSettingsUserById('defaultSearchMisrDetailsMediaColumns')
        ).subscribe((data) => {
            this.detailsFields = this.getDetailFields(data);
        });
    }


    getDetailFields(data) {
        let columns = data[0].items || null
            , fields = JSON.parse(data[1][0] && data[1][0].DATA || null);

        if (!fields || !columns) {
            return [];
        }

        return columns.filter(e => fields[fields.indexOf(e.id)]);
    }

    public chartOpened(isOpened) {
        this.isChartOpened = isOpened;
    }

    public doRefresh() {
        let self = this;
        setTimeout(() => {
            self.refreshOn = !self.refreshOn;
            self.slickGridComp.provider.doRefresh('misr');
        }, 0);
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
}
