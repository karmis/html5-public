import { ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
// Views
import { ViewsConfig } from "../../modules/search/views/views.config";
import { MediaViewsProvider } from "./providers/views.provider";
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
import { MediaAppSettings } from "./constants/constants";
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
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../modules/search/slick-grid/slick-grid.config";
import { SlickGridProvider } from "../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridService } from "../../modules/search/slick-grid/services/slick.grid.service";
import { MediaAssociateSlickGridProvider } from "./providers/media-associate.slick.grid.provider";
import { ViewsProvider } from "../../modules/search/views/providers/views.provider";
import { MediaInsideMediaAssociateComponent } from "./modules/media-inside-media-associate/media.component";
import { SplitProvider } from "../../providers/split/split.provider";
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { ViewsService } from "../../modules/search/views/services/views.service";
import { SearchViewsComponent } from "../../modules/search/views/views";
import { SecurityService } from "../../services/security/security.service";
import { InfoPanelComponent } from '../../modules/search/info-panel/info.panel.component';
import { InfoPanelConfig } from '../../modules/search/info-panel/info.panel.config';
import { InfoPanelProvider } from '../../modules/search/info-panel/providers/info.panel.provider';
import { RaiseWorkflowWizzardProvider } from '../../modules/rw.wizard/providers/rw.wizard.provider';
import { TitlesSlickGridService } from '../titles/modules/versions/services/slickgrid.service';
import { MediaInsideMediaAssociateSlickGridProvider } from './modules/media-inside-media-associate/providers/media.slick.grid.provider';
import { MediaService } from '../../services/media/media.service';
import { FacetsConfig } from '../../modules/search/facets1/models/facets.config';
import { FacetsService } from '../../modules/search/facets1/facets.service';
import { FacetsStore } from '../../modules/search/facets1/store/facets.store';
import { skip } from "rxjs/operators";

// import {MediaViewsProvider} from "../media/providers/views.provider";

@Component({
    selector: 'media-associate',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: ViewsProvider, useClass: MediaViewsProvider},
        MediaService,
        MediaAppSettings,
        InfoPanelProvider,
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsService,
        SearchColumnsProvider,
        SearchSettingsProvider,
        {provide: SlickGridProvider, useClass: MediaAssociateSlickGridProvider},
        MediaInsideMediaAssociateSlickGridProvider,
        SplitProvider,
        {provide: SlickGridService, useClass: TitlesSlickGridService},
        IMFXModalProvider,
        ViewsService,
        RaiseWorkflowWizzardProvider,
        FacetsStore,
        FacetsService
    ]
})

export class MediaAssociateComponent extends CoreSearchComponent {
    openDetail: boolean;
    localStorageService: any;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('mediaInsideMediaAssociate', {static: false}) mediaInsideMediaAssociate: MediaInsideMediaAssociateComponent;
    @ViewChild('imfxInfoPanel', {static: false}) imfxInfoPanel: InfoPanelComponent;
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
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
            forbiddenTags: ['CONTRIBUTOR_ID'],
            searchType: 'Media'
        }
    };
    /**
     * Thumbs
     * @type {SearchThumbsConfig}
     */
    searchThumbsConfig = new SearchThumbsConfig(<SearchThumbsConfig>{
        componentContext: this,
        providerType: SearchThumbsProvider,
        appSettingsType: MediaAppSettings,
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
            viewType: 'adv.recent.searches.media',
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
            restIdForParametersInAdv: 'Media',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };
    searchString: string;
    /**
     * Views
     * @type {ViewsConfig}
     */
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
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
     * Facets
     * @type {FacetsConfig}
     */
    protected facetsConfig: FacetsConfig = {
        parentContext: this,
        service: this.facetsService,
        store: this.facetsStore,
        searchForm: this.searchFormProvider,
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
                // tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                exportPath: 'Media',
                searchType: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                // pager: {},
                isTree: {
                    enabled: false
                },
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopupAssociate'
                    }
                },
                // externalWrapperEl: '#MediaAssociateGridWrapper',
                // tileParams: { // from media css
                //     tileWidth: 267 + 24,
                //     tileHeight: 276 + 12
                // },
                selectFirstRow: false,
                displayNoRowsToShowLabel: true,
                columnsOrderPrefix: 'associate_media.assoc.version.columns.order.setups'
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });
    protected gridProviders: SlickGridProvider[] = null;
    /**
     * Detail
     * @type {InfoPanelConfig}
     */
    private infoPanelConfig = <InfoPanelConfig>{
        componentContext: this,
        options: {
            provider: <InfoPanelProvider>null,
            typeDetails: 'media-details',
            detailsviewType: 'MediaDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            tabsLayoutSettings: 'associate',
            externalSearchTextForMark: null,
            isOpenDetailPanel: false,
            // tabsLayoutSettings: 'mediaSearch',
            searchType: 'media'
        },
    };
    private flagHide = true;
    private openFacets = false;

    constructor(public viewsProvider: ViewsProvider,
                public mediaService: MediaService,
                protected infoPanelProvider: InfoPanelProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                public searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: MediaAppSettings,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                private facetsService: FacetsService,
                private facetsStore: FacetsStore,
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

        this.searchFormProvider.onSubmitForm.pipe(skip(1)).subscribe((res: any) => {
            if (this.searchString !== res.data.searchString) {
                this.searchString = res.data.searchString;
                this.facetsStore.newSearch(true);
            }
            this.facetsStore.clearFacets();
        });

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        (<any>this.exportProvider).componentContext = this;


    }
    // private raiseWFsettings  = {
    //     flag: false,
    //     preset: null
    // };

    onDrop() {
        // debugger
    }

    ngAfterViewInit() {
        this.mediaInsideMediaAssociate.mediaComp = this;
        (this.slickGridComp.provider as MediaAssociateSlickGridProvider).initListeners();
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
        if (this.gridProviders && this.gridProviders.length > 0 && !doRefresh) {
            return this.gridProviders;
        } else {
            this.gridProviders = [];
            this.gridProviders.push(this.injector.get(SlickGridProvider));
            this.gridProviders.push(this.injector.get(MediaInsideMediaAssociateSlickGridProvider));
            return this.gridProviders;
        }
    }
}
