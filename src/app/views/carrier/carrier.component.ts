import { ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
// Views
import {ViewsConfig} from '../../modules/search/views/views.config';
import {CarrierViewsProvider} from './providers/views.provider';
// Form
import {SearchFormConfig} from '../../modules/search/form/search.form.config';
import {SearchFormProvider} from '../../modules/search/form/providers/search.form.provider';
// Search Settings
import {SearchSettingsConfig} from '../../modules/search/settings/search.settings.config';
// Search Settings
import {SearchRecentConfig} from '../../modules/search/recent/search.recent.config';
import {SearchRecentProvider} from '../../modules/search/recent/providers/search.recent.provider';

import {SearchAdvancedConfig} from '../../modules/search/advanced/search.advanced.config';
import {SearchAdvancedProvider} from '../../modules/search/advanced/providers/search.advanced.provider';
// constants
import {CarrierAppSettings} from './constants/constants';
import {AppSettingsInterface} from '../../modules/common/app.settings/app.settings.interface';
import {SearchColumnsProvider} from '../../modules/search/columns/providers/search.columns.provider';
import {SearchColumnsService} from '../../modules/search/columns/services/search.columns.service';
import {ExportProvider} from '../../modules/export/providers/export.provider';
import {SearchSettingsProvider} from '../../modules/search/settings/providers/search.settings.provider';
import {CarrierSlickGridProvider} from './providers/carrier.slick.grid.provider';
import {SlickGridProvider} from '../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../modules/search/slick-grid/services/slick.grid.service';
import {CoreSearchComponent} from '../../core/core.search.comp';
import {SlickGridComponent} from '../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../modules/search/slick-grid/slick-grid.config';
import {ViewsProvider} from '../../modules/search/views/providers/views.provider';
import {IMFXModalProvider} from '../../modules/imfx-modal/proivders/provider';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {SearchViewsComponent} from "../../modules/search/views/views";
import {SecurityService} from "../../services/security/security.service";

// search component

@Component({
    selector: 'carrier',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: ViewsProvider, useClass: CarrierViewsProvider},
        CarrierAppSettings,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        // SlickGridProvider,
        {provide: SlickGridProvider, useClass: CarrierSlickGridProvider},
        SlickGridService,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
    ]
})

export class CarrierComponent extends CoreSearchComponent {
    /*
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'Tape',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };

    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            // arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null
        }
    };

    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;

    /**
     * Grid
     * @type {GridConfig}
     */
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['U_ID_PFIX', 'FORMAT', 'LI_TTL_text', 'LI_VERS_text'],
                exportPath: 'Tape',
                searchType: 'carriers',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                pager: {},
                isTree: {
                    enabled: false,
                    startState: 'collapsed',
                    expandMode: 'firstLevel'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.carrierSettingsPopup'
                    }
                },
                // tileParams: { // from css
                //     tileWidth: 267 + 24,
                //     tileHeight: 276 + 12,
                //     isThumbnails: false,
                //     isIcons: true,
                // },
                displayNoRowsToShowLabel: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });

    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'TapeGrid',
        }
    };

    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    protected searchSettingsConfig = <SearchSettingsConfig>{
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
            viewType: 'adv.recent.searches.carrier',
            itemsLimit: 10
        }
    };

    private flagHide = true;

    constructor(public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: CarrierAppSettings,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
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
        this.exportProvider.componentContext = this;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    hasPermission(path) {
        return this.securityService.hasPermissionByPath(path);
    }
}
