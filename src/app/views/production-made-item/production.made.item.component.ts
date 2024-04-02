import {ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
// Views
import {ViewsConfig} from '../../modules/search/views/views.config';
import {ProductionMiViewsProvider} from './providers/production-mi.views.provider';
// Form
import {SearchFormConfig} from '../../modules/search/form/search.form.config';
import {SearchFormProvider} from '../../modules/search/form/providers/search.form.provider';
// Thumbs
import {SearchThumbsProvider} from '../../modules/search/thumbs/providers/search.thumbs.provider';
// Search Settings
import {SearchSettingsConfig} from '../../modules/search/settings/search.settings.config';
import {SearchColumnsService} from '../../modules/search/columns/services/search.columns.service';
import {SearchColumnsProvider} from '../../modules/search/columns/providers/search.columns.provider';
// Search Detail
import {DetailConfig} from '../../modules/search/detail/detail.config';
// Search Settings
import {SearchRecentConfig} from '../../modules/search/recent/search.recent.config';
import {SearchRecentProvider} from '../../modules/search/recent/providers/search.recent.provider';

import {SearchAdvancedConfig} from '../../modules/search/advanced/search.advanced.config';
import {SearchAdvancedProvider} from '../../modules/search/advanced/providers/search.advanced.provider';
// search component
import {ConsumerSettingsTransferProvider} from '../../modules/settings/consumer/consumer.settings.transfer.provider';
import {TransferdSimplifedType} from '../../modules/settings/consumer/types';
import {ExportProvider} from '../../modules/export/providers/export.provider';
import {SearchSettingsProvider} from '../../modules/search/settings/providers/search.settings.provider';
import {SlickGridComponent} from '../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../modules/search/slick-grid/slick-grid.config';
import {SlickGridProvider} from '../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../modules/search/slick-grid/services/slick.grid.service';
import {ProductionMiSlickGridProvider} from './providers/production-mi.slick.grid.provider';
import {CoreSearchComponent} from '../../core/core.search.comp';
import {ViewsProvider} from '../../modules/search/views/providers/views.provider';
import {IMFXModalProvider} from "../../modules/imfx-modal/proivders/provider";
import {BsModalRef, BsModalService} from "ngx-bootstrap";
import {ViewsService} from "../../modules/search/views/services/views.service";
import {SearchViewsComponent} from "../../modules/search/views/views";
import {SecurityService} from "../../services/security/security.service";
import {InfoPanelProvider} from '../../modules/search/info-panel/providers/info.panel.provider';
import {InfoPanelConfig} from '../../modules/search/info-panel/info.panel.config';
import {InfoPanelComponent} from '../../modules/search/info-panel/info.panel.component';
import {RaiseWorkflowWizzardProvider} from '../../modules/rw.wizard/providers/rw.wizard.provider';
import {FacetsService} from '../../modules/search/facets1/facets.service';
import {FacetsStore} from '../../modules/search/facets1/store/facets.store';
import {SearchGroupProvider} from '../../modules/search/group/providers/search.group.provider';
import {SearchGroupComponent} from '../../modules/search/group/search.group.component';
import {Subject} from 'rxjs';
import {BaseProvider} from '../base/providers/base.provider';
import {SearchFormComponent} from '../../modules/search/form/search.form';
import {MediaAppSettings} from '../media/constants/constants';
import {SearchAdvancedService} from '../../modules/search/advanced/services/search.advanced.service';
import {SearchAdvancedComponent} from '../../modules/search/advanced/search.advanced';
import {InfoProductionPanelProvider} from "./comps/info-panel/providers/info.panel.provider";
import {InfoPanelThumbProvider} from "../../modules/search/info-panel/providers/info.panel.thumb.provider";

@Component({
    selector: 'production-mi',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: ProductionMiSlickGridProvider},
        SlickGridService,
        ViewsProvider,
        {provide: ViewsProvider, useClass: ProductionMiViewsProvider},
        InfoPanelProvider,
        InfoProductionPanelProvider,
        {provide: InfoPanelProvider, useClass: InfoProductionPanelProvider},
        MediaAppSettings,
        // ClipEditorDetailProvider,
        // {provide: DetailProvider, useClass: ClipEditorDetailProvider},
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchAdvancedService,
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
        InfoPanelThumbProvider
    ]
})
export class ProductionMadeItemComponent extends CoreSearchComponent {
    localStorageService: any;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('imfxInfoPanel', {static: false}) imfxInfoPanel: InfoPanelComponent;
    @ViewChild('advSearch', {static: false}) advSearch: SearchAdvancedComponent;
    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: null,
            provider: <SearchFormProvider>null,
            forbiddenTags: ['CONTRIBUTOR_ID'],
            searchType: 'ProductionMadeItems'
        }
    };

    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'ProductionMadeItems',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder',
            isOpen: true,
            // commonData: {
            //     disabledOperators: ['TAXONOMY_ID', 'CC_TEXT', 'TAGS_TEXT']
            // }
        }
    };
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    searchString: string;
    @ViewChild('searchFormComponent', {static: false}) public searchFormComponent: SearchFormComponent;
    @ViewChild('treeGroup', {static: false}) public treeGroup: SearchGroupComponent;
    protected isDevMode: boolean = false;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: true,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                // searchType: 'title',
                searchType: 'madeproductionitems',
                exportPath: 'Media',
                // onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                isTree: {
                    enabled: false,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.production-mi-grid-popup'
                    }
                },
                tileParams: { // from media css
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12
                },
                displayNoRowsToShowLabel: true,
                refreshOnNavigateEnd: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'ProductionMadeItems',
        }
    };
    private flagHide = true;
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
            needApi: false,
            typeDetails: 'media-details',
            showInDetailPage: false,
            showAccordions: false,
            detailsviewType: 'MediaDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            externalSearchTextForMark: null,
            isOpenDetailPanel: false,
            tabsLayoutSettings: 'mediaSearch',
            searchType: 'ProductionMadeItems',
            mediaParams: {
                addPlayer: true,
                addMedia: true,
                addImage: true,
                showAllProperties: true,
                isSmoothStreaming: true,
                mediaType: 'htmlPlayer'
            }
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
            viewType: 'adv.recent.searches.made-production-items',
            itemsLimit: 10
        }
    };
    private destroyed$: Subject<any> = new Subject();
    private oldModeForSearch;

    constructor(protected infoPanelProvider: InfoPanelProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected router: Router,
                protected route: ActivatedRoute,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected injector: Injector,
                private facetsService: FacetsService,
                private facetsStore: FacetsStore,
                public searchGroupProvider: SearchGroupProvider,
                public baseProvider: BaseProvider,
                public appSettings: MediaAppSettings,
                public advService: SearchAdvancedService
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

        this.isDevMode = this.baseProvider.isDevServer;

        // this.adv

        this.cdr.markForCheck();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    ngAfterViewInit() {
        this.advSearch.onReady.subscribe(() => {
            this.searchAdvancedProvider.openPanel()
            setTimeout(() => {
                this.searchAdvancedProvider.buildStructure(this.advService.getStructureForProdMI());
                this.cdr.detectChanges();
            })
        })
    }

}
