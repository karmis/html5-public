import { ViewsConfig } from '../../../../modules/search/views/views.config';
import { CoreSearchComponent } from '../../../../core/core.search.comp';
import { SearchFormConfig } from '../../../../modules/search/form/search.form.config';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../../modules/search/slick-grid/slick-grid.config';
import { TransferdSimplifedType } from '../../../../modules/settings/consumer/types';
import { SearchThumbsProvider } from '../../../../modules/search/thumbs/providers/search.thumbs.provider';
import { FacetsStore } from '../../../../modules/search/facets1/store/facets.store';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { SearchAdvancedConfig } from '../../../../modules/search/advanced/search.advanced.config';
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups, SearchThumbsConfigOptions
} from '../../../../modules/search/thumbs/search.thumbs.config';
import { ActivatedRoute, Router } from '@angular/router';
import { SlickGridService } from '../../../../modules/search/slick-grid/services/slick.grid.service';
import { SecurityService } from '../../../../services/security/security.service';
import { SearchViewsComponent } from '../../../../modules/search/views/views';
import { InfoPanelComponent } from '../../../../modules/search/info-panel/info.panel.component';
import { SearchFormProvider } from '../../../../modules/search/form/providers/search.form.provider';
import { ViewsProvider } from '../../../../modules/search/views/providers/views.provider';
import { FacetsConfig } from '../../../../modules/search/facets1/models/facets.config';
import { ProductionManagerViewsProvider } from './providers/production.manager.views.provider';
import { AppSettingsInterface } from '../../../../modules/common/app.settings/app.settings.interface';
import { ProductionManagerSlickGridProvider } from './providers/production.manager.slick.grid.provider';
import { SearchThumbsComponent } from '../../../../modules/search/thumbs/search.thumbs';
import { SearchSettingsProvider } from '../../../../modules/search/settings/providers/search.settings.provider';
import { ExportProvider } from '../../../../modules/export/providers/export.provider';
import { FacetsService } from '../../../../modules/search/facets1/facets.service';
import { SearchRecentConfig } from '../../../../modules/search/recent/search.recent.config';
import { SearchAdvancedProvider } from '../../../../modules/search/advanced/providers/search.advanced.provider';
import { SearchRecentProvider } from '../../../../modules/search/recent/providers/search.recent.provider';
import { SlickGridProvider } from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { InfoPanelProvider } from '../../../../modules/search/info-panel/providers/info.panel.provider';
import { SlickGridComponent } from '../../../../modules/search/slick-grid/slick-grid';
import { SearchSettingsConfig } from '../../../../modules/search/settings/search.settings.config';
import { ConsumerSettingsTransferProvider } from '../../../../modules/settings/consumer/consumer.settings.transfer.provider';
import { SearchColumnsProvider } from '../../../../modules/search/columns/providers/search.columns.provider';
import { SearchColumnsService } from '../../../../modules/search/columns/services/search.columns.service';
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ViewsService } from '../../../../modules/search/views/services/views.service';
import { RaiseWorkflowWizzardProvider } from '../../../../modules/rw.wizard/providers/rw.wizard.provider';
import { ProductionAppSettings } from '../../constants/constants';
import {ProductionManagerSearchAdvancedProvider} from "./providers/production.manager.search.advanced.provider";


@Component({
    moduleId: 'manager-production',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        {provide: SlickGridProvider, useClass: ProductionManagerSlickGridProvider},
        {provide: ViewsProvider, useClass: ProductionManagerViewsProvider},
        SlickGridService,
        InfoPanelProvider,
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        //SearchAdvancedProvider,
        {provide: SearchAdvancedProvider, useClass: ProductionManagerSearchAdvancedProvider},
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        ViewsService,
        RaiseWorkflowWizzardProvider,
        FacetsService,
        FacetsStore,
        ProductionAppSettings
    ],
    entryComponents: [
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ProductionManagerComponent extends CoreSearchComponent {
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
        appSettingsType: ProductionAppSettings,
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
            isOpen: true,
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'productionmanager',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            buildBuilderUIByModel: true,
            advancedSearchMode: 'builder',
            allowEmptyForBuilder: true
        }
    };

    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;

    protected searchGridConfig: SlickGridConfig = null;

    private searchRecentConfig = null;

    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'productionmanager',
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


    constructor(protected searchThumbsProvider: SearchThumbsProvider,
                protected infoPanelProvider: InfoPanelProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: ProductionAppSettings,
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
    }

    searchString: string;

    ngOnInit() {
        super.ngOnInit();
        this.route.data.subscribe(({searchType}) => {

            this.searchGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                        searchType: searchType,
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
                        tileParams: {
                            tileWidth: 267 + 24,
                            tileHeight: 276 + 12
                        },
                        displayNoRowsToShowLabel: true
                    },
                    plugin: <SlickGridConfigPluginSetups>{
                        multiSelect: true
                    }
                })
            });

            this.searchRecentConfig = <SearchRecentConfig>{
                componentContext: this,
                options: {
                    provider: <SearchRecentProvider>null,
                    viewType: 'adv.recent.searches.' + searchType,
                    itemsLimit: 10
                }
            };

            // super(router, route);
            this.simpleTransferProvider.updated.subscribe((setups: TransferdSimplifedType) => {
                /*debugger*/
            });

            // app settings to search form
            this.searchFormConfig.options.appSettings = this.appSettings;
            this.searchFormConfig.options.provider = this.searchFormProvider;
            this.searchFormConfig.options.searchButtonAlwaysEnabled = (searchType == 'myproductions') ? true : false;
            this.searchFormConfig.options.doSearchOnStartup = (searchType == 'myproductions') ? true : false;


            // recent searches
            this.searchRecentConfig.options.provider = this.searchRecentProvider;

            // advanced search
            this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

            // export
            this.exportProvider.componentContext = (<CoreSearchComponent>this);


        });


    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

}
