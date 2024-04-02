/**
 * Created by Sergey Trizna on 27.11.2017.
 */
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    Output,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {SlickGridService} from './services/slick.grid.service';
import {SlickGridProvider} from './providers/slick.grid.provider';
import {CoreComp} from '../../../core/core.comp';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from './slick-grid.config';
import {OverlayComponent} from '../../overlay/overlay';
// import 'style-loader!./libs/jlynch7/css/smoothness/jquery-ui-1.8.16.custom.css';
import {SlickGridPanelBottomComp} from './comps/panels/bottom/bottom.panel.comp';
import {SlickGridPagerProvider} from './comps/pager/providers/pager.slick.grid.provider';
import {SlickGridInfoProvider} from './comps/info/providers/info.slick.grid.provider';
import {SlickGridPanelTopComp} from "./comps/panels/top/top.panel.comp";
import {SessionStorageService} from "ngx-webstorage";
import {SlickGridResp} from './types';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import $ from 'jquery';

require('./libs/jlynch7/lib/jquery-1.7.min.js');
let jqOld = (<any>window).$;
(<any>window).jqOld = jqOld;

(<any>window).jqOld.noConflict(true);
require('./libs/jlynch7/lib/jquery-ui-1.8.16.custom.min.js');

// (<any>window).jqOld =

require('./libs/jlynch7/lib/jquery.event.drag-2.2.js');
// require('./libs/jlynch7/lib/jquery.event.drop-2.2.js');
require('./libs/jlynch7/lib/jquery.mousewheel.js');

require('./libs/jlynch7/slick.core.js');
require('./libs/jlynch7/slick.grid.js');
require('./libs/jlynch7/slick.dataview.js');
require('./libs/jlynch7/slick.dataview.js');
require('./libs/jlynch7/plugins/slick.rowselectionmodel.js');
require('./libs/jlynch7/plugins/slick.autotooltips.js');
require('./libs/jlynch7/plugins/slick.rowmovemanager.js');
require('./libs/jlynch7/plugins/slick.headerbuttons.js');


@Component({
    selector: 'slick-grid',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss',
        // 'libs/jlynch7/slick.grid.css'
    ],
    host: {
        // '(document:click)': 'onDocumentClick($event)',
        '(window:resize)': 'onResize($event)',
        '(document:click)': 'onGridWrapperClick($event)'
    },
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridPagerProvider,
        SlickGridInfoProvider
    ]
})

export class SlickGridComponent extends CoreComp {
    public slickPlugin;
    public isGridReady: boolean = false;
    @Output() onGridReady = new EventEmitter<boolean>();
    protected readonly setups: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                headerButtons: false,
                refreshOnNavigateEnd: false,
                dragDropCellEvents: {
                    dropCell: false,
                    dragEnterCell: false,
                    dragLeaveCell: false,
                    dragStartCell: false,
                    dragEndCell: false,
                    dragInit: false
                },
                overlay: {
                    zIndex: 100
                },
                viewModeSwitcher: true,
                clientSorting: false,
                enableSorting: true,
                showMediaLogger: true,
                tileSource: [],
                reorderRows: false,
                viewMode: 'table',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                rowHeightWithThumb: 100,
                customProviders: {
                    viewsProvider: null
                },
                pager: {
                    enabled: true,
                    perPage: 50,
                    mode: 'full',
                    currentPage: 1
                },
                info: {
                    enabled: true
                },
                isExpandable: {
                    enabled: false
                },
                isDraggable: {
                    enabled: false,
                },
                isTree: {
                    enabled: false
                },
                defaultColumns: [],
                actualColumns: [],
                globalColumns: [],
                data: [],
                tileParams: { // base
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12,
                    isThumbnails: true,
                    isIcons: true
                },
                topPanel: {
                    enabled: false
                },
                bottomPanel: {
                    enabled: true,
                    typeComponent: SlickGridPanelBottomComp
                },
                hasOuterFilter: false,
                search: {
                    enabled: true
                },
                selectFirstRow: true,
                resetSelectedRow: false,
                canSetFocus: false,
                availableContextMenu: false,
            },
            plugin: <SlickGridConfigPluginSetups>{
                autoHeight: false,
                rowHeight: 30,
                showHeaderRow: false,
                leaveSpaceForNewRows: false,
                forceFitColumns: false,
                editable: false,
                enableAddRow: false,
                enableCtrlASelection: false,
                enableCellNavigation: false,
                multiSelect: false,
                fullWidthRows: false,
                allowBigFullWidthRows: false,
                bigFullWidthRowsDelegate: null,
                multiAutoHeight: false,
                enableNativeGridFocus: false,
                // forceSyncScrolling: true,
                explicitInitialization: true,
                // enableAsyncPostRender: false,
                // asyncPostRenderDelay: 100,
                // , enableCellNavigation: false
                // , asyncEditorLoading: true
                // , autoEdit: false
                // , topPanelHeight: 60,
                frozenColumn: -1, // -1 for suppress
                // multiColumnSort: true
                // frozenRow: 5,
                suppressSelection: false
            }
        })
    });
    private destroyed$: Subject<any> = new Subject();
    private isError: boolean = false;
    private overlayErrorRepeatMessage: boolean = false;

    @ViewChild('grid', {static: false}) private gridEl: ElementRef;
    @ViewChild('slickGridWrapper', {static: false}) public gridWrapperEl: ElementRef;
    @ViewChild('slickGridOverlay', {static: false}) private overlay: OverlayComponent;
    @ViewChild('slickGridTopPanel', {static: false}) private topPanel: SlickGridPanelTopComp;
    @ViewChild('slickGridBottomPanel', {static: false}) private bottomPanel: SlickGridPanelBottomComp;

    constructor(protected injector: Injector,
                public cdr: ChangeDetectorRef,
                public vcRef: ViewContainerRef,
                public sessionStorage: SessionStorageService,
                // protected slickGridPanelProvider: SlickGridPanelProvider
    ) {
        super(injector);
    }


    get provider(): SlickGridProvider {
        const prod = this.config && this.config.provider ? this.config.provider : null;
        return (<SlickGridProvider>prod);
    }

    get service(): SlickGridService {
        return (<SlickGridService>this.config.service);
    }

    get options(): SlickGridConfigOptions {
        return (<SlickGridConfigOptions>this.config.options);
    }

    get plugin(): SlickGridConfigPluginSetups {
        return (<SlickGridConfigPluginSetups>this.config.options.plugin);
    }

    get module(): SlickGridConfigModuleSetups | boolean {
        if (!this.config) {
            return false;
        }
        // @ts-ignore
        return this.config.options.module
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        new Promise((resolve, reject) => {
            if (this.destroyed$.isStopped) {
                return;
            }
            (this.config.options.plugin as SlickGridConfigPluginSetups).bigFullWidthRowsDelegate = this.provider.prepareColsForAutoSize.bind(this.provider);
            this.provider.cdr = this.cdr;
            this.provider.init({
                grid: this.gridEl,
                overlay: this.overlay,
                gridWrapper: this.gridWrapperEl,
                topPanel: this.topPanel,
                bottomPanel: this.bottomPanel
            }, (<any>window).jqOld);

            resolve();
        }).then(
            () => {
                if (this.destroyed$.isStopped) {
                    return;
                }

                if (this.isModuleReady) {
                    this.isGridReady = true;
                    this.onGridReady.emit(this.isGridReady);
                } else {
                    this.onModuleReady.subscribe(() => {
                        this.isGridReady = true;
                        this.onGridReady.emit(this.isGridReady);
                    });
                }

                $(this.gridWrapperEl.nativeElement)
                    .unbind('mouseup').bind('mouseup', () => {
                        this.provider.onGridMouseUp.next()
                    })

            },
            (err) => {
                console.log(err);
            }
        );
    }

    ngOnDestroy() {
        // console.log('Destroy', this);
        this.destroyed$.next();
        this.destroyed$.complete();
        this.provider.routeSubscr && this.provider.routeSubscr.unsubscribe();
        this.provider.routerEventsSubscr && this.provider.routerEventsSubscr.unsubscribe();
    }

    onClickCancelInOverlay() {
        this.provider.onClickCancelInOverlay();
        // this.overlayErrorRepeatMessage = true;
        // this.provider.setCustomPlaceholder($(this.gridWrapperEl.nativeElement).find('#overlayErrorRepeatMessage'));
        // this.provider.updatePlaceholderPosition();
        // this.provider.showPlaceholder();
        // this.provider.clearData(true);
        // this.overlay.hide();
        // this.cdr.markForCheck();
    }

    onClickRepeat() {
        this.overlayErrorRepeatMessage = false;
        this.provider.clearPlaceholder();
        this.provider.clearData();
        if (this.provider.lastSearchModel) {
            this.provider.buildPage(this.provider.lastSearchModel);
        }

        this.cdr.markForCheck();

    }

    onResize($event) {
    }

    onGridWrapperClick($event) {
        if (this.config && this.config.provider) {
            this.provider.onGridWrapperClick($event);
        }
    }

    onDocumentClick($event) {
        this.provider.tryOpenPopup($event);
    }

    setService(service: SlickGridService) {
        this.config.service = service;
    }

    whenGridReady(cb) {
        let self = this
            , obs;
        if (this.isGridReady) {
            cb(this);
        } else {
            obs = this.onGridReady
                .pipe(
                    take(1),
                    takeUntil(self.destroyed$)
                ).subscribe(() => {
                    cb(self);
                    obs.unsubscribe();
                });
        }
    }

    whenGridRendered(cb) {
        let self = this
            , renderCompleteCB = cb
            , obsGR
            , obsGRU;

        if (this.isGridReady) {
            gridReadyCB();
        }
        // obsGR = this.onGridReady
        this.onGridReady
            .pipe(
                take(1),
                takeUntil(self.destroyed$)
            ).subscribe(() => {
            gridReadyCB();
            // obsGR.unsubscribe();
        });

        function gridReadyCB() {
            // obsGRU = self.provider.onGridRowsUpdated
            self.provider.onGridRowsUpdated
                .pipe(
                    take(1),
                    takeUntil(self.destroyed$)
                ).subscribe(function (resp: SlickGridResp) {
                self.provider.slick.onRenderComplete
                    .subscribe(function cbF(e, grid) {
                        self.provider.slick.onRenderComplete.unsubscribe(cbF);
                        if (self.destroyed$.isStopped) {
                            return;
                        }
                        renderCompleteCB(e, grid);
                    });
                // obsGRU.unsubscribe();
            });
        }

    }

    showOverlay(){
        this.overlay.show(this.gridWrapperEl.nativeElement)
    }

    hideOverlay(){
        this.overlay.hide(this.gridWrapperEl.nativeElement)
    }
}
