import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector, OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
// Views
import { ViewsConfig } from '../../modules/search/views/views.config';
import { QueueViewsProvider } from './providers/views.provider';
// Form
import { SearchFormConfig } from '../../modules/search/form/search.form.config';
// Thumbs
import { SearchThumbsProvider } from '../../modules/search/thumbs/providers/search.thumbs.provider';
// Search Settings
import { SearchSettingsConfig } from '../../modules/search/settings/search.settings.config';
// Search Detail
// Search Settings
import { SearchRecentConfig } from '../../modules/search/recent/search.recent.config';
import { SearchRecentProvider } from '../../modules/search/recent/providers/search.recent.provider';

import { SearchAdvancedConfig } from '../../modules/search/advanced/search.advanced.config';
import { QueueSearchAdvancedProvider } from './providers/queue.search.advanced.provider';
// constants
import { QueueAppSettings } from './constants/constants';
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
import { ExportProvider } from '../../modules/export/providers/export.provider';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchSettingsProvider } from '../../modules/search/settings/providers/search.settings.provider';
import { SlickGridProvider } from '../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../modules/search/slick-grid/services/slick.grid.service';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from '../../modules/search/slick-grid/slick-grid.config';
import { SlickGridComponent } from '../../modules/search/slick-grid/slick-grid';
import { CoreSearchComponent } from '../../core/core.search.comp';
import { QueueSlickGridProvider } from './providers/queue.slick.grid.provider';
import { ViewsProvider } from '../../modules/search/views/providers/views.provider';
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SearchViewsComponent } from "../../modules/search/views/views";
import { QueueSearchRecentProvider } from "../../modules/search/recent/providers/queue.search.recent.provider";
import { QueueParamsComponent } from "./components/queue.params.component/queue.params.component";
import { SecurityService } from "../../services/security/security.service";
import { QueueSearchFormProvider } from "./providers/queue.search.form.provider";
import { SearchFormProvider } from "../../modules/search/form/providers/search.form.provider";
import { SearchAdvancedProvider } from '../../modules/search/advanced/providers/search.advanced.provider';
import { QueuesService } from './services/queue.service';
import { ServerStorageService } from '../../services/storage/server.storage.service';
import { PREFERENCES } from '../system/config/comps/settings.groups/comps/details/preferences.const';

@Component({
    selector: 'queue',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        ViewsProvider,
        {provide: ViewsProvider, useClass: QueueViewsProvider},
        QueueAppSettings,
        SearchThumbsProvider,
        SearchRecentProvider,
        {provide: SearchRecentProvider, useClass: QueueSearchRecentProvider},
        SearchAdvancedProvider,
        QueueSearchAdvancedProvider,
        {provide: SearchAdvancedProvider, useClass: QueueSearchAdvancedProvider},
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: QueueSlickGridProvider},
        SlickGridService,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        SearchSettingsProvider,
        QueuesService,
        {provide: SearchFormProvider, useClass: QueueSearchFormProvider}
    ]
})

export class QueueComponent extends CoreSearchComponent implements OnInit, AfterViewInit {
    public refreshOn = false;
    public refreshStarted = false;
    public isReady: boolean = false;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('queueParamsPanel', {static: false}) queueParamsPanel: QueueParamsComponent;
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
                provider: <SearchFormProvider>null
            },
            searchButtonAlwaysEnabled: true
        },
        customQueryParams: []
    };
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <QueueSearchAdvancedProvider>null,
            restIdForParametersInAdv: 'AutomatedTask',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };
    public daysOffset = 2;
    /**
     * Grid
     * @type {SlickGridConfig}
     */
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                savedSearchType: 'AutomatedTask',
                searchType: 'queue',
                exportPath: 'AutomatedTask',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                reorderRows: true,
                pager: {},
                isTree: {
                    enabled: false,
                    startState: 'collapsed',
                    expandMode: 'firstLevel'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.queueSettingsPopup'
                    }
                },
                displayNoRowsToShowLabel: true
            },
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'AutomatedTask',
        }
    };
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    private searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };
    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    private searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: 'adv.recent.searches.queue',
            itemsLimit: 10
        }
    };
    private isOpenQueueParams = false; // default

    constructor(protected searchThumbsProvider: SearchThumbsProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: QueueSearchAdvancedProvider,
                protected appSettings: QueueAppSettings,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                public exportProvider: ExportProvider,
                private serverStorageService: ServerStorageService,
                public cdr: ChangeDetectorRef,
                protected injector: Injector) {
        super(injector);

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        this.exportProvider.componentContext = (<CoreSearchComponent>this);
        this.isReady = true;
    }

    ngOnInit() {
        super.ngOnInit();
    }
    ngAfterViewInit() {
        this.serverStorageService.retrieve([PREFERENCES.workflowQueuesSettings]).subscribe(saveIds => {
            if (saveIds[0] && saveIds[0].Value && saveIds[0].Value.length) {
                const settings = JSON.parse(saveIds[0].Value);

                this.refreshOn = settings.refreshOn;
                if (this.refreshOn) {
                    this.slickGridComp.provider.doRefresh('queue');
                }
                this.daysOffset = settings.daysOffset;
            }
        });
    }

    public doRefresh() {
        let self = this;
        setTimeout(() => {
            self.refreshOn = !self.refreshOn;
            self.slickGridComp.provider.doRefresh('queue');
        }, 0);
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    /**
     * Handler for QueueParamsComponent emitter
     */
    private selectQueueParam(event) {
        this.searchAdvancedProvider.setCustomFields(event.queueParams);
    }

    toggleQueueParams() {
        this.isOpenQueueParams = !this.isOpenQueueParams;
    }

    onSelectDaysOffset(day) {
        this.saveSettings();
    }

    saveSettings() {
        const settings = {
            refreshOn: this.refreshOn,
            daysOffset: this.daysOffset
        };
        this.serverStorageService.store(PREFERENCES.workflowQueuesSettings, settings).subscribe();
    }

}
