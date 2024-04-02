import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
// Views
import { ViewsConfig } from "../../modules/search/views/views.config";
import { MappingVersionViewsProvider } from "./providers/views.provider";
// Grid
// Form
import { SearchFormConfig } from "../../modules/search/form/search.form.config";
import { SearchFormProvider } from "../../modules/search/form/providers/search.form.provider";
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../modules/search/thumbs/search.thumbs.config";
import { SearchThumbsProvider } from "../../modules/search/thumbs/providers/search.thumbs.provider";
// Search Settings
import { SearchSettingsConfig } from "../../modules/search/settings/search.settings.config";
// Search Modal
// Modal
// Search Columns
import { SearchColumnsService } from "../../modules/search/columns/services/search.columns.service";
import { SearchColumnsProvider } from "../../modules/search/columns/providers/search.columns.provider";
// Info Modal
// Search Detail
// Search Settings
import { SearchRecentConfig } from "../../modules/search/recent/search.recent.config";
import { SearchRecentProvider } from "../../modules/search/recent/providers/search.recent.provider";

import { SearchAdvancedConfig } from "../../modules/search/advanced/search.advanced.config";
import { SearchAdvancedProvider } from "../../modules/search/advanced/providers/search.advanced.provider";
// constants
import { VersionAppSettings } from "./constants/constants";
import { AppSettingsInterface } from "../../modules/common/app.settings/app.settings.interface";

import { ExportProvider } from "../../modules/export/providers/export.provider";
import { SearchSettingsProvider } from "../../modules/search/settings/providers/search.settings.provider";
import { SearchThumbsComponent } from "../../modules/search/thumbs/search.thumbs";
import { CoreSearchComponent } from "../../core/core.search.comp";
// search component
import { SlickGridComponent } from "../../modules/search/slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from "../../modules/search/slick-grid/slick-grid.config";
import { SlickGridProvider } from "../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridService } from "../../modules/search/slick-grid/services/slick.grid.service";
import { MappingSlickGridProvider } from "./providers/mapping.slick.grid.provider";
import { ViewsProvider } from "../../modules/search/views/providers/views.provider";
import { MediaInsideMappingComponent } from "./modules/media-inside-mapping/media.component";
import { MediaAppSettings } from "../media/constants/constants";
import { SplitProvider } from "../../providers/split/split.provider";
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { VersionWizardService } from "../../modules/version-wizard/services/wizard.service";
import { VersionWizardProvider } from "../../modules/version-wizard/providers/wizard.provider";
import { ViewsService } from "../../modules/search/views/services/views.service";
import { SearchViewsComponent } from "../../modules/search/views/views";
import { SecurityService } from "../../services/security/security.service";
import { InfoPanelComponent } from '../../modules/search/info-panel/info.panel.component';
import { InfoPanelConfig } from '../../modules/search/info-panel/info.panel.config';
import { InfoPanelProvider } from '../../modules/search/info-panel/providers/info.panel.provider';
import { RaiseWorkflowWizzardProvider } from '../../modules/rw.wizard/providers/rw.wizard.provider';
import { TitlesSlickGridService } from '../titles/modules/versions/services/slickgrid.service';
import { MediaInsideMappingSlickGridProvider } from './modules/media-inside-mapping/providers/media.slick.grid.provider';
import { AssociatedMediaInsideMappingSlickGridProvider } from './modules/media-inside-mapping/providers/associated.media.slick.grid.provider';
import { MediaInsideMappingViewsProvider } from "./modules/media-inside-mapping/providers/views.provider";
import { IMFXRouteReuseStrategy } from '../../strategies/route.reuse.strategy';
import { MediaService } from '../../services/media/media.service';
import { FacetsConfig } from '../../modules/search/facets1/models/facets.config';
import { FacetsService } from '../../modules/search/facets1/facets.service';
import { FacetsStore } from '../../modules/search/facets1/store/facets.store';
import {skip} from "rxjs/operators";

@Component({
    selector: 'mapping',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        // ViewsProvider,
        {provide: ViewsProvider, useClass: MappingVersionViewsProvider},
        MediaService,
        VersionAppSettings,
        InfoPanelProvider,
        // {provide: 'searchFacetsProvider', useClass: SearchFacetsProvider},
        // {provide: 'mediaSearchFacetsProvider', useClass: SearchFacetsProvider},
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsService,
        SearchColumnsProvider,
        SearchSettingsProvider,
        VersionWizardProvider,
        VersionWizardService,
        {provide: SlickGridProvider, useClass: MappingSlickGridProvider},
        MediaInsideMappingSlickGridProvider,
        AssociatedMediaInsideMappingSlickGridProvider,
        SplitProvider,
        {provide: SlickGridService, useClass: TitlesSlickGridService},
        MediaAppSettings,
        IMFXModalProvider,
        // BsModalRef,
        // BsModalService,
        ViewsService,
        RaiseWorkflowWizzardProvider,
        MediaInsideMappingViewsProvider,
        { provide: 'versionFacetsStore', useClass: FacetsStore },
        { provide: 'mediaFacetsStore', useClass: FacetsStore },
        { provide: 'versionFacetsService', useClass: FacetsService },
        { provide: 'mediaFacetsService', useClass: FacetsService },
    ]
})

export class MappingComponent extends CoreSearchComponent {
    onDrop() {
        // debugger
    }
    openDetail: boolean;
    localStorageService: any;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('mediaInsideMapping', {static: false}) mediaInsideMapping: MediaInsideMappingComponent;
    @ViewChild('imfxInfoPanel', {static: false}) imfxInfoPanel: InfoPanelComponent;
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;

    /**
     * Views
     * @type {ViewsConfig}
     */
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'VersionGrid',
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
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null,
            searchType: 'Version'
        }
    };

    /**
     * Facets
     * @type {FacetsConfig}
     */
    facetsConfig: FacetsConfig = {
        parentContext: this,
        service: this.versionFacetsService,
        store: this.versionFacetsStore,
        searchForm: this.searchFormProvider,
        type: 'version'
    };

    facetsConfigMedia: FacetsConfig = {
        parentContext: this,
        service: this.mediaFacetsService,
        store: this.mediaFacetsStore,
        searchForm: this.searchFormProvider,
        type: 'media'
    };

    /**
     * Thumbs
     * @type {SearchThumbsConfig}
     */
    searchThumbsConfig = new SearchThumbsConfig(<SearchThumbsConfig>{
        componentContext: this,
        providerType: SearchThumbsProvider,
        appSettingsType: VersionAppSettings,
        options: new SearchThumbsConfigOptions(<SearchThumbsConfigOptions>{
            module: <SearchThumbsConfigModuleSetups>{
                enabled: false,
            }
        })
    });

    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    public searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: 'adv.recent.searches.versions',
            itemsLimit: 10
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
            restIdForParametersInAdv: 'Version',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };

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
                viewMode: 'table',
                tileSource: ['SER_TITLE', 'TITLE', 'VERSION', 'SER_NUM', 'DURATION_text'],
                exportPath: 'Version',
                searchType: 'versions',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                pager: {},
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '#mapping.mappingSettingsPopup'
                    }
                },
                externalWrapperEl: '#MappingGridWrapper',
                tileParams: { // from media css
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12
                },
                selectFirstRow: false,
                displayNoRowsToShowLabel: true,
                columnsOrderPrefix: 'associate.version.columns.order.setups'
            },
        })
    });

    /**
     * Detail
     * @type {InfoPanelConfig}
     */
    private infoPanelConfig = <InfoPanelConfig>{
        componentContext: this,
        options: {
            provider: <InfoPanelProvider>null,
            typeDetails: 'version-details',
            detailsviewType: 'VersionDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_PG_RL',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            tabsLayoutSettings: 'associate'
        },
    };

    searchString: string;

    /**
     * Additional variable detail settings InfoPanelConfig
     */
    variableInfoPanelOptions = {
        'Media': {
            options: {
                typeDetails: 'media-details',
                detailsviewType: 'MediaDetails',
                friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
                typeDetailsLocal: 'media_details',
                searchType: 'media'
            }
        },
        'versions': {
            options: {
                typeDetails: 'version-details',
                detailsviewType: 'VersionDetails',
                friendlyNamesForDetail: 'FriendlyNames.TM_PG_RL',
                typeDetailsLocal: 'version_details',
                searchType: 'versions'
            }
        }
    };

    protected gridProviders: SlickGridProvider[] = null;

    private flagHide = true;
    private openFacets = false;
    protected expandedAll: boolean = true;
    // private raiseWFsettings  = {
    //     flag: false,
    //     preset: null
    // };

    constructor(public viewsProvider: ViewsProvider,
                public mediaService: MediaService,
                // @Inject('searchFacetsProvider') protected searchFacetsProvider: SearchFacetsProvider,
                // @Inject('mediaSearchFacetsProvider') protected mediaSearchFacetsProvider: SearchFacetsProvider,
                protected infoPanelProvider: InfoPanelProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                public searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: VersionAppSettings,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                @Inject('versionFacetsService') private versionFacetsService: FacetsService,
                @Inject('mediaFacetsService') private mediaFacetsService: FacetsService,
                @Inject('versionFacetsStore') private versionFacetsStore: FacetsStore,
                @Inject('mediaFacetsStore') private mediaFacetsStore: FacetsStore,
                protected injector: Injector) {
        super(injector);

        // views provider
        // this.searchViewsConfig.options.provider = viewsProvider;

        // detail provider
        this.infoPanelConfig.options.provider = infoPanelProvider;
        this.infoPanelConfig.options.appSettings = this.appSettings;

        // search settings
        this.infoPanelProvider.inducingComponent = 'mapping';

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // facets
        const arrSgp = this.getSlickGridProviders();
        // this.searchFacetsConfig.options.provider = this.searchFacetsProvider;
        // this.searchFacetsConfig.options.gridProvider = arrSgp[0];
        // this.mediaSearchFacetsConfig.options.provider = this.mediaSearchFacetsProvider;
        // this.mediaSearchFacetsConfig.options.gridProvider = arrSgp[1];


        //toDo remote

        // this.facetsConfig.service = this.versionFacetsService;
        this.facetsConfig.gridProvider = arrSgp[0];
        // this.facetsConfigMedia.service = this.mediaFacetsService;
        this.facetsConfigMedia.gridProvider = arrSgp[1];

        this.searchFormProvider.onSubmitForm.pipe(skip(1)).subscribe((res: any) => {
            if(this.searchString !== res.data.searchString) {
                this.searchString = res.data.searchString;
                this.mediaFacetsStore.newSearch(true);
            }
            this.mediaFacetsStore.clearFacets();
        });

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        (<any>this.exportProvider).componentContext = this;

    }

    ngAfterViewInit() {
        this.mediaInsideMapping.mappingComp = this;
        (this.slickGridComp.provider as MappingSlickGridProvider).initListeners();
        this.expandedAll = (this.slickGridComp.module as SlickGridConfigModuleSetups).isTree.expandMode !== 'allLevels';
    }

    toggleInfoPanel() {
        const infoPanelProvider: InfoPanelProvider = this.imfxInfoPanel.config.options.provider;
        infoPanelProvider.togglePanel();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    hasPermission(path) {
        //return true;
        return this.securityService.hasPermissionByPath(path);
    }

    getSlickGridProviders(doRefresh = false): SlickGridProvider[] {
        if(this.gridProviders && this.gridProviders.length > 0 && !doRefresh) {
            return this.gridProviders;
        } else {
            this.gridProviders = [];
            this.gridProviders.push(this.injector.get(SlickGridProvider));
            this.gridProviders.push(this.injector.get(MediaInsideMappingSlickGridProvider));
            this.gridProviders.push(this.injector.get(AssociatedMediaInsideMappingSlickGridProvider));
            // this.gridProviders.push((<any>this.injector.get(this.slickGridComp.config.providerType)));
            return this.gridProviders;
        }
    }

    isOpenFacets() {
        return this.versionFacetsService.isOpenFacets || this.mediaFacetsService.isOpenFacets;
    }

    // TODO lekaving: no usage method
    getCurrentFacetContext() {
        // if (this.mediaSearchFacetsConfig.options.provider.isOpenFacets()) {
        //     return this.mediaSearchFacetsConfig.options.provider;
        // } else {
        //     return this.searchFacetsConfig.options.provider;
        // }
    }

    toggleFacetsPanel(isOpen: boolean) {
        if (isOpen) {
            this.versionFacetsService.toggleFacetsPage(true);
            this.mediaFacetsService.toggleFacetsPage(false);
        } else {
            this.versionFacetsService.toggleFacetsPage(false);
            this.mediaFacetsService.toggleFacetsPage(false);
        }
    }

    getIsReadyFacets() {
        return (this.versionFacetsService.getIsReady() && this.mediaFacetsService.getIsReady());
    }

    toggleBetweenFacetsPanels(sName: 'Versions' | 'Media') {
        const isMedia = sName === 'Media';

        this.versionFacetsService.toggleFacetsPage(!isMedia);
        this.mediaFacetsService.toggleFacetsPage(isMedia);
    }

    getActiveFacetsPanelName() {
        if (this.mediaFacetsService.isOpenFacets) {
            return 'Media';
        } else {
            return 'Versions';
        }
    }

    onInitCustomIfExist() {
        const router = this.injector.get(Router);
        const strategy = (<IMFXRouteReuseStrategy>router.routeReuseStrategy);
        strategy.currentComponentInstance = this;//dirty hack
        this.refreshSpecComps('versionGrid', () => {
            this.slickGridComp.provider.refreshGrid();
        });
    }
}
