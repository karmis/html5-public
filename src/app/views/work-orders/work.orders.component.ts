import { ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
// Views
import { ViewsConfig } from '../../modules/search/views/views.config';
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
// constants
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchSettingsProvider } from '../../modules/search/settings/providers/search.settings.provider';
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
import { WorkOrdersViewsProvider } from './providers/views.provider';
import { WorkOrdersSlickGridProvider } from './providers/slick.grid.provider';
import { WorkOrdersService } from './services/work.orders.service';
import { ChangeDetectionStrategy } from '@angular/core';
// Charts
// grid

@Component({
    selector: 'work-orders',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: SlickGridProvider, useClass: WorkOrdersSlickGridProvider},
        {provide: ViewsProvider, useClass: WorkOrdersViewsProvider},
        SlickGridService,
        SearchColumnsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        WorkOrdersService
    ]
})

export class WorkOrdersComponent extends CoreSearchComponent {
    public refreshStarted: boolean = false;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;

    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            appSettings: <AppSettingsInterface>null,
            options: {
                provider: <SearchFormProvider>null,
            },
            searchButtonAlwaysEnabled: false,
            doSearchOnStartup: false
        }
    };

    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'ResourceReq',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };

    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                refreshOnNavigateEnd: true,
                // viewModeSwitcher: false,
                viewMode: 'table',
                searchType: 'resource-req',
                exportPath: 'ResourceReq',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                pager: {
                    enabled: true
                },
                isExpandable: {
                    enabled: true,
                    startState: "collapsed"
                },
                // isDraggable: {
                //     enabled: true,
                // },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.workOrdersSettingsPopup'
                    }
                },
                displayNoRowsToShowLabel: true
            },
            // plugin: <SlickGridConfigPluginSetups>{
            //     multiSelect: true
            // }
        })
    });

    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'ResourceReq',
        }
    };

    protected searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
        options: {
            provider: <SearchSettingsProvider>null
        }
    };

    protected searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: 'adv.recent.searches.work_orders',
            itemsLimit: 10
        }
    };


    constructor(protected viewsProvider: ViewsProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected cdr: ChangeDetectorRef,
                protected injector: Injector) {
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

        // search settings
        this.searchSettingsConfig.options.provider = this.searchSettingsProvider;
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
}
