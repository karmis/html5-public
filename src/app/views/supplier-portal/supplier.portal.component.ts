import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
// Views
import { ViewsConfig } from "../../modules/search/views/views.config";
import { SupplierPortalVersionViewsProvider } from "./providers/views.provider";
// Grid
// Form
import { SearchFormConfig } from "../../modules/search/form/search.form.config";
import { SearchFormProvider } from "../../modules/search/form/providers/search.form.provider";
// Facets
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
import { SupplierPortalSlickGridProvider } from "./providers/supplier.portal.slick.grid.provider";
import { ViewsProvider } from "../../modules/search/views/providers/views.provider";
import { MediaInsideSupplierPortalComponent } from "./modules/media-inside-supplier-portal/media.component";
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
import { AssociatedMediaInsideSupplierPortalSlickGridProvider } from './modules/media-inside-supplier-portal/providers/associated.media.slick.grid.provider';
import { IMFXRouteReuseStrategy } from '../../strategies/route.reuse.strategy';
import { SupplierPortalSearchFormProvider } from './providers/search.form.provider';
import { MediaService } from '../../services/media/media.service';
import { Subject } from 'rxjs';
import { FacetsService } from "../../modules/search/facets1/facets.service";
import { FacetsStore } from "../../modules/search/facets1/store/facets.store";
import { FacetsConfig } from "../../modules/search/facets1/models/facets.config";

@Component({
    selector: 'supplier-portal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        MediaService,
        VersionAppSettings,
        InfoPanelProvider,
        SearchThumbsProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsService,
        SearchColumnsProvider,
        SearchSettingsProvider,
        VersionWizardProvider,
        VersionWizardService,
        {provide: SlickGridService, useClass: TitlesSlickGridService},
        {provide: SlickGridProvider, useClass: SupplierPortalSlickGridProvider},
        {provide: SearchFormProvider, useClass: SupplierPortalSearchFormProvider},
        {provide: ViewsProvider, useClass: SupplierPortalVersionViewsProvider},
        AssociatedMediaInsideSupplierPortalSlickGridProvider,
        SplitProvider,
        MediaAppSettings,
        IMFXModalProvider,
        // BsModalRef,
        // BsModalService,
        ViewsService,
        RaiseWorkflowWizzardProvider,
        FacetsService,
        FacetsStore
    ]
})

export class SupplierPortalComponent extends CoreSearchComponent {
    onDrop() {
        // debugger
    }
    // openDetail: boolean;
    // localStorageService: any;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('mediaInsideSupplierPortal', {static: false}) mediaInsideSupplierPortal: MediaInsideSupplierPortalComponent;
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
            enabledSearchButton: true,
            searchButtonAlwaysEnabled: true,
            doSearchOnStartup: true,
            searchType: 'Version'
        }
    };

    protected facetsConfig: FacetsConfig = {
        parentContext: this,
        service: this.facetsService,
        store: this.facetsStore,
        searchForm: this.searchFormProvider,
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
     * Detail
     * @type {InfoPanelConfig}
     */
    private infoPanelConfig = <InfoPanelConfig>{
        componentContext: this,
        options: {
            provider: <InfoPanelProvider>null,
            // needApi: false,
            typeDetails: 'version-details',
            detailsviewType: 'VersionDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_PG_RL',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: []
        },
    };


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
                searchType: 'media',
                specifiedEndpointUrl: '/api/v3/version/{ID}/media'
            }
        },
        'supplierversions': {
            options: {
                typeDetails: 'version-details',
                detailsviewType: 'VersionDetails',
                friendlyNamesForDetail: 'FriendlyNames.TM_PG_RL',
                typeDetailsLocal: 'version_details',
                searchType: 'versions',
                specifiedEndpointUrl: '' // necessary
            }
        }
    };

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
     * Grid
     * @type {SlickGridConfig}
     */
    public searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['SER_TITLE', 'TITLE', 'VERSION', 'SER_NUM', 'DURATION_text'],
                exportPath: 'Version',
                searchType: 'supplierversions',
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
                        'popupEl': '#supplierPortal.supplierPortalSettingsPopup'
                    }
                },
                externalWrapperEl: '#SupplierPortalGridWrapper',
                selectFirstRow: false,
                displayNoRowsToShowLabel: true,
                columnsOrderPrefix: 'supplier.del.columns.order.setups'
            },
        })
    });

    protected gridProviders: SlickGridProvider[] = null;
    // protected versionGridProviders: SlickGridProvider[] = null;
    // protected mediaGridProviders: SlickGridProvider[] = null;

    private flagHide = true;
    private destroyed$: Subject<any> = new Subject();


    constructor(public viewsProvider: ViewsProvider,
                // public supplierPortalGridService: SupplierPortalGridService,
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
                private facetsService: FacetsService,
                private facetsStore: FacetsStore,
                protected injector: Injector) {
        super(injector);

        // detail provider
        this.infoPanelConfig.options.provider = infoPanelProvider;
        this.infoPanelConfig.options.appSettings = this.appSettings;

        // search settings
        this.infoPanelProvider.inducingComponent = 'supplier-portal';

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        this.getSlickGridProviders(true);

        // facets
        this.facetsConfig.gridProvider = this.gridProviders[0];

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        (<any>this.exportProvider).componentContext = this;

        // search settings

    }

    ngAfterViewInit() {
        const sgp: SupplierPortalSlickGridProvider = (<SupplierPortalSlickGridProvider>this.slickGridComp.provider);
        sgp.retriveVCOptions();
        this.mediaInsideSupplierPortal.supplierPortalComponent = this;
        sgp.initListeners();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    toggleInfoPanel() {
        let infoPanelProvider: InfoPanelProvider = this.imfxInfoPanel.config.options.provider;
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
            this.gridProviders.push(this.injector.get(AssociatedMediaInsideSupplierPortalSlickGridProvider));
            return this.gridProviders;
        }
    }

    onInitCustomIfExist() {
        const router = this.injector.get(Router)
            , strategy = (<IMFXRouteReuseStrategy>router.routeReuseStrategy);
        strategy.currentComponentInstance = this;//dirty hack
        this.refreshSpecComps('versionGrid', () => {
            this.slickGridComp.provider.refreshGrid();
        });
    }

    isEnableCompleteVersion() {
        if(this.slickGridComp && this.slickGridComp.isGridReady){
            const sgp = this.slickGridComp.provider;
            let selectedRows = sgp.getSelectedRows();

            if(selectedRows.length === 1) {
                return true;
            } else {
                return false;
            }
        }

        return false;
    }

    completeVersion($event) {
        (<SupplierPortalSlickGridProvider>this.slickGridComp.provider).completeVersion($event);
    }
}
