import { ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
// Views
import { ViewsConfig } from '../../modules/search/views/views.config';
import { MisrViewsProvider } from './providers/views.provider';
// Grid
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
import { ChartProvider } from '../../modules/search/chart/providers/chart.provider';
// constants
import { MisrAppSettings } from './constants/constants';
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
// grid
import { ExportProvider } from '../../modules/export/providers/export.provider';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchSettingsProvider } from '../../modules/search/settings/providers/search.settings.provider';
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
import { CMViewsProvider } from "./providers/cm.views.provider";
import { CMSlickGridProvider } from "./providers/cm.slickgrid.provider";
import { CMSearchAdvancedProvider } from "./providers/cm.search.advanced.provider";
import { SecurityService } from "../../services/security/security.service";
import {CachemanagerService} from "./services/cachemanager.service";

@Component({
    selector: 'cachemanager',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: CMSlickGridProvider},
        ViewsProvider,
        {provide: ViewsProvider, useClass: CMViewsProvider},
        SlickGridService,
        CachemanagerService,
        MisrAppSettings,
        SearchColumnsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        {provide: SearchAdvancedProvider, useClass: CMSearchAdvancedProvider},
        ChartProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        ChartService,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
    ]
})

export class CacheManagerComponent extends CoreSearchComponent {
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
            restIdForParametersInAdv: 'CacheManagerSearch',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            buildBuilderUIByModel: true,
            advancedSearchMode: 'builder'
        }
    };
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                searchType: 'cache-manager',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                exportPath: 'CacheManagerSearch',
                isThumbnails: true,
                pager: {},
                isTree: {
                    enabled: false,
                    startState: 'collapsed',
                    expandMode: 'firstLevel'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.cacheManagerSettingsPopup'
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
            type: 'CacheManagerSearch',
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
            viewType: 'adv.recent.searches.cachemanager',
            itemsLimit: 10
        }
    };

    constructor(protected viewsProvider: ViewsProvider,
                public searchFormProvider: SearchFormProvider,
                public cachemanagerService: CachemanagerService,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: MisrAppSettings,
                public exportProvider: ExportProvider,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected injector: Injector) {
        super(injector);

        // views provider
        this.searchViewsConfig.options.provider = viewsProvider;

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        this.exportProvider.componentContext = this;

        // search settings
        this.searchSettingsConfig.options.provider = this.searchSettingsProvider;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
}
