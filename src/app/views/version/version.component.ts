import {ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
// Views
import {ViewsConfig} from "../../modules/search/views/views.config";
import {VersionViewsProvider} from "./providers/views.provider";
// Grid
import {GridConfig} from "../../modules/search/grid/grid.config";
// Form
import {SearchFormConfig} from "../../modules/search/form/search.form.config";
import {SearchFormProvider} from "../../modules/search/form/providers/search.form.provider";
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../modules/search/thumbs/search.thumbs.config";
import {SearchThumbsProvider} from "../../modules/search/thumbs/providers/search.thumbs.provider";
// Search Settings
import {SearchSettingsConfig} from "../../modules/search/settings/search.settings.config";
// Search Modal
// Modal
// Search Columns
import {SearchColumnsService} from "../../modules/search/columns/services/search.columns.service";
import {SearchColumnsProvider} from "../../modules/search/columns/providers/search.columns.provider";
// Info Modal
// Search Detail
import {DetailConfig} from "../../modules/search/detail/detail.config";
// Search Settings
import {SearchRecentConfig} from "../../modules/search/recent/search.recent.config";
import {SearchRecentProvider} from "../../modules/search/recent/providers/search.recent.provider";

import {SearchAdvancedConfig} from "../../modules/search/advanced/search.advanced.config";
import {SearchAdvancedProvider} from "../../modules/search/advanced/providers/search.advanced.provider";
// constants
import {VersionAppSettings} from "./constants/constants";
import {AppSettingsInterface} from "../../modules/common/app.settings/app.settings.interface";
import {ExportProvider} from "../../modules/export/providers/export.provider";
import {SearchSettingsProvider} from "../../modules/search/settings/providers/search.settings.provider";
import {ClipEditorService} from "../../services/clip.editor/clip.editor.service";
import {SearchThumbsComponent} from "../../modules/search/thumbs/search.thumbs";
import {CoreSearchComponent} from "../../core/core.search.comp";
// search component
import {SlickGridComponent} from "../../modules/search/slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../modules/search/slick-grid/slick-grid.config";
import {SlickGridProvider} from "../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../modules/search/slick-grid/services/slick.grid.service";
import {VersionSlickGridProvider} from "./providers/version.slick.grid.provider";
import {ViewsProvider} from "../../modules/search/views/providers/views.provider";
import {IMFXModalProvider} from "../../modules/imfx-modal/proivders/provider";
import {VersionWizardProvider} from "../../modules/version-wizard/providers/wizard.provider";
import {VersionWizardService} from "../../modules/version-wizard/services/wizard.service";
import {SearchViewsComponent} from "../../modules/search/views/views";
import {SecurityService} from "../../services/security/security.service";
import {InfoPanelConfig} from '../../modules/search/info-panel/info.panel.config';
import {InfoPanelProvider} from '../../modules/search/info-panel/providers/info.panel.provider';
import {RaiseWorkflowWizzardProvider} from '../../modules/rw.wizard/providers/rw.wizard.provider';
import {UploadProvider} from "../../modules/upload/providers/upload.provider";
import {UploadComponent, UploadMethod} from "../../modules/upload/upload";
import {SlickGridRowData} from "../../modules/search/slick-grid/types";
import {IMFXRouteReuseStrategy} from '../../strategies/route.reuse.strategy';
import {FacetsConfig} from '../../modules/search/facets1/models/facets.config';
import {FacetsService} from '../../modules/search/facets1/facets.service';
import {FacetsStore} from '../../modules/search/facets1/store/facets.store';
import {skip} from "rxjs/operators";
import {AsperaUploadService} from "../../modules/upload/services/aspera.upload.service";
import {SlickGridTreeRowData} from '../../modules/search/slick-grid/types';

@Component({
    selector: 'version',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ViewsProvider,
        {provide: ViewsProvider, useClass: VersionViewsProvider},
        VersionAppSettings,
        // VersionDetailProvider,
        // {provide: DetailProvider, useClass: VersionDetailProvider},

        InfoPanelProvider,
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsService,
        SearchColumnsProvider,
        SearchSettingsProvider,
        VersionWizardProvider,
        VersionWizardService,
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: VersionSlickGridProvider},
        SlickGridService,
        IMFXModalProvider,
        // BsModalRef,
        // BsModalService,
        RaiseWorkflowWizzardProvider,
        FacetsService,
        FacetsStore
    ]
})

export class VersionComponent extends CoreSearchComponent {
    openDetail: boolean;
    localStorageService: any;
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
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
            // forbiddenTags: ['CONTRIBUTOR_ID']
        }
    };
    /**
     * Facets
     * @type {FacetsConfig}
     */
    facetsConfig: FacetsConfig = {
        parentContext: this,
        service: this.facetsService,
        store: this.facetsStore,
        searchForm: this.searchFormProvider
    };

    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
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
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
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
                viewModeSwitcher: true,
                viewMode: 'table',
                tileSource: ['SER_TITLE', 'TITLE', 'VERSION', 'SER_NUM', 'DURATION_text'],
                exportPath: 'Version',
                searchType: 'versions',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
                },
                pager: {},
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                popupsSelectors: {
                    settings: {
                        popupEl: '.versionSettingsPopup',
                        popupMultiEl: '.versionMultiSettingsPopup'
                    }
                },
                tileParams: { // from media css
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12
                },
                displayNoRowsToShowLabel: true,
                refreshOnNavigateEnd: true
            } as SlickGridConfigModuleSetups,
            plugin: {
                multiSelect: true
            } as SlickGridConfigPluginSetups
        })
    });
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
     * Detail
     * @type {DetailConfig}
     */
    private infoPanelConfig = <InfoPanelConfig>{
        componentContext: this,
        options: {
            provider: <InfoPanelProvider>null,
            // needApi: false,
            typeDetails: 'version-details',
            // showInDetailPage: false,
            detailsviewType: 'VersionDetails',
            // friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            friendlyNamesForDetail: 'FriendlyNames.TM_PG_RL',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            searchType: 'versions'
        },
    };

    private flagHide = true;
    private openFacets = false;

    protected expandedAll: boolean = true;

    constructor(protected infoPanelProvider: InfoPanelProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: VersionAppSettings,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                public exportProvider: ExportProvider,
                public clipEditorService: ClipEditorService,
                private facetsService: FacetsService,
                private facetsStore: FacetsStore,
                private uploadProvider: UploadProvider,
                protected injector: Injector) {
        super(injector);

        // detail provider
        this.infoPanelConfig.options.provider = infoPanelProvider;
        this.infoPanelConfig.options.appSettings = this.appSettings;

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        this.searchFormProvider.onSubmitForm.pipe(skip(1)).subscribe((res: any) => {
            this.facetsStore.clearFacets();
        });

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        this.exportProvider.componentContext = this;
    }

    ngAfterViewInit() {
        this.bindUploadEvents();
        this.expandedAll = (this.slickGridComp.module as SlickGridConfigModuleSetups).isTree.expandMode !== 'allLevels';
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    hasPermission(path) {
        //return true;
        return this.securityService.hasPermissionByPath(path);
    }

    onInitCustomIfExist() {
        const router = this.injector.get(Router)
            , strategy = (<IMFXRouteReuseStrategy>router.routeReuseStrategy);
        strategy.currentComponentInstance = this;//dirty hack
        this.refreshSpecComps('versionGrid', () => {
            this.slickGridComp.provider.refreshGrid();
        });
    }

    private bindUploadEvents() {
        this.slickGridComp.provider.onGridAndViewReady.subscribe(() => {
            this.uploadProvider.fetchUploadMethod().subscribe((method: UploadMethod) => {
                if (method === 'aspera') {
                    // this.slickGridComp.provider.onDropCell.subscribe((data: { row: SlickGridRowData }) => {
                    const asperaService: AsperaUploadService = this.uploadProvider.getService(this.uploadProvider.getUploadMethod()) as AsperaUploadService;
                    this.slickGridComp.provider.onGridEndSearch.subscribe(() => {
                        asperaService.initAspera({rebindEvents: true, externalContext: this});
                    });
                    this.slickGridComp.provider.onScrollGrid.subscribe(() => {
                        setTimeout(() => {
                            asperaService.initAspera({rebindEvents: true, externalContext: this});
                        })
                    });
                } else {
                    this.slickGridComp.provider.onDropCell.subscribe((data: { row: SlickGridRowData }) => {
                        if (data && data.row && data.row.ID) {
                            const up: UploadProvider = this.injector.get(UploadProvider);
                            up.forcedUploadMode = 'version';
                            const upr = up.onReady.subscribe(() => {
                                if (up.droppedToBlock === 'version-row') {
                                    const uc: UploadComponent = up.moduleContext;
                                    uc.setVersion({id: data.row.ID, text: data.row.FULLTITLE}, data);
                                    uc.changeAssociateMode(up.forcedUploadMode);
                                    uc.disableMedia();
                                    // upr.unsubscribe();
                                }
                            });
                        }
                    });
                }
            })
        })
    }
}
