import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
// Views
import {ViewsConfig} from '../../../../../modules/search/views/views.config';
import {SearchViewsComponent} from "../../../views/views";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import {SlickGridProvider} from "../../../slick-grid/providers/slick.grid.provider";
import {VersionsTabSlickGridProvider} from "./providers/versions.tab.slickgrid.provider";
import {SlickGridComponent} from "../../../slick-grid/slick-grid";
import {SlickGridResp, SlickGridRowData} from "../../../slick-grid/types";
import {TitlesSlickGridService} from "../../../../../views/titles/modules/versions/services/slickgrid.service";
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {UploadProvider} from '../../../../upload/providers/upload.provider';
import {UploadComponent, UploadMethod} from '../../../../upload/upload';
import {SecurityService} from "../../../../../services/security/security.service";
import {SearchThumbsComponent} from "../../../thumbs/search.thumbs";
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../../thumbs/search.thumbs.config";
import {SearchThumbsProvider} from "../../../thumbs/providers/search.thumbs.provider";
import {VersionAppSettings} from "../../../../../views/version/constants/constants";
import {VersionsTabViewsProvider} from "./providers/views.provider";
import {ViewsProvider} from "../../../views/providers/views.provider";
import {VersionViewsProvider} from "../../../../../views/version/providers/views.provider";
import {AsperaUploadService} from "../../../../upload/services/aspera.upload.service";

@Component({
    selector: 'imfx-versions-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: SlickGridService, useClass: TitlesSlickGridService},
        SlickGridProvider,
        VersionsTabSlickGridProvider,
        {provide: SlickGridProvider, useClass: VersionsTabSlickGridProvider},
        ViewsProvider,
        {provide: ViewsProvider, useClass: VersionsTabViewsProvider},
        VersionAppSettings
    ]
})
@Injectable()
export class IMFXVersionsTabComponent {
    config: any;
    compIsLoaded = false;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('versionSlickGrid', {static: true}) slickGridComp: SlickGridComponent;

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

    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'VersionGrid',
        }
    };

    @ViewChild('versionSlickGrid', {static: false}) private versionSlickGrid: SlickGridComponent;
    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: VersionsTabSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                searchType: 'versions',
                // isThumbnails: true,
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                search: {
                    enabled: false
                },
                pager: {
                    enabled: false
                },
                info: {
                    enabled: true
                },
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.versionSettingsPopup'
                    }
                },
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                availableContextMenu: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 35,
                forceFitColumns: false
            }
        })
    });
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef, private injector: Injector, protected securityService: SecurityService,
                private uploadProvider: UploadProvider,) {
    }

    ngAfterViewInit() {
        this.versionSlickGrid.provider.getSlick().setOptions(this.versionSlickGrid.options.plugin);

        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.compIsLoaded = true;
            setTimeout(()=>{
                (<VersionsTabSlickGridProvider>this.versionSlickGrid.provider).getRowsById(this.config.file.ID, this.config.isCarrierDetail).pipe(
                    takeUntil(this.destroyed$)
                ).subscribe(
                    (resp: SlickGridResp) => {
                        this.versionSlickGrid.provider.buildPageByData(resp);
                        this.versionSlickGrid.provider.onGridEndSearch.emit(true);
                    }
                )
            });
        }

        this.bindUploadEvents();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public loadComponentData() {
        if(!this.versionSlickGrid || !this.versionSlickGrid.provider) {
            return;
        }
        if (!this.compIsLoaded) {
            (<VersionsTabSlickGridProvider>this.versionSlickGrid.provider).getRowsById(this.config.file.ID).pipe(
                takeUntil(this.destroyed$)
            ).subscribe(
                (resp: SlickGridResp) => {
                    this.versionSlickGrid.provider.buildPageByData(resp);
                    this.versionSlickGrid.provider.onGridEndSearch.emit(true);
                    this.compIsLoaded = true;
                }
            )
        }
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    hasPermission(path) {
        return this.securityService.hasPermissionByPath(path);
    }

    private bindUploadEvents() {

        this.slickGridComp.provider.onGridAndViewReady.subscribe(() => {
            this.uploadProvider.fetchUploadMethod().subscribe((method: UploadMethod) => {
                if (method === 'aspera') {
                    // this.slickGridComp.provider.onDropCell.subscribe((data: { row: SlickGridRowData }) => {
                    const asperaService: AsperaUploadService = this.uploadProvider.getService(this.uploadProvider.getUploadMethod()) as AsperaUploadService;
                    setTimeout(() => {
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
