import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

import {ActivatedRoute, Router} from "@angular/router";
// Views
import {ViewsConfig} from "../../../../modules/search/views/views.config";
import {MediaInsideMappingViewsProvider} from "./providers/views.provider";
// Form
import {SearchFormConfig} from "../../../../modules/search/form/search.form.config";
import {SearchFormProvider} from "../../../../modules/search/form/providers/search.form.provider";
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../../../modules/search/thumbs/search.thumbs.config";
import {SearchThumbsProvider} from "../../../../modules/search/thumbs/providers/search.thumbs.provider";
// Search Settings
import {SearchSettingsConfig} from "../../../../modules/search/settings/search.settings.config";
// Modal
import {SearchColumnsService} from "../../../../modules/search/columns/services/search.columns.service";
import {SearchColumnsProvider} from "../../../../modules/search/columns/providers/search.columns.provider";
// Search Detail
// constants
import {AppSettingsInterface} from "../../../../modules/common/app.settings/app.settings.interface";
// search component
import {ConsumerSettingsTransferProvider} from "../../../../modules/settings/consumer/consumer.settings.transfer.provider";
import {TransferdSimplifedType} from "../../../../modules/settings/consumer/types";
import {ExportProvider} from "../../../../modules/export/providers/export.provider";
import {SearchSettingsProvider} from "../../../../modules/search/settings/providers/search.settings.provider";
import {SearchThumbsComponent} from "../../../../modules/search/thumbs/search.thumbs";
import {SlickGridComponent} from "../../../../modules/search/slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../../modules/search/slick-grid/slick-grid.config";
import {SlickGridService} from "../../../../modules/search/slick-grid/services/slick.grid.service";
import {MediaInsideMappingSlickGridProvider} from "./providers/media.slick.grid.provider";
import {CoreSearchComponent} from "../../../../core/core.search.comp";
import {ViewsProvider} from "../../../../modules/search/views/providers/views.provider";
import {MediaAppSettings} from "../../../media/constants/constants";
import {MappingComponent} from "../../mapping.component";
import {MediaInsideMappingSearchFormProvider} from "./providers/search.form.provider";
import {IMFXModalProvider} from '../../../../modules/imfx-modal/proivders/provider';
import {SearchViewsComponent} from "../../../../modules/search/views/views";
import {SecurityService} from "../../../../services/security/security.service";
import {SlickGridProvider} from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {RaiseWorkflowWizzardProvider} from '../../../../modules/rw.wizard/providers/rw.wizard.provider';
import {AssociatedMediaInsideMappingSlickGridProvider} from './providers/associated.media.slick.grid.provider';
import {MappingSlickGridProvider} from "../../providers/mapping.slick.grid.provider";
import {SearchFormComponent} from "../../../../modules/search/form/search.form";
import {FacetsService} from '../../../../modules/search/facets1/facets.service';
import {appRouter} from "../../../../constants/appRouter";
import {UploadProvider} from "../../../../modules/upload/providers/upload.provider";
import {UploadModel} from "../../../../modules/upload/models/models";

export enum MediaInsideMappingTabsEnum {
    'unassociated' = 'unassociated',
    'associated' = 'associated'
}

@Component({
    selector: 'media-inside-mapping',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        MediaAppSettings,
        SearchThumbsProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: MediaInsideMappingViewsProvider},
        {provide: SearchFormProvider, useClass: MediaInsideMappingSearchFormProvider},
        // BsModalRef,
        // BsModalService,
        RaiseWorkflowWizzardProvider,
    ]
})

export class MediaInsideMappingComponent extends CoreSearchComponent {
    localStorageService: any;
    public mappingComp: MappingComponent;
    public refreshStarted: boolean = false;
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    @ViewChild('associatedMediaSlickGridComp', {static: true}) associatedMediaSlickGridComp: SlickGridComponent;
    @ViewChild('searchFormComponent', {static: false}) searchFormComponent: SearchFormComponent;
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;

    @Input() store: any;

    // @Output() raiseWFsettingsChange = new EventEmitter<any>();
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
            provider: <SearchFormProvider>null,
            searchButtonAlwaysEnabled: true,
            doSearchOnStartup: false
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
     * Grid
     * @type {SlickGridConfig}
     */
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: MediaInsideMappingSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                isDraggable: {
                    enabled: true,
                },
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                exportPath: 'Media',
                searchType: 'Media',
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
                        'popupEl': '.mediaInsideMappingSettingsPopup'
                    }
                },
                externalWrapperEl: '#MediaInsideMappingGridWrapper',
                // tileParams: { // from media css
                //     tileWidth: 267 + 24,
                //     tileHeight: 276 + 12
                // },
                customProviders: {
                    viewsProvider: MediaInsideMappingViewsProvider
                },
                selectFirstRow: false,
                displayNoRowsToShowLabel: true,
                columnsOrderPrefix: 'associate.media.columns.order.setups'
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });
    protected associatedMediaGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: AssociatedMediaInsideMappingSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                exportPath: 'Media',
                searchType: 'Media',
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
                        'popupEl': '.mediaInsideMappingSettingsPopup'
                    }
                },
                externalWrapperEl: '#MediaInsideMappingGridWrapper',
                // tileParams: { // from media css
                //     tileWidth: 267 + 24,
                //     tileHeight: 276 + 12
                // },
                selectFirstRow: false,
                resetSelectedRow: true,
                customProviders: {
                    viewsProvider: MediaInsideMappingViewsProvider
                },
                columnsOrderPrefix: 'associate.media.columns.order.setups'
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });
    protected gridProviders: SlickGridProvider[] = null;
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
    private flagHide = true;
    private openFacets = false;
    private openedTabName = MediaInsideMappingTabsEnum.unassociated;
    private openedTabEnum = MediaInsideMappingTabsEnum;
    private needUpdateGrid: boolean = false;

    constructor(protected viewsProvider: ViewsProvider,
                @Inject('mediaFacetsService') public mediaFacetsService: FacetsService,
                public searchFormProvider: SearchFormProvider,
                protected appSettings: MediaAppSettings,
                protected router: Router,
                protected route: ActivatedRoute,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected securityService: SecurityService,
                protected modalProvider: IMFXModalProvider,
                public cdr: ChangeDetectorRef,
                protected injector: Injector,
                @Inject(SlickGridProvider) public mappingProvider: MappingSlickGridProvider,
                protected uploadProvider: UploadProvider,) {
        super(injector);
        // super(router, route);
        this.simpleTransferProvider.updated.subscribe((setups: TransferdSimplifedType) => {
            console.log(setups);
            /*debugger*/
        });

        // views provider
        this.searchViewsConfig.options.provider = viewsProvider;

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // thumbnails provider
        // this.searchThumbsConfig.options.provider = this.searchThumbsProvider;
        // this.searchThumbsConfig.options.appSettings = this.appSettings;

        // export
        this.exportProvider.componentContext = (<CoreSearchComponent>this);

        // search settings
        this.searchSettingsConfig.options.provider = this.searchSettingsProvider;
    }

    get currentTab() {
        return this.openedTabName;
    }


    protected doDetectChanges = () => {
        this.cdr.detectChanges();
    };

    onClickRefreshGrid() {
        const prvdr: MappingSlickGridProvider = this.mappingComp.slickGridComp.provider as MappingSlickGridProvider;
        prvdr.onRowChanged({row: prvdr.getSelectedRow(), cell: null}, true);
        this.needUpdateGrid = false;
    }


    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }


    // ngOnInit() {
    //     // super.ngOnInit();
    //     // this.localStorageService = localStorage;
    //     // var detailButtonState = this.localStorageService.getItem(
    //    'tmd.detailbutton.state.' + this.searchGridConfig.options.type);
    //     // if (detailButtonState == 'true') {
    //     //     this.openDetail = true;
    //     // }
    // }

    ngAfterViewInit() {
        this.store.facets$.subscribe(resp => {
            this.activateTab(MediaInsideMappingTabsEnum.unassociated);
        });
        this.mappingProvider.retriveRaiseWfOptions();
        this.slickGridComp.provider.onGridAndViewReady.subscribe((res: any) => {
            this.searchFormComponent.doSearch({searchString: ""});
        });

        if (this.uploadProvider.baseUploadMenuRef) {
            this.uploadProvider.baseUploadMenuRef.notifyUpload.subscribe((data: { model: UploadModel, models: UploadModel[] }) => {
                if (window.location.hash.indexOf(appRouter.associate.search) > -1) {
                    const ssp: MappingSlickGridProvider = this.mappingComp.slickGridComp.provider as MappingSlickGridProvider;
                    if (ssp.getSelectedRow() && data.model.meta.version && ssp.getSelectedRow().ID === data.model.meta.version.id) {
                        this.needUpdateGrid = true;
                        this.cdr.detectChanges();
                    }
                }
            });
        }
    }


    onChangeRaiseWFflag(flag: boolean) {
        this.mappingProvider.raiseWFsettings.flag = flag;
        // this.raiseWFsettingsChange.emit(this.raiseWFsettings);
        this.mappingProvider.saveRaiseWFsettingsOnServer();
    }


    activateTab(sTabName: MediaInsideMappingTabsEnum): void | null {
        if (this.openedTabName === sTabName) {
            return null;
        }
        this.openedTabName = sTabName;
    }

    clearResultForAssociatedMediaGrid() {
        let gridProvider = (<SlickGridComponent>this.associatedMediaSlickGridComp).provider;
        // if (gridProvider.getData().length > 0) {
            gridProvider.PagerProvider.setPage(1, false);
            gridProvider.clearData(true);
        // }

        // gridProvider.setPlaceholderText('ng2_components.ag_grid.noRowsToShow', true, {});
        // gridProvider.showPlaceholder();
    }

    getSlickGridProviders(doRefresh = false): SlickGridProvider[] {
        if (this.gridProviders && this.gridProviders.length > 0 && !doRefresh) {
            return this.gridProviders;
        } else {
            this.gridProviders = [];
            // this.gridProviders.push(this.injector.get(SlickGridProvider));
            this.gridProviders.push(this.injector.get(MediaInsideMappingSlickGridProvider));
            this.gridProviders.push(this.injector.get(AssociatedMediaInsideMappingSlickGridProvider));
            // this.gridProviders.push((<any>this.injector.get(this.slickGridComp.config.providerType)));
            return this.gridProviders;
        }
    }

    getActiveSlickGridComp() {
        // 'unassociated' | 'associated'
        if (this.openedTabName === 'associated') {
            return this.associatedMediaSlickGridComp;
        } else {
            return this.slickGridComp;
        }
    }
}
