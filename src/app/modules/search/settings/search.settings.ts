/**
 * Created by initr on 23.11.2016.
 */
import {
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { SearchSettingsConfig } from "./search.settings.config";
import { SearchSettingsProvider } from "./providers/search.settings.provider";
import { SearchSettingsService } from "./services/search.settings.service";
import * as $ from "jquery";
import { ExportProvider } from "../../export/providers/export.provider";
import { SlickGridProvider } from "../slick-grid/providers/slick.grid.provider";
import { ViewsProvider } from "../views/providers/views.provider";
import { CurrentViewsStateType } from "../views/types";
import { SecurityService } from "../../../services/security/security.service";
import { SlickGridComponent } from '../slick-grid/slick-grid';

@Component({
    selector: 'search-settings',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SearchSettingsProvider,
        SearchSettingsService,
    ]
})
export class SearchSettingsComponent {
    @ViewChild('submenu', {static: false}) submenu;
    @Input('gridProviders') gridProviders: SlickGridProvider[] = null;

    public config = <SearchSettingsConfig>{
        componentContext: <any>null,
        options: {
            provider: SearchSettingsProvider,
            service: SearchSettingsService,
            available: {
                export: {
                    enabled: true,
                    useCustomApi: false
                }
            }

        }
    };
    isMenuShow = {
        viewsModify: true,
        viewsSave: true,
        viewsSaveAs: true,
        viewsSaveAsGlobal: true,
        viewsSaveAsDefault: true,
        viewsDelete: true,
        viewsReset: true,
        viewsColumnsSetup: true,
        viewsColumnsAutosize: true,
        exportOptions: true,
    };
    private activeSlickGridProvider: SlickGridProvider;
    private hide = false;
    private currentSetupItemIsAvailable: boolean = true;
    private currentViewGlobal: boolean = true;
    private viewsProvider: ViewsProvider;
    @Input('activeSlickGridComp') private activeSlickGridComp: SlickGridComponent;

    constructor(@Inject(SearchSettingsService) protected service: SearchSettingsService,
                @Inject(SearchSettingsProvider) protected provider: SearchSettingsProvider,
                protected securityService: SecurityService,
                @Inject(ExportProvider) protected exportProvider: ExportProvider,
                // protected slickGridProvider: SlickGridProvider,
                private injector: Injector,
                public cdr: ChangeDetectorRef) {
        this.viewsProvider = this.injector.get(ViewsProvider);
        this.viewsProvider.onChangeViewState.subscribe((currentViewsState: CurrentViewsStateType) => {
            this.currentViewGlobal = currentViewsState.viewObject && currentViewsState.viewObject.IsPublic;
            this.currentSetupItemIsAvailable = currentViewsState.viewObject && currentViewsState.viewObject.ViewName ? true : false;
            this.cdr.markForCheck();
        });
    }

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
        if (config && config.options && config.options.provider) {
            this.provider = config.options.provider;
        }
        if (config && config.options && config.options.viewsProvider) {
            this.viewsProvider = config.options.viewsProvider;
        }
        this.provider.config = this.config;
    }

    ngAfterViewInit() {
        // this.config.componentContext.onModuleReady.subscribe(() => {
        if (this.gridProviders) {
            this.gridProviders.forEach(item => {
                item.onToggleViewMode.subscribe((resp) => {
                    this.hide = resp == 'tile';
                });
            })
        } else {
            for (let item of this.viewsProvider.getSlickGridProviders()) {
                item.onToggleViewMode.subscribe((resp) => {
                    this.hide = resp == 'tile';
                });
            }
        }
        // });

        const { forDetail } = this.config.options.available;
        const {
            viewsModify = true,
            viewsSave = true,
            viewsSaveAs = true,
            viewsSaveAsGlobal = true,
            viewsSaveAsDefault = true,
            viewsDelete = true,
            viewsReset = true,
            viewsColumnsSetup = true,
            viewsColumnsAutosize = true,
            exportOptions = true
        } = this.config.options.available.isMenuShow ? this.config.options.available.isMenuShow : this.isMenuShow;

        this.isMenuShow = {
            viewsModify: this.hasPermissionByName('views-modify') && !forDetail && viewsModify,
            viewsSave: this.hasPermissionByName('views-save') && this.canSaveGlobalView() && !forDetail && viewsSave,
            viewsSaveAs:  this.hasPermissionByName('views-save-as') && !forDetail && viewsSaveAs,
            viewsSaveAsGlobal: this.hasPermissionByName('views-details') && this.canSaveGlobalView() && !forDetail && viewsSaveAsGlobal,
            viewsSaveAsDefault: this.hasPermissionByName('views-save-as-default') && !forDetail && viewsSaveAsDefault,
            viewsDelete: this.hasPermissionByName('views-delete') && this.canSaveGlobalView() && !forDetail && viewsDelete,
            viewsReset: this.hasPermissionByName('views-reset') && !forDetail && viewsReset,
            viewsColumnsSetup: this.hasPermissionByName('views-columns-setup') && !forDetail && viewsColumnsSetup,
            viewsColumnsAutosize: this.hasPermissionByName('views-columns-autosize') && viewsColumnsAutosize,
            exportOptions: this.hasPermissionByName('export-options') && this.config.options.available.export.enabled === true && exportOptions,
        }
    }

    canSaveGlobalView() {
        return this.hasPermissionByName('views-save-as-global') ? true : !this.currentViewGlobal;
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    ngOnInit() {
    }

    ngOnChanges() {
    }

    public newView(): void {
        this.provider.newView();
    }

    public saveView(): void {
        if (this.currentSetupItemIsAvailable == false) {
            return;
        }
        this.provider.saveView();
    }

    public saveViewAs(): void {
        this.provider.saveViewAs();
    }

    public saveGlobalViewAs(): void {
        if (this.currentSetupItemIsAvailable == false) {
            return;
        }
        this.provider.saveGlobalViewAs();
    }

    public saveAsDefaultView(): void {
        if (this.currentSetupItemIsAvailable == false) {
            return;
        }
        this.provider.saveAsDefaultView();
    }

    public saveAsGlobalView(): void {
        if (this.currentSetupItemIsAvailable == false) {
            return;
        }
        this.provider.saveAsGlobalView();
    }

    public deleteView(): void {
        if (this.currentSetupItemIsAvailable == false) {
            return;
        }
        this.provider.deleteView();
    }

    public resetView(): void {
        this.provider.resetView();
    }

    public setupColumns(): void {
        if (this.gridProviders) {
            this.viewsProvider.setupColumns()
        } else {
            this.provider.setupColumns();
        }
    }

    public autoSizeColumns(): void {
        if (!this.activeSlickGridComp) {
            let sgp: SlickGridProvider = this.injector.get(SlickGridProvider);
            if (this.gridProviders) {
                sgp = this.gridProviders[0];
            }
            sgp.autoSizeColumns();
        } else {
            this.activeSlickGridComp.provider.autoSizeColumns();
        }

        //if is need to apply autosize for all slickgridcomps
        // for (let item of this.viewsProvider.getSlickGridProviders()) {
        //     item.autoSizeColumns();
        // }
    }

    public exportResults(): void {
        if (!this.activeSlickGridComp) {
            let sgp: SlickGridProvider = this.injector.get(SlickGridProvider);
            if (this.gridProviders) {
                sgp = this.gridProviders[0];
            }
            if (this.config.options.available.export.useCustomApi) {
                this.provider.exportResults({
                    viewsProvider: this.viewsProvider,
                    slickGridProvider: sgp,
                    useCustomApiUrl: true,
                    customApiUrl: sgp.getExportUrl()
                });
            } else {
                this.provider.exportResults({
                    viewsProvider: this.viewsProvider,
                    slickGridProvider: sgp
                });
            }
        } else {
            if (this.config.options.available.export.useCustomApi) {
                this.provider.exportResults({
                    viewsProvider: this.viewsProvider,
                    slickGridProvider: this.activeSlickGridComp.provider,
                    useCustomApiUrl: true,
                    customApiUrl: this.activeSlickGridComp.provider.getExportUrl()
                });
            } else {
                this.provider.exportResults({
                    viewsProvider: this.viewsProvider,
                    slickGridProvider: this.activeSlickGridComp.provider
                });
            }
        }
    }
}
