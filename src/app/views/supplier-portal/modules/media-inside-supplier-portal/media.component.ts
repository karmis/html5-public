import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
// Views
import { ViewsConfig } from "../../../../modules/search/views/views.config";
import { MediaInsideSupplierPortalViewsProvider } from "./providers/views.provider";
// Form
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../../../modules/search/thumbs/search.thumbs.config";
import { SearchThumbsProvider } from "../../../../modules/search/thumbs/providers/search.thumbs.provider";
// Facets
// Search Settings
import { SearchSettingsConfig } from "../../../../modules/search/settings/search.settings.config";
// Modal
import { SearchColumnsService } from "../../../../modules/search/columns/services/search.columns.service";
import { SearchColumnsProvider } from "../../../../modules/search/columns/providers/search.columns.provider";
// Search Detail
// constants
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
import { CoreSearchComponent } from "../../../../core/core.search.comp";
import { ViewsProvider } from "../../../../modules/search/views/providers/views.provider";
import { MediaAppSettings } from "../../../media/constants/constants";
import { SupplierPortalComponent } from "../../supplier.portal.component";
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { SearchViewsComponent } from "../../../../modules/search/views/views";
import { SecurityService } from "../../../../services/security/security.service";
import { SlickGridProvider } from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { InfoPanelComponent } from '../../../../modules/search/info-panel/info.panel.component';
import { RaiseWorkflowWizzardProvider } from '../../../../modules/rw.wizard/providers/rw.wizard.provider';
import { AssociatedMediaInsideSupplierPortalSlickGridProvider } from './providers/associated.media.slick.grid.provider';
import {appRouter} from "../../../../constants/appRouter";
import {UploadProvider} from "../../../../modules/upload/providers/upload.provider";
import {UploadModel} from "../../../../modules/upload/models/models";

@Component({
    selector: 'media-inside-supplier-portal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: ViewsProvider, useClass: MediaInsideSupplierPortalViewsProvider},
        MediaAppSettings,
        SearchThumbsProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        IMFXModalProvider,
        RaiseWorkflowWizzardProvider
    ]
})

export class MediaInsideSupplierPortalComponent extends CoreSearchComponent {
    public supplierPortalComponent: SupplierPortalComponent;
    public refreshStarted: boolean = false;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('imfxInfoPanel', {static: false}) imfxInfoPanel: InfoPanelComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;

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
        providerType: AssociatedMediaInsideSupplierPortalSlickGridProvider,
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
                        'popupEl': '.mediaInsideSupplierPortalSettingsPopup'
                    }
                },
                externalWrapperEl: '#MediaInsideSupplierPortalGridWrapper',
                selectFirstRow: false,
                customProviders: {
                    viewsProvider: MediaInsideSupplierPortalViewsProvider
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });

    protected gridProviders: SlickGridProvider[] = null;
    private flagHide = true;

    // private routerEventsSubscr: Subscription = null;

    private needUpdateGrid: boolean = false;
    constructor(protected viewsProvider: ViewsProvider,
                protected appSettings: MediaAppSettings,
                protected router: Router,
                protected route: ActivatedRoute,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected securityService: SecurityService,
                protected modalProvider: IMFXModalProvider,
                protected cdr: ChangeDetectorRef,
                protected injector: Injector,
                protected uploadProvider: UploadProvider,
                // @Inject(SlickGridProvider) public supplierPortalProvider: SupplierPortalSlickGridProvider
    ) {
        super(injector);
        // super(router, route);
        this.simpleTransferProvider.updated.subscribe((setups: TransferdSimplifedType) => {
            console.log(setups);
            /*debugger*/
        });
        // this.routerEventsSubscr = router.events.subscribe((event: RouterEvent) => {
        //     if(event instanceof NavigationEnd) {
        //         (this.supplierPortalProvider as SupplierPortalSlickGridProvider).retriveRaiseWfOptions();
        //     }
        // });

        // views provider
        this.searchViewsConfig.options.provider = viewsProvider;

        // export
        this.exportProvider.componentContext = (<CoreSearchComponent>this);

        // search settings
        this.searchSettingsConfig.options.provider = this.searchSettingsProvider;
    }

    onClickRefreshGrid() {
        this.supplierPortalComponent.slickGridComp.provider.onRowChanged(null);
        this.needUpdateGrid = false;
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    ngAfterViewInit() {
        if(this.uploadProvider.baseUploadMenuRef) {
            this.uploadProvider.baseUploadMenuRef.notifyUpload.subscribe((data: { model: UploadModel, models: UploadModel[] }) => {
                console.log('notify in supplier');
                if (window.location.hash.indexOf(appRouter.supplier_portal.search) > -1) {
                    console.log('notify in supplier location ok');
                    const ssp = this.supplierPortalComponent.slickGridComp.provider;
                    if (ssp.getSelectedRow() && data.model.meta.version && ssp.getSelectedRow().ID === data.model.meta.version.id) {
                        console.log('notify in supplier version ok');
                        this.needUpdateGrid = true;
                        this.cdr.detectChanges();
                    }
                }
            });
        }
    }

    clearResultForAssociatedMediaGrid() {
        let gridProvider = (<SlickGridComponent>this.slickGridComp).provider;
        if (gridProvider.getData().length > 0) {
            gridProvider.PagerProvider.setPage(1, false);
            gridProvider.clearData(true);
        }
        // gridProvider.setPlaceholderText('ng2_components.ag_grid.noRowsToShow', true, {});
        // gridProvider.showPlaceholder();
    }

    getSlickGridProviders(doRefresh = false): SlickGridProvider[] {
        if(this.gridProviders && this.gridProviders.length > 0 && !doRefresh) {
            return this.gridProviders;
        } else {
            this.gridProviders = [];
            this.gridProviders.push(this.injector.get(AssociatedMediaInsideSupplierPortalSlickGridProvider));
            return this.gridProviders;
        }
    }
}
