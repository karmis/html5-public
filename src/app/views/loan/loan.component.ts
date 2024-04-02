import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
// Views
import { ViewsConfig } from '../../modules/search/views/views.config';
import { LoanViewsProvider } from './providers/views.provider';
// Form
import { SearchFormConfig } from '../../modules/search/form/search.form.config';
import { SearchFormProvider } from '../../modules/search/form/providers/search.form.provider';
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../modules/search/thumbs/search.thumbs.config';
import { SearchThumbsProvider } from '../../modules/search/thumbs/providers/search.thumbs.provider';
// Search Settings
import { SearchSettingsConfig } from '../../modules/search/settings/search.settings.config';
import { SearchColumnsService } from '../../modules/search/columns/services/search.columns.service';
import { SearchColumnsProvider } from '../../modules/search/columns/providers/search.columns.provider';
// Search Detail
import { DetailConfig } from '../../modules/search/detail/detail.config';
// Search Settings
import { SearchRecentConfig } from '../../modules/search/recent/search.recent.config';
import { SearchRecentProvider } from '../../modules/search/recent/providers/search.recent.provider';

import { SearchAdvancedConfig } from '../../modules/search/advanced/search.advanced.config';
import { SearchAdvancedProvider } from '../../modules/search/advanced/providers/search.advanced.provider';
// constants
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
// search component
import { ConsumerSettingsTransferProvider } from '../../modules/settings/consumer/consumer.settings.transfer.provider';
import { TransferdSimplifedType } from '../../modules/settings/consumer/types';
import { ExportProvider } from '../../modules/export/providers/export.provider';
import { SearchSettingsProvider } from '../../modules/search/settings/providers/search.settings.provider';
import { SearchThumbsComponent } from '../../modules/search/thumbs/search.thumbs';
import { SlickGridComponent } from '../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../modules/search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../modules/search/slick-grid/services/slick.grid.service';
import { LoanSlickGridProvider } from './providers/loan.slick.grid.provider';
import { CoreSearchComponent } from '../../core/core.search.comp';
import { ViewsProvider } from '../../modules/search/views/providers/views.provider';
import { IMFXModalProvider } from "../../modules/imfx-modal/proivders/provider";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { ViewsService } from "../../modules/search/views/services/views.service";
import { SearchViewsComponent } from "../../modules/search/views/views";
import { SecurityService } from "../../services/security/security.service";
import { InfoPanelProvider } from '../../modules/search/info-panel/providers/info.panel.provider';
import { InfoPanelConfig } from '../../modules/search/info-panel/info.panel.config';
import { InfoPanelComponent } from '../../modules/search/info-panel/info.panel.component';
import { RaiseWorkflowWizzardProvider } from '../../modules/rw.wizard/providers/rw.wizard.provider';
import { LoanService } from '../../services/loan/loan.service';
import { defaultConfig, FacetsConfig } from '../../modules/search/facets1/models/facets.config';
import { FacetsService } from '../../modules/search/facets1/facets.service';
import { FacetsStore } from '../../modules/search/facets1/store/facets.store';
import { skip } from 'rxjs/operators';
import { LoanItems } from "./constants/constants";

@Component({
    selector: 'loan',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: LoanSlickGridProvider},
        SlickGridService,
        ViewsProvider,
        {provide: ViewsProvider, useClass: LoanViewsProvider},
        LoanItems,
        // ClipEditorDetailProvider,
        // {provide: DetailProvider, useClass: ClipEditorDetailProvider},
        InfoPanelProvider,
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        ViewsService,
        RaiseWorkflowWizzardProvider,
        FacetsService,
        FacetsStore
    ]
})
export class LoanComponent extends CoreSearchComponent {
    localStorageService: any;
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    @ViewChild('imfxInfoPanel', {static: true}) imfxInfoPanel: InfoPanelComponent;
    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: [],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null,
            forbiddenTags: ['CONTRIBUTOR_ID'],
            searchType: 'Media'
        }
    };

    protected facetsConfig: FacetsConfig = {
        parentContext: this,
        service: this.facetsService,
        store: this.facetsStore,
        searchForm: this.searchFormProvider,
    };

    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    searchThumbsConfig = new SearchThumbsConfig(<SearchThumbsConfig>{
        componentContext: this,
        providerType: SearchThumbsProvider,
        appSettingsType: LoanItems,
        options: new SearchThumbsConfigOptions(<SearchThumbsConfigOptions>{
            module: <SearchThumbsConfigModuleSetups>{
                enabled: false,
            }
        })
    });
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'UserLoans',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                // searchType: 'title',
                searchType: 'loans',
                exportPath: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                isTree: {
                    enabled: false,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopup'
                    }
                },
                tileParams: { // from media css
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12
                },
                displayNoRowsToShowLabel: true
                // refreshOnNavigateEnd: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'UserLoans',
        }
    };
    private flagHide = true;
    private openFacets = false;

    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    private searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };

    /**
     * Detail
     * @type {DetailConfig}
     */
    private infoPanelConfig = <InfoPanelConfig>{
        componentContext: this,
        options: {
            provider: <InfoPanelProvider>null,
            // needApi: false,
            typeDetails: 'loans-details',
            // showInDetailPage: false,
            showAccordions: false,
            detailsviewType: 'LoansDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_BKGS',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            externalSearchTextForMark: null,
            isOpenDetailPanel: false,
            tabsLayoutSettings: 'loansSearch',
            searchType: 'loans'
        },
    };

    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    private searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: 'adv.recent.searches.loans',
            itemsLimit: 10
        }
    };

    constructor(protected searchThumbsProvider: SearchThumbsProvider,
                protected infoPanelProvider: InfoPanelProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: LoanItems,
                protected securityService: SecurityService,
                protected router: Router,
                protected route: ActivatedRoute,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected injector: Injector,
                private facetsService: FacetsService,
                private facetsStore: FacetsStore
    ) {
        super(injector);
        // super(router, route);
        this.simpleTransferProvider.updated.subscribe((setups: TransferdSimplifedType) => {
            /*debugger*/
        });

        // detail provider
        this.infoPanelConfig.options.provider = infoPanelProvider;
        // infoPanelProvider.config = this.infoPanelConfig;
        // debugger;
        this.infoPanelConfig.options.appSettings = this.appSettings;

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // thumbnails provider
        // this.searchThumbsConfig.options.provider = this.searchThumbsProvider;
        // this.searchThumbsConfig.options.appSettings = this.appSettings;

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        this.exportProvider.componentContext = (<CoreSearchComponent>this);
    }

    searchString: string;

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    onOpenNewLoanPage() {
        this.router.navigate(['loans', 'create'])
    }
}
