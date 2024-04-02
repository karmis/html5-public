import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Injector, Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { ActivatedRoute, Event as RouterEvent, NavigationEnd, Router } from "@angular/router";
// Views
import { ViewsConfig } from "../../../../modules/search/views/views.config";
import { MediaInsideMappingViewsProvider } from "./providers/views.provider";
// Form
import { SearchFormConfig } from "../../../../modules/search/form/search.form.config";
import { SearchFormProvider } from "../../../../modules/search/form/providers/search.form.provider";
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../../../modules/search/thumbs/search.thumbs.config";
import { SearchThumbsProvider } from "../../../../modules/search/thumbs/providers/search.thumbs.provider";
// Search Settings
import { SearchSettingsConfig } from "../../../../modules/search/settings/search.settings.config";
// Modal
import { SearchColumnsService } from "../../../../modules/search/columns/services/search.columns.service";
import { SearchColumnsProvider } from "../../../../modules/search/columns/providers/search.columns.provider";
// Search Detail
// constants
import { AppSettingsInterface } from "../../../../modules/common/app.settings/app.settings.interface";
// search component
import { ConsumerSettingsTransferProvider } from "../../../../modules/settings/consumer/consumer.settings.transfer.provider";
import { TransferdSimplifedType } from "../../../../modules/settings/consumer/types";
import { ExportProvider } from "../../../../modules/export/providers/export.provider";
import { SearchSettingsProvider } from "../../../../modules/search/settings/providers/search.settings.provider";
import { SearchThumbsComponent } from "../../../../modules/search/thumbs/search.thumbs";
import { SlickGridComponent } from "../../../../modules/search/slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../../modules/search/slick-grid/slick-grid.config";
import { SlickGridService } from "../../../../modules/search/slick-grid/services/slick.grid.service";
import { MediaInsideMediaAssociateSlickGridProvider } from "./providers/media.slick.grid.provider";
import { CoreSearchComponent } from "../../../../core/core.search.comp";
import { ViewsProvider } from "../../../../modules/search/views/providers/views.provider";
import { MediaAppSettings } from "../../../media/constants/constants";
import { MediaAssociateComponent } from "../../media-associate.component";
import { MediaInsideMappingSearchFormProvider } from "./providers/search.form.provider";
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { SearchViewsComponent } from "../../../../modules/search/views/views";
import { SecurityService } from "../../../../services/security/security.service";
import { SlickGridProvider } from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { RaiseWorkflowWizzardProvider } from '../../../../modules/rw.wizard/providers/rw.wizard.provider';
import { MediaAssociateSlickGridProvider } from "../../providers/media-associate.slick.grid.provider";
import { Subscription } from "rxjs";
import { SearchFormComponent } from "../../../../modules/search/form/search.form";
import { FacetsService } from '../../../../modules/search/facets1/facets.service';
import {skip} from "rxjs/operators";
import {appRouter} from "../../../../constants/appRouter";
import {UploadProvider} from "../../../../modules/upload/providers/upload.provider";
import {UploadModel} from "../../../../modules/upload/models/models";
import {TitlesVersionsSlickGridProvider} from "../../../titles/modules/versions/providers/titles.versions.slickgrid.provider";


@Component({
    selector: 'media-inside-media-associate',
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
        RaiseWorkflowWizzardProvider
    ]
})

export class MediaInsideMediaAssociateComponent extends CoreSearchComponent {
    localStorageService: any;
    public mediaComp: MediaAssociateComponent;
    public refreshStarted: boolean = false;
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    @ViewChild('searchFormComponent', {static: false}) searchFormComponent: SearchFormComponent;
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;

    // @Input() store: any;

    // @Output() raiseWFsettingsChange = new EventEmitter<any>();

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

    /**
     * Grid
     * @type {SlickGridConfig}
     */
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: MediaInsideMediaAssociateSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                isDraggable: {
                    enabled: true,
                },
                viewModeSwitcher: false,
                viewMode: 'table',
                // tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                exportPath: 'Media',
                searchType: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                pager: {},
                isTree: {
                    enabled: false
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaInsideMappingSettingsPopup'
                    }
                },
                externalWrapperEl: '#MediaInsideMappingGridWrapper',
                customProviders: {
                    viewsProvider: MediaInsideMappingViewsProvider
                },
                selectFirstRow: false,
                displayNoRowsToShowLabel: true,
                columnsOrderPrefix: 'associate_media.unassoc.version.columns.order.setups'
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: false
            }
        })
    });

    searchString: string;

    protected gridProviders: SlickGridProvider[] = null;
    private flagHide = true;
    private openFacets = false;

    private needUpdateGrid: boolean = false;
    constructor(protected viewsProvider: ViewsProvider,
                // @Inject('facetsService') public facetsService: FacetsService,
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
                @Inject(SlickGridProvider) public mediaProvider: MediaAssociateSlickGridProvider,
                protected uploadProvider: UploadProvider,) {
        super(injector);
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

    onClickRefreshGrid() {
        // const prvdr: MediaAssociateSlickGridProvider = this.mediaComp.slickGridComp.provider as MediaAssociateSlickGridProvider;
        // prvdr.onRowChanged({row: prvdr.getSelectedRow(), cell: null});
        // this.needUpdateGrid = false;
    }

    protected doDetectChanges = () => {
        this.cdr.detectChanges();
    };


    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    ngAfterViewInit() {
        this.mediaProvider.retriveRaiseWfOptions();
        this.slickGridComp.provider.onGridAndViewReady.subscribe(res => {
            this.searchFormComponent.doSearch({searchString: ""});
        });
    }


    onChangeRaiseWFflag(flag: boolean) {
        this.mediaProvider.raiseWFsettings.flag = flag;
        this.mediaProvider.saveRaiseWFsettingsOnServer();
    }

    clearResultForAssociatedMediaGrid() {
    }

    getSlickGridProviders(doRefresh = false): SlickGridProvider[] {
        if(this.gridProviders && this.gridProviders.length > 0 && !doRefresh) {
            return this.gridProviders;
        } else {
            this.gridProviders = [];
            // this.gridProviders.push(this.injector.get(SlickGridProvider));
            this.gridProviders.push(this.injector.get(MediaInsideMediaAssociateSlickGridProvider));
            return this.gridProviders;
        }
    }

    getActiveSlickGridComp() {
        return this.slickGridComp;
    }
}
