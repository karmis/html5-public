/**
 * Created by Sergey Trizna on 29.11.2017.
 */
import {catchError, filter, switchMap} from 'rxjs/operators';
import {
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Injectable,
    Injector
} from '@angular/core';
import {CoreProvider} from '../../../../core/core.provider';
import {SearchModel} from '../../../../models/search/common/search';
import {SlickGridConfig, SlickGridConfigModuleSetups, SlickGridConfigPluginSetups} from '../slick-grid.config';
import {
    FinalSearchRequestType,
    RESTColumnSettings,
    RESTColumSetup,
    SlickGridButtonFormatterEventData,
    SlickGridCheckBoxFormatterEventData,
    SlickGridColumn,
    SlickGridElementsForInit,
    SlickGridElementsForResize,
    SlickGridEventData,
    SlickGridExpandableRowData,
    SlickGridFormatterData,
    SlickGridInjectedContexts,
    SlickGridRequestError,
    SlickGridResp,
    SlickGridRowData,
    SlickGridScrollEvent,
    SlickGridSelect2FormatterEventData,
    SlickGridTextFormatterEventData,
    SlickGridTreeRowData
} from '../types';
import {ActivatedRoute, Event as RouterEvent, NavigationStart, Router} from '@angular/router';
import * as _ from 'lodash';
import {Guid} from '../../../../utils/imfx.guid';
import {CoreSearchComponent} from '../../../../core/core.search.comp';
import {SlickGridService} from '../services/slick.grid.service';
import {OverlayComponent} from '../../../overlay/overlay';
import {RecentModel} from '../../recent/models/recent';
import {ViewsProvider} from '../../views/providers/views.provider';
import {appRouter} from '../../../../constants/appRouter';
import {SearchFormProvider} from '../../form/providers/search.form.provider';
import {TileFormatter} from '../formatters/tile/tile.formatter';
import {TranslateService} from '@ngx-translate/core';
import {SlickGridPagerProvider} from '../comps/pager/providers/pager.slick.grid.provider';
import {SlickGridInfoProvider} from '../comps/info/providers/info.slick.grid.provider';
import ResizeObserver from 'resize-observer-polyfill';
import {DebounceProvider} from '../../../../providers/common/debounce.provider';
import {ViewColumnsType, ViewType} from '../../views/types';
import * as $ from 'jquery';
import {SlickGridComponent} from '../slick-grid';
import {of, Subject, Subscription} from 'rxjs';
import {ArrayProvider} from '../../../../providers/common/array.provider';
import {ClipboardProvider} from '../../../../providers/common/clipboard.provider';
import {Select2Formatter} from '../formatters/select2/select2.formatter';
import {LookupFormatter} from '../formatters/lookup/lookup.formatter';
import {LookupService} from '../../../../services/lookup/lookup.service';
import {HttpErrorResponse} from "@angular/common/http";
import {DatetimeFormatter} from "../formatters/datetime/datetime.formatter";
import {Observable} from "rxjs/Rx";
import {ServerGroupStorageService} from "../../../../services/storage/server.group.storage.service";
import {NotificationService} from "../../../notification/services/notification.service";
import {ServerStorageService} from "../../../../services/storage/server.storage.service";

declare var Slick: any;

export interface SlickGridSearchData {
    newModel: SearchModel;
}

@Injectable()
export class SlickGridProvider extends CoreProvider {
    lastData: any;
    cdr?: ChangeDetectorRef;
    _selectedRowsIds = [];
    onRowMouseClick: EventEmitter<SlickGridEventData> = new EventEmitter();
    onRowMouseDblClick: EventEmitter<SlickGridEventData> = new EventEmitter();
    onRowMouseDown: EventEmitter<SlickGridEventData> = new EventEmitter();
    onRowMouseUp: EventEmitter<SlickGridEventData> = new EventEmitter();
    onRowMouseRightClick: EventEmitter<SlickGridEventData> = new EventEmitter();
    onRowDelete: EventEmitter<SlickGridEventData> = new EventEmitter();
    // only when was changed (<SlickGridRowData>).id
    onDataUpdated: EventEmitter<SlickGridEventData> = new EventEmitter();
    onScrollGrid: EventEmitter<SlickGridScrollEvent> = new EventEmitter();
    onToggleViewMode: EventEmitter<string> = new EventEmitter<string>();
    onGridRowsUpdated: EventEmitter<SlickGridResp> = new EventEmitter<SlickGridResp>();
    onSelectRow: EventEmitter<number[]> = new EventEmitter<number[]>();
    onUnSelectRow: EventEmitter<number[]> = new EventEmitter<number[]>();
    onSelectViewOrColumn: EventEmitter<boolean> = new EventEmitter();
    onGridStartSearch: EventEmitter<SlickGridSearchData> = new EventEmitter();
    onGridEndSearch: EventEmitter<any> = new EventEmitter();
    onDropCell: EventEmitter<{ row: SlickGridRowData }> = new EventEmitter();
    onDragEnterCell: EventEmitter<{ row: SlickGridRowData }> = new EventEmitter(); // commented
    onDragLeaveCell: EventEmitter<{ row: SlickGridRowData }> = new EventEmitter(); // commented
    onDragStartCell: EventEmitter<{ row: SlickGridRowData }> = new EventEmitter();
    onGridInited: EventEmitter<any> = new EventEmitter();
    onGetValidation: EventEmitter<any> = new EventEmitter<any>();
    onDropToGrid: EventEmitter<{ data: SlickGridFormatterData, event: any }> = new EventEmitter<{ data: SlickGridFormatterData, event: any }>();
    onGridMouseUp: EventEmitter<void> = new EventEmitter<void>();
    popupOpened?: boolean = false;
    popupOpenedId?: number = null;
    // events of formattersaddActualColumn
    formatterSelect2OnSelect: EventEmitter<SlickGridSelect2FormatterEventData> = new EventEmitter();
    formatterTextOnChange: EventEmitter<SlickGridTextFormatterEventData> = new EventEmitter();
    formatterCheckBoxOnChange: EventEmitter<SlickGridCheckBoxFormatterEventData> = new EventEmitter();
    formatterPlayButtonOnClick: EventEmitter<SlickGridButtonFormatterEventData> = new EventEmitter();
    formatterPlayButtonOnLoading: EventEmitter<SlickGridButtonFormatterEventData> = new EventEmitter();
    formatterPlayButtonOnLoadingError: EventEmitter<boolean> = new EventEmitter();
    formatterTimedcodeIsValid: EventEmitter<any> = new EventEmitter();
    formatterTimedcodeSetSomEom: EventEmitter<any> = new EventEmitter();
    formatterPlayButtonActiveId: number | string = 'none';
    formatterSetReadOnly: EventEmitter<any> = new EventEmitter();
    uid: string;
    slick: any;
    searchFormProvider?: SearchFormProvider;
    compFactoryResolver?: ComponentFactoryResolver;
    appRef?: ApplicationRef;
    router?: Router;
    route?: ActivatedRoute;
    lookupService: LookupService;
    routerEventsSubscr: Subscription;
    routeSubscr: Subscription;
    // public PanelProvider?: SlickGridPanelProvider;
    PagerProvider?: SlickGridPagerProvider; //  assigned in pager.comp
    InfoProvider?: SlickGridInfoProvider; // assigned in info.comp
    prevRowId = null;
    refreshTimer;
    lastScrollOffset;
    lastScrollTop = {};
    selectedRows = [];
    arrayProvider: ArrayProvider;
    clipboardProvider: ClipboardProvider;
    extendedColumns = [];
    facetsFieldOverrideList = [];
    onGridAndViewReady: EventEmitter<any> = new EventEmitter();
    protected translate?: TranslateService;
    protected prevStateOfReset: boolean;
    private overlay: OverlayComponent;
    private gridEl: ElementRef;
    private gridWrapperEl: ElementRef;
    private columnsForSetTableViewMode: any[];
    private originalData: any[] = [];
    private loadingIndicator = null;
    private debounceProvider: DebounceProvider;
    private _originalView: ViewType;
    private _originalColumns: ViewColumnsType;
    /**
     * Build page
     * @param searchModel
     * @param resetSearch
     */
    private _overlayShowed = false;
    private checkedRows: number[] = [];
    protected _cbVars = {
        isDbl: false,
        isMouseDown: false,
        isShiftPressed: false,
        firstElementShifter: null,
        lastElementShifter: null,
        isCtrlPressed: false
    };
    private slick_onClick = _.debounce((event, args) => {
        const self = this
            , cbVars = self._cbVars;

        if (cbVars.isDbl) {
            cbVars.isDbl = false;
            return false;
        }

        const rowData: SlickGridRowData = self.getSlick().getDataItem(args.row);
        self.onRowMouseClick.emit({
            row: rowData,
            cell: args.cell,
            event: event
        } as SlickGridEventData);
    }, 200);
    protected slick_onMouseDown;
    private slick_onRenderComplete = _.debounce((event, args) => {
        this.destroyUsedUpFormatters(); // unattach formatters embedded views (temporary decision)
    }, 1000);
    protected prevSelectedRows = [];
    private refreshContainer = null;
    private searchSubject = new Subject();
    private storedSearchParams = {};
    private selectAllHandler = null;

    protected serverGroupStorageService: ServerGroupStorageService;
    protected notificationService: NotificationService;
    protected serverStorage: ServerStorageService;

    constructor(public injector: Injector) {
        super(injector);
        this.uid = Guid.newGuid();

        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.translate = injector.get(TranslateService);
        this.arrayProvider = injector.get(ArrayProvider);
        this.clipboardProvider = injector.get(ClipboardProvider);
        this.lookupService = injector.get(LookupService);
        this.notificationService = injector.get(NotificationService);
        this.serverGroupStorageService = injector.get(ServerGroupStorageService);
        this.serverStorage = injector.get(ServerStorageService);

        this.reuseRouteSubscr();
        this.searchSubject.pipe(switchMap((data) => this.service.search(
            (data as any).searchType,
            (data as any).searchModel,
            (data as any).page,
            (data as any).requestForSearch.SortField,
            (data as any).requestForSearch.SortDirection,
            (data as any).url,
            [],
            {context: this.componentContext, field: 'searchGridConfig'}
        ).pipe(catchError((err) => {
                this.errorHandler(err);
                return of(null);
            }
        )))).subscribe(
            (resp: SlickGridResp) => {
                if (resp != null) {
                    this.hidePlaceholder();
                    if ((this.storedSearchParams as any).withOverlays) {
                        this.showOverlay();
                    }
                    this.afterRequestData(resp, (this.storedSearchParams as any).searchModel);
                    // setTimeout(() => {
                    this.hideOverlay();
                    this.lastSearchModel = (this.storedSearchParams as any).searchModel;
                    this.onGridEndSearch.emit(true);

                    this.isBusyGrid = false;
                    this._currentSearchModel = null;
                    if (this.refreshContainer) {
                        this.cdr.detectChanges();
                        setTimeout(() => {
                            this.doRefresh(this.refreshContainer);
                        });
                    }
                }
            }, (err) => {
                this.errorHandler(err);
            });

            this.selectAllHandler = Observable.fromEvent(document, 'keydown').subscribe((e: KeyboardEvent) => {
                if(this._config.options && this.plugin.enableCtrlASelection && e && e.ctrlKey && e.key == "a") {
                    this.setSelectedRowsAll();
                    e.preventDefault();
                }
            });
    }

    _config: SlickGridConfig;

    get config(): SlickGridConfig {
        return (this._config as SlickGridConfig);
    }

    set config(_config: SlickGridConfig) {
        this._config = _config;
    }

    private _lastRequestForSearch: FinalSearchRequestType;

    get lastRequestForSearch(): FinalSearchRequestType {
        return this._lastRequestForSearch;
    }

    set lastRequestForSearch(m: FinalSearchRequestType) {
        this._lastRequestForSearch = m;
    }

    private _lastSearchModel: SearchModel;

    get lastSearchModel(): SearchModel {
        return this._lastSearchModel;
    }

    set lastSearchModel(m: SearchModel) {
        this._lastSearchModel = m;
    }

    private _currentSearchModel: SearchModel;

    get currentSearchModel(): SearchModel {
        return this._currentSearchModel;
    }

    private _dataView: any;

    get dataView(): any {
        return this._dataView;
    }

    get plugin(): SlickGridConfigPluginSetups {
        return this._config.options.plugin;
    }

    get module(): SlickGridConfigModuleSetups {
        return this._config.options.module;
    }

    get componentContext(): CoreSearchComponent {
        return (this._config.componentContext as CoreSearchComponent);
    }

    // module context
    get moduleContext(): SlickGridComponent {
        return (this.config.moduleContext as SlickGridComponent);
    }

    get service(): SlickGridService {
        return (this._config.service as SlickGridService);
    }

    private _isBusyGrid: boolean = false;

    get isBusyGrid(): boolean {
        return this._isBusyGrid;
    }

    set isBusyGrid(state) {
        this._isBusyGrid = state;
    }

    private _els: SlickGridElementsForInit;

    get els(): SlickGridElementsForInit {
        return this._els;
    }

    getRowElFromEvent(event) {
        let sel = event.target;
        while (!sel.classList.contains('slick-row') && sel.parentElement) {
            sel = sel.parentElement;
        }

        return sel;
    }

    errorHandler(err: HttpErrorResponse) {
        const error: SlickGridRequestError = err.error;
        this.isBusyGrid = false;
        this.onGridEndSearch.emit(false);
        if (error && error.Error) {
            this.setPlaceholderText(error.Error, false, {});
        } else {
            this.setPlaceholderText('common.error_unknown', true, {});
        }
        this.clearData(true);
        this.showPlaceholder();
        new Promise((resolve) => {
            resolve();
        }).then(() => {
                this.resize();
            }, (err) => {
                console.log(err);
            }
        );
        this._currentSearchModel = null;
        this.lastSearchModel = (this.storedSearchParams as any).searchModel;
        this.onGridEndSearch.emit(false);
        this.hideOverlay();
    }

    reuseRouteSubscr() {
        let routerEvSub
            , routeSub;

        // toDo route subscription after done onDestroy fixes for modals
        if (!this.route.parent) {
            return;
        }

        routeSub = this.route.parent.url.subscribe(() => {
            routerEvSub = this
                .router
                .events
                .pipe(filter((e) => e instanceof NavigationStart))
                .subscribe((event: RouterEvent) => {
                    if (event instanceof NavigationStart) {
                        // console.log('router',this);
                        this.hidePopups();
                        this.stopRefreshTimer();
                        if (this.config && this.config.options) {
                            this.saveScrollTop();
                        }
                    }
                    routerEvSub.unsubscribe();
                });
        });

        this.addSubscription('routeSubscr', routeSub);
    }

    addSubscription(sourceProp: string, subscr: Subscription) {
        if (this[sourceProp]) {
            this[sourceProp].add(subscr);
        } else {
            this[sourceProp] = subscr;
        }
    }

    saveScrollTop() {
        let vp
            , mode = (this.module && this.module.viewMode) ? this.module.viewMode : 'simple';

        if (this.lastScrollOffset) {
            this.lastScrollTop[mode] = this.lastScrollOffset.scrollTop;
        } else {
            vp = this.slick.getViewportNode();

            if (vp && vp.scrollTop) {
                this.lastScrollTop[mode] = vp.scrollTop;
            }
        }
    }

    init(els: SlickGridElementsForInit, jqOld?: any) {
        const moduleOptions = this.config.options.module;
        const pluginOptions = this.config.options.plugin;
        this._els = els;
        this.overlay = els.overlay;
        this.gridEl = els.grid;
        this.gridWrapperEl = els.gridWrapper;

        const ro = new ResizeObserver((entries) => {
            this.resize();
            if (this.slick) {
                this.slick.contentFitInRowsChecking();
            }

            // let f = this.debounceProvider.debounce(() => {
            //
            // }, 50);
            // f();

        });
        ro.observe(this.gridWrapperEl.nativeElement);
        // let mutationObserver = new MutationObserver(function(mutations) {
        //     mutations.forEach(function(mutation) {
        //         console.log('slick-grid', mutation);
        //     });
        // });
        //
        // mutationObserver.observe(this.gridWrapperEl.nativeElement, {
        //     attributes: true,
        //     characterData: true,
        //     childList: true,
        //     subtree: true,
        //     attributeOldValue: true,
        //     characterDataOldValue: true
        // });
        if (this.module.search.enabled === true) {
            this.searchFormProvider = this.injector.get(SearchFormProvider);
        }

        // prepare plugins
        this.implementDisableFields(jqOld);

        // data view
        this._dataView = new Slick.Data.DataView({inlineFilters: false});
        this.slick = new Slick.Grid(
            jqOld(els.grid.nativeElement),
            this.dataView,
            this.getColumns(),
            pluginOptions
        );

        // plugins
        const selModel = new (Slick as any).RowSelectionModel();
        this.slick.setSelectionModel(selModel);
        if (this.module.reorderRows === true) {
            this.initReorderPlugin();
        }
        if (this.module.headerButtons === true) {
            this.initHeaderButtonsPlugin();
        }

        // setTimeout(() => {
        // panels
        // if (this.module.topPanel.enabled == true || this.module.bottomPanel.enabled == true) {
        //     // panels
        //     // this.PanelProvider = this.injector.get(SlickGridPanelProvider);
        //     // this.PanelProvider.slickGridProvider = this;
        //     // this.PanelProvider.init();
        //
        //     // pager
        //     if (this.module.pager.enabled == true && this.els.bottomPanel) {
        //         // this.PagerProvider = this.els.bottomPanel.provider;
        //         // this.PagerProvider.slickGridProvider = this;
        //     }
        //
        //     // info
        //     if (this.module.info.enabled == true) {
        //         this.InfoProvider = this.injector.get(SlickGridInfoProvider);
        //         // this.InfoProvider.slickGridProvider = this;
        //     }
        // }
        // })

        if (this.getFilter) {
            this.dataView.setFilter(this.getFilter());
        }

        // init plugin
        this.slick.init(pluginOptions);

        // bind event  emitters
        this.bindCallbacks();
        // backward compatibility
        this.onRowMouseDblClick.subscribe((data: SlickGridEventData) => {
            this.onRowDoubleClicked(data);
        });
        this.onRowMouseDown.subscribe((data: SlickGridEventData) => {
            this.onRowMousedown(data);
        });
        this.onRowMouseClick.subscribe((data: SlickGridEventData) => {
            this.onRowMouseclick(data);
        });
        this.onRowMouseRightClick.subscribe((data: SlickGridEventData) => {
            this.onRowRightClick(data);
        });
        this.onDataUpdated.subscribe((data: SlickGridEventData) => {
            this.onRowChanged(data);
        });

        // hide popup
        this.onScrollGrid.subscribe((data: SlickGridScrollEvent) => {
            this.onScrollGridCB(data);
        });


        // other mouse events
        this.onGridInited.emit();
    }

    initReorderPlugin() {
        const moveRowsPlugin = new Slick.RowMoveManager({
            cancelEditOnDrag: true
        });
        moveRowsPlugin.onBeforeMoveRows.subscribe((e, data) => {
            const slick = this.getSlick();
            if (slick.getViewportNode().scrollHeight == slick.getViewportNode().clientHeight) {
                if (slick.getViewportNode().scrollWidth == slick.getViewportNode().clientWidth) {
                    slick.getViewportNode().style.overflowY = 'hidden';
                }
            }

            for (let i = 0; i < data.rows.length; i++) {
                // no point in moving before or after itself
                if (data.rows[i] == data.insertBefore || data.rows[i] == data.insertBefore - 1) {
                    e.stopPropagation();
                    return false;
                }
            }
            return true;
        });
        moveRowsPlugin.onMoveRows.subscribe((e, args) => {
            let extractedRows = [], left, right;
            const rows = args.rows;
            const insertBefore = args.insertBefore;
            let data = this.getData();

            this.onChangeRowOrder(this.getSlick().getDataItem(rows[0]), this.getSlick().getDataItem(insertBefore));
            new Promise((r) => {
                r();
            }).then(() => {
                const slick = this.getSlick();
                slick.getViewportNode().style.overflowY = 'auto';

                left = data.slice(0, insertBefore);
                right = data.slice(insertBefore, data.length);
                rows.sort(function (a, b) {
                    return a - b;
                });
                for (let i = 0; i < rows.length; i++) {
                    extractedRows.push(data[rows[i]]);
                }
                rows.reverse();
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    if (row < insertBefore) {
                        left.splice(row, 1);
                    } else {
                        right.splice(row - insertBefore, 1);
                    }
                }
                data = left.concat(extractedRows.concat(right));
                const selectedRows = [];
                for (let i = 0; i < rows.length; i++) {
                    selectedRows.push(left.length + i);
                }
                this.getSlick().resetActiveCell();
                this.setData(data, true);
                this.getSlick().setSelectedRows(selectedRows);

                this.onChangedRowOrder(this.getDataView().getItems());
            });
        });
        const grid = this.getSlick();

        grid.registerPlugin(moveRowsPlugin);
        // grid.registerPlugin()
        grid.onDragInit.subscribe((e, dd) => {
            // prevent the grid from cancelling drag'n'drop by default
            e.stopImmediatePropagation();
        });
    }

    private initHeaderButtonsPlugin() {
        const headerPlugin = new Slick.Plugins.HeaderButtons();

        headerPlugin.onCommand.subscribe((e, args) => {
            var column = args.column;
            var button = args.button;
            var command = args.command;

            debugger;
            // if (command == "toggle-highlight") {
            //     if (button.cssClass == "icon-highlight-on") {
            //         delete columnsWithHighlightingById[column.id];
            //         button.cssClass = "icon-highlight-off";
            //         button.tooltip = "Highlight negative numbers."
            //     } else {
            //         columnsWithHighlightingById[column.id] = true;
            //         button.cssClass = "icon-highlight-on";
            //         button.tooltip = "Remove highlight."
            //     }
            //
            //     this.slick.invalidate();
            // }
        });

        this.getSlick().registerPlugin(headerPlugin);
    }

    getGridEl(): ElementRef {
        return this.gridEl;
    }

    getGridWrapperEl(): ElementRef {
        return this.gridWrapperEl;
    }

    /**
     * On double click by row
     * @param data
     */
    onRowDoubleClicked(data: SlickGridEventData) {
        if (this.config.options.type && data && (data.row as any)) {
            const destination = this.config.options.type.replace('inside-', '').toLowerCase();
            this.router.navigate([
                appRouter[destination].detail.substr(0, appRouter[destination].detail.lastIndexOf('/')),
                (data.row as any).ID
            ]);
        }
    }

    onChangeRowOrder(currentRow: SlickGridRowData, beforeRow: SlickGridRowData) {
    }

    onChangedRowOrder(newDataOrdering: SlickGridRowData) {
    }

    /**
     * On mousedown
     * @param data
     */
    onRowMousedown(data: SlickGridEventData) {
        // override;
    }

    onRowMouseclick(data: SlickGridEventData) {
        // override;
    }

    onRowChanged(data: SlickGridEventData) {
        // override
    }

    onRowRightClick(data: SlickGridEventData) {
        if (!this.module.availableContextMenu) {
            return;
        }

        data.event.preventDefault && data.event.preventDefault();
        this.tryOpenPopupByRightClick(data.event, data.row);
    }

    onScrollGridCB(data: SlickGridScrollEvent) {
        // excluding excess cb's operations. Firefox fix (fake scroll event fires)
        if (this.lastScrollOffset
            && this.lastScrollOffset.scrollLeft == data.scrollLeft
            && this.lastScrollOffset.scrollTop == data.scrollTop) {
            return;
        }

        this.lastScrollOffset = data;
        this.hidePopups();
    }

    hookSearchModel(searchModel: SearchModel): Observable<SearchModel> {
        return new Observable((observer) => {
            observer.next(searchModel);
            observer.complete();
        });
    }

    buildPage(searchModel: SearchModel, resetSearch: boolean = false, withOverlays: boolean = true): void {
        this.hookSearchModel(searchModel).subscribe((searchModel: SearchModel) => {
            this._buildPageRequest(
                this.config.options.searchType,
                searchModel,
                resetSearch,
                withOverlays
            );
        });
    }

    buildPageByData(resp: SlickGridResp) {
        // this.showOverlay();
        this.hidePlaceholder();
        this.afterRequestData(resp);
        // this.hideOverlay();
    }

    afterRequestData(resp: SlickGridResp, searchModel?: SearchModel) {
        const compContext = this.config.componentContext;
        if (this.loadingIndicator) {
            $(this.loadingIndicator[0]).remove();
            this.loadingIndicator = null;
        }
        const cols = this.getActualColumns();
        const regularCols = cols.filter((c: SlickGridColumn) => {
            return c.id > -1;
        });
        if (!regularCols.length) {
            this.setPlaceholderText('slick_grid.not_have_column', true);
            this.showPlaceholder();
        }
        if (!resp.Data || resp.Data.length == 0) {
            const type = this.module.searchType;
            if (type == 'Media' || type == 'versions' || type == 'title' || this.module.displayNoRowsToShowLabel) { //displayNoRowsToShowLabel for grids with search form
                this.setPlaceholderText('ng2_components.ag_grid.noRowsToShow', true);
                this.showPlaceholder();
                this.clearData(true);
            }
        }
        const respLength = resp.Rows ? resp.Rows : resp.Data.length;
        this._setSelectionAndDataAfterRequest(resp, searchModel);

        this.onGridRowsUpdated.emit(resp);
        // this.resize();



        if (searchModel) {
            // do not log group search to recent searches
            if(compContext && !compContext.stateGroupPanel) {
                // Update recent searches
                const recentSearch = new RecentModel();
                recentSearch.setSearchModel(searchModel);
                recentSearch.setTotal(respLength);
                // recentSearch.setTotal(Math.floor(6666 + Math.random() * (9999 + 1 - 6666)));
                recentSearch.fillBeautyString();
                const recentSearchesProvider = this.config.componentContext.searchRecentProvider;
                if (recentSearchesProvider) {
                    recentSearchesProvider.addRecentSearch(recentSearch);
                }
            }

        }

        // fill facets
        if ((this.config.componentContext as CoreSearchComponent)) {
            // let facetsConfig = (<CoreSearchComponent>this.config.componentContext).searchFacetsConfig;
            // TODO lekaving: add switch and enum type for data request
            const facetsConfig = this.config.componentContext['facetsConfig'];

            if (facetsConfig) {
                const facets = resp.Facets && resp.Facets.Facets ? resp.Facets.Facets : [];
                const facetsInfo = resp.Facets && resp.Facets.FacetsInfo ? resp.Facets.FacetsInfo : '';
                // facetsConfig.options.provider.fillFacets(facets, resp.Facets ? resp.Facets.FacetsInfo : '');
                facetsConfig.store.newSearch(this.prevStateOfReset);
                facetsConfig.store.setFacets(facets);
                facetsConfig.store.setInfo(facetsInfo);
            }
            // ----fill facets end----
        }

        //
        // if (this.PanelProvider) {
        //     if (this.PanelProvider.isShowAdditionalTopPanel()) {
        //         this.PanelProvider.showTopPanel(true)
        //     } else {
        //         this.PanelProvider.hideTopPanel(false)
        //     }
        //
        //     if (this.PanelProvider.isShowAdditionalBottomPanel()) {
        //         this.PanelProvider.showBottomPanel(true)
        //     } else {
        //         this.PanelProvider.hideBottomPanel(false)
        //     }
        // }

        if ((this.componentContext as any).refreshStarted) {
            this.getSlick().setSelectedRows(this.selectedRows);
        }
        (this.componentContext as any).refreshStarted = false;
    }

    getSlick(): any {
        return this.slick;
    }

    setViewColumns(_defaultView: ViewType, _viewColumns: ViewColumnsType, customCols: SlickGridColumn[] = []) {
        if(!_defaultView || $.isEmptyObject(_defaultView)) {
            return
        }
        if(!_viewColumns || $.isEmptyObject(_viewColumns)) {
            return
        }
        this._originalView = _.cloneDeep(_defaultView);
        this._originalColumns = _.cloneDeep(_viewColumns);
        let cols: SlickGridColumn[] = [];
        const prevExtCols = this.service.getExtendsColumns();
        let needRefresh: boolean = false;
        const newExtCols = [];
        $.each(_viewColumns, (key, settingsForCol: RESTColumnSettings) => {
            const col: RESTColumSetup = _defaultView.ColumnData[key];
            if (col && settingsForCol) {
                // Extract columns with prop IsExtendedField == true (for search optimisation on backend)
                if (settingsForCol.IsExtendedField) {
                    if (prevExtCols && prevExtCols.indexOf(key) === -1) {
                        needRefresh = true;
                    }
                    newExtCols.push(key);
                }

                const colDef: SlickGridColumn = {
                    id: col.Index,
                    name: settingsForCol.TemplateName,
                    field: settingsForCol.BindingName,
                    width: col.Width || 150,
                    resizable: true,
                    sortable: this.module.enableSorting ? (settingsForCol.CanUserSort || this.module.clientSorting) : false,
                    multiColumnSort: settingsForCol.CanUserSort,
                    __bindingFormat: settingsForCol.BindingFormat,
                    __bindingName: settingsForCol.BindingName,
                    __col: col
                };

                cols.push(colDef);
            }

        });

        // this.extendedColumns = newExtCols;
        // this.service.setExtendsColumns(newExtCols);
        cols = customCols.concat(cols);

        // thumbs
        this.isThumbnails(!!this._originalView.ShowThumbs);
        if (this.isThumbnails()) {
            this.module.onIsThumbnails.subscribe((state: boolean) => {
                this._originalView.ShowThumbs = state;
            });
        }

        this.setDefaultColumns(cols, [], true, needRefresh);

        // rebuild grid if got new ExtendedColumns
        // if (newExtCols.length > 0 && this.lastSearchModel) {
        //     this.buildPage(this.lastSearchModel);
        // }
    }

    prepareAndSetGlobalColumns(_c: ViewColumnsType) {
        const gc: SlickGridColumn[] = [];
        $.each(_c, (k, o: RESTColumnSettings) => {
            const colDef = {
                id: gc.length + 1,
                name: o.TemplateName,
                field: o.BindingName,
                width: 150,
                resizable: true,
                sortable: this.module.enableSorting ? (o.CanUserSort || this.module.clientSorting) : false,
                multiColumnSort: o.CanUserSort,
                __bindingFormat: o.BindingFormat,
                __bindingName: o.BindingName,
            };
            gc.push(colDef as SlickGridColumn);
        });
        this.setGlobalColumns(gc);
        this.onGridAndViewReady.emit();
        // this.onGridAndViewReady.complete();
    }

    initColumns(cols: SlickGridColumn[] = [], order: string[] = [], apply: boolean = false) {
        this.setGlobalColumns(cols);
        this.setDefaultColumns(cols, order, apply);
        if (apply) {
            this.resize();
        }
    }

    /**
     * Set global columns (all columns available at view)
     * @param cols
     */
    setGlobalColumns(cols: SlickGridColumn[]) {
        this.module.globalColumns = cols;
    }

    /**
     * Get global columns (all columns available at view)
     * @returns {SlickGridColumn[]}
     */
    getGlobalColumns(): SlickGridColumn[] {
        return this.module.globalColumns;
    }

    /**
     * Set columns prepared to show
     * @param cols
     */
    setActualColumns(cols: SlickGridColumn[], render: boolean = false, needRefresh: boolean = false) {
        this.module.actualColumns = this.ejectColumns(this.getColumnsForEjecting(), cols);
        this.checkAndLoadFormattersExtraData(cols);
        if (render) {
            this.applyColumns();
            if (needRefresh && this.lastSearchModel) {
                // this.buildPage(this.lastSearchModel);
                this.onGridEndSearch.subscribe((state: boolean) => {
                    if (state === true) {
                        this.setSelectedRows(this.getSelectedRowsIds());
                    }
                });
            } else {
                this.setSelectedRows(this.getSelectedRowsIds());
            }

        }
    }

    /**
     * Return columns from actualColumns array (prepared for insert to grid)
     * @returns {SlickGridColumn[]}
     */
    getActualColumns(ordered: boolean = false): SlickGridColumn[] {
        if (ordered === false) {
            return this.module.actualColumns;
        } else {
            return this.module.actualColumns.sort(
                (a: SlickGridColumn, b: SlickGridColumn) =>
                    (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)
            );
        }
    }

    /**
     * Add column
     * @param col
     */
    addActualColumn(col: SlickGridColumn) {
        if (!col) {
            return;
        }
        // added because when add new column, it id can duplicate
        const idxArray = this.module.actualColumns.map((el) => {
            return el.id;
        });
        const maxId = Math.max.apply(null, idxArray);

        if (col && col.id >= 0) {
            col.id = (maxId < 0) ? 1 : maxId + 1;
        }
        this.module.actualColumns.push(col);
        this.checkAndLoadFormattersExtraData(this.module.actualColumns);
    }

    removeActualColumn(col: SlickGridColumn) {
        this.module.actualColumns = this.ejectColumns([col], this.getActualColumns());
    }

    /**
     * Store columns of view as defaultColumns;
     * @param cols
     * @param order
     * @param apply
     */
    setDefaultColumns(cols: SlickGridColumn[] = [], order?: string[], apply: boolean = false, needRefresh: boolean = false) {
        this.module.defaultColumns = cols;
        if (apply === true) {
            this.setActualColumns(cols, apply, needRefresh);
        }
    }

    /**
     * Just return default columns (columns of view)
     * @returns {SlickGridColumn[]}
     */
    getDefaultColumns(): SlickGridColumn[] {
        return this.module.defaultColumns;
    }

    checkAndLoadFormattersExtraData(cols) {
        const storageKeysDict = [
            {
                fieldName: 'media_status_text',
                storageKey: 'MediaStatus'
            },
            {
                fieldName: 'pgm_status_text',
                storageKey: 'PgmStatus'
            }
        ];

        const storageKeys = [];

        for (const item of storageKeysDict) {
            if (cols.some((el) => el.field && el.field.toLowerCase() == item.fieldName)) {
                storageKeys.push(item.storageKey);
            }

        }

        for (const key of storageKeys) {
            this.lookupService.getLookups(key, '/api/lookups/')
                .subscribe(
                    (lookups: any) => {
                    },
                    (error: any) => {
                    },
                    () => {
                    }
                );
        }
    }

    setSelectedBy(filedName: string, val: any, scrollToSelected: boolean = false) {
        let selectedRow: SlickGridRowData = null;
        $.each(this.getData(), (k, row: SlickGridRowData) => {
            if (row[filedName] === val) {
                selectedRow = row;
                return false;
            }
        });
        if (selectedRow !== null) {
            var ids = this.getDataView().mapRowsToIds(this.getSlick().getSelectedRows());
            var rowIds = this.getDataView().mapIdsToRows(ids);
            this.setSelectedRows(rowIds);
            if (scrollToSelected && rowIds.length > 0) {
                this.getSlick().scrollRowToTop(rowIds[0]);
            }
        }
    }

    /**
     * Apply changes of columns at grid
     */
    applyColumns() {
        $('.overlay-indicator').remove();
        this.clearPlaceholder();
        let cols = this.getActualColumns();
        const regularCols = cols.filter((c: SlickGridColumn) => {
            return c.id > -1;
        });

        if (!regularCols.length) {
            this.setPlaceholderText('slick_grid.not_have_column', true);
            this.showPlaceholder();
            // this.cdr.detectChanges();
            this.getSlick().setColumns([]);
            if (this.getData().length > 0) {
                this.getSlick().invalidateAllRows();
                this.getSlick().render();
            }
            this.resize();
            return;
        } else {
            this.hidePlaceholder();
        }
        cols = cols.map((e: SlickGridColumn) => {
            if (!e.__contexts) {
                e.__contexts = this.getInjectedContexts();
            }
            return e;
        });

        cols = cols.sort(function (a: SlickGridColumn, b: SlickGridColumn) {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        });

        let frozenCount = -1;
        const _cols = [];
        let viewsProvider: ViewsProvider = this.injector.get(ViewsProvider);
        if (this.module.customProviders.viewsProvider) {
            // viewsProvider = this.injector.get(this.module.customProviders.viewsProvider);
            viewsProvider = (this.componentContext as any).viewsProvider;
        } else {
            viewsProvider = this.injector.get(ViewsProvider);
        }
        $.each(cols, (k, o: SlickGridColumn) => {
            if (o.isFrozen) {
                frozenCount++;
            }

            // apply formatters
            const col = o.__bindingFormat ? viewsProvider.getFormatterByFormat(o.__bindingFormat, o.__col, o) : viewsProvider.getFormatterByName(o.field, o.__col, o);
            _cols.push(col);
        });

        // see history
        if (this.slick.getColumns().length === 0) {
            this.slick.setColumns(_cols);
        } else {
            this.slick.setOptions({frozenColumn: frozenCount});

            this.slick.setColumns(_cols);
        }


        // toDo do over
        if (!viewsProvider.originalViews || !viewsProvider.originalViews.ViewColumns) {
            return;
        }

        this.updateExtendsColumns(viewsProvider.originalViews.ViewColumns, _cols).then(() => {

            // if (this.getData().length > 0) {
            //     this.getSlick().invalidateAllRows();
            //     this.getSlick().render();
            // }

            // to highlight selected rows in newly added columns.
            this.setSelectedRows(this.getSelectedRowsIds());

            // dont remove it. resetData need for refresh already rendered formatters for columns
            // if (this.getData().length > 0) {
            //     this.resetData(false);
            // }
            // this.resize();
        });
    }

    getFrozenColumns(cols?: SlickGridColumn[]) {
        if (!cols) {
            cols = this.getDefaultColumns();
        }
        const res = [];
        $.each(cols, (k, o: SlickGridColumn) => {
            if (typeof o.isFrozen == 'boolean') {
                res.push(o);
            }
        });
        return res;
    }

    /**
     * Return cols that need eject from grid
     * @returns {SlickGridColumn[]}
     */
    getColumnsForEjecting(): SlickGridColumn[] {
        const res: SlickGridColumn[] = [];
        // eject thumbs
        if (!this.isThumbnails()) {
            $.each(this.getDefaultColumns(), (k: number, col: SlickGridColumn) => {
                if (col && col.__text_id == 'thumbnails') {
                    res.push(col);
                    return false;
                }
            });
        }

        return res;
    }

    ejectColumns(ejCols: SlickGridColumn[], from?: SlickGridColumn[]) {
        if (!from) {
            from = this.getDefaultColumns();
        }

        const result: SlickGridColumn[] = from.filter((dc: SlickGridColumn) => {
            let res = true;
            $.each(ejCols, (k: number | string, c: SlickGridColumn) => {
                if (c.__isCustom == true) {
                    if (c && c.__text_id && c.__text_id == dc.__text_id) {
                        res = false;
                        return true;
                    }
                } else {
                    if (c.field == dc.field) {
                        // for simple columns
                        res = false;
                        return true;
                    }
                }
            });

            return res;
        });

        this.module.actualColumns = result;

        return result;
    }

    /**
     * Get all simple (not custom) columns
     */
    getCustomColumns(from?: SlickGridColumn[]) {
        if (!from) {
            from = this.getDefaultColumns();
        }

        return from.filter((col: SlickGridColumn) => {
            if (col.__isCustom === true) {
                return true;
            }

            return false;
        });
    }

    clearAllColumns() {
        this.setGlobalColumns([]);
        this.setDefaultColumns([], [], true);
    }

    /**
     * Set or get stated of thumbnail in table;
     * @param state
     * @param render
     * @returns {boolean}
     * @TODO FIX it (need remove multicheking for component)
     */
    isThumbnails(state: boolean = null, render: boolean = false, isToggle = false): boolean {
        let res;
        let change = state != null ? true : false;
        if (this.componentContext && this.componentContext.searchThumbsComp) {
            // hand mode
            if (state === true || state === false) {
                // change state
                this.componentContext.searchThumbsComp.enabled = state;
                this.module.isThumbnails = state;
            }

            res = this.componentContext.searchThumbsComp.enabled;

        } else if (state === true || state === false) {
            this.module.isThumbnails = state;
            res = this.module.isThumbnails;
            change = true;
        } else {
            // always on or off
            res = this.module.isThumbnails;
            change = true;
        }

        const issetTumbnails = !!this.getColumnByTextId('thumbnails', this.getActualColumns());
        if (issetTumbnails != res && change == true) {
            if (res == false) {
                this.slick.setOptions({rowHeight: this.plugin.rowHeight}, true);
            } else {
                this.slick.setOptions({rowHeight: this.module.rowHeightWithThumb}, true);
            }

            const thumbCol = this.getColumnByTextId('thumbnails');
            if (state === true) {
                if (!issetTumbnails) {
                    this.addActualColumn(thumbCol);
                }
            } else {
                if (issetTumbnails) {
                    this.removeActualColumn(thumbCol);
                }
            }
            if (render == true) {
                this.applyColumns();
                // dont remove it. resetData need for refresh already rendered formatters for columns
                if (this.getData().length > 0) {
                    this.resetData(false);
                }
                this.resize();
                // this.setSelectedRows(this.getSelectedRowsIds()); // used in applyColumns()
            }
            this.cdr.markForCheck();
        }

        if (isToggle)
            this.slick.onRenderComplete.subscribe(this.renderComplete);

        return res;
    }

    private renderComplete = () => {
        this.slick.onRenderComplete.unsubscribe(this.renderComplete);
        var $el =  $('#slick-viewport-right');
        $el.css('height', $el.height() + 1 + 'px');
    }

    /**
     * Get column by __text_id
     * @param textId
     * @returns {SlickGridColumn}
     */
    getColumnByTextId(textId: string, from?: any[]): SlickGridColumn {
        if (!from) {
            from = this.getDefaultColumns();
        }
        const col = from.filter((e: SlickGridColumn) => {
            return e && e.__text_id == textId ? true : false;
        });

        return col[0];
    }

    /**
     * Set data
     * @param data - array of data
     * @param withRender - rewrite data
     */
    setData(data: any[], withRender: boolean = false) {
        this.module.data = data;
        this.dataView.beginUpdate();
        if (withRender) {
            this.dataView.setItems(this.module.data, this.getIdField());
            this.dataView.endUpdate();
            // this.slick.render();
            this.slick.invalidate();
            // this.slick.invalidate();
            new Promise((resolve, reject) => {
                resolve();
            }).then(() => {
                    this.resize();
                }, (err) => {
                    console.log(err);
                }
            );
        }
    }

    /**
     * Clear data
     * @param render
     */
    clearData(render: boolean = false) {
        this.module.data = [];
        this.prevRowId = null;
        if (render) {
            this.dataView.beginUpdate();
            this.dataView.setItems(this.module.data);
            this.dataView.endUpdate();
            this.slick.invalidateAllRows();
            this.lastData = null;

            this.onGridRowsUpdated.emit(({
                Rows: 0,
                Data: [],
                Facets: {
                    Facets: [],
                    FacetsInfo: null
                }
            } as SlickGridResp));
            // this.slick.render();
        }
    }

    /**
     * Reset data of grid
     */
    resetData(showOverlay: boolean = true) {
        if (showOverlay) {
            this.showOverlay();
        }
        new Promise((resolve, reject) => {
            resolve();
        })
            .then(
                () => {
                    this.setData(this.module.data, true);
                    if (showOverlay) {
                        this.hideOverlay();
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
    }

    updateData(rowNumber: number[] | number = null, data: SlickGridRowData[] = null) {
        // let _data = !data.length ? this.module.data : data;
        const _data = !data ? this.module.data : data;
        this.getDataView().setItems(_data);

        const arrRowNumber: any[] = (Array.isArray(rowNumber))
            ? rowNumber
            : (rowNumber && (typeof rowNumber == 'number') && (rowNumber < _data.length))
                ? [rowNumber]
                : null;

        if (!arrRowNumber) {
            this.getSlick().invalidateAllRows();
        } else {
            this.getSlick().invalidateRows(arrRowNumber);
        }
        this.getSlick().render();
    }

    update() {
        this.slick.invalidateAllRows();
        this.slick.render();
    }

    /**
     * Get data from grid
     * @returns {any[]}
     */
    getData(clear: boolean = false): SlickGridTreeRowData[] | SlickGridExpandableRowData[] {
        let res: SlickGridTreeRowData[] = [];
        if (this.slick) {
            const dv: any = this.getDataView();

            res = (dv.getItems() as SlickGridTreeRowData[]);
        }

        return res;
    }

    getTopData(clear: boolean = false): SlickGridTreeRowData[] | SlickGridExpandableRowData[] {
        return (this.getData() as SlickGridExpandableRowData[]).filter((row: any) => {
            return row.parent === null;
        });
    }

    setOriginalData(data): void {
        this.originalData = $.extend(true, [], data);
    }

    getOriginalData(): any[] {
        return this.originalData;
    }

    /**
     * Get DataView
     */
    getDataView(): any {
        return this.slick.getData();
    }

    getFilter(): Function {
        return (item: SlickGridTreeRowData) => {
            return (item.parent !== null && item.collapsed === true) ? false : true;
        };
    }

    showOverlay() {
        this._overlayShowed = true;
        setTimeout(() => {
            if (this._overlayShowed) {
                this.overlay.setText(this.translate.instant('ng2_components.ag_grid.wait_or_cancel'));
                this.overlay.show(this.gridEl.nativeElement);
            }
        });
    }

    hideOverlay() {
        this._overlayShowed = false;
        this.overlay.hide(this.gridEl.nativeElement);
        // this.isBusyGrid = false;
    }

    getColumnById(id: number, from?): SlickGridColumn[] {
        if (!from) {
            from = this.getActualColumns();
        }

        return from.filter((c: SlickGridColumn) => {
            return c.id == id;
        });
    }

    /**
     * Refresh slick-grid scroll
     */

    refreshGridScroll(fromPager = false) {
        if (fromPager) {
            this.slick.scrollToYAsix(0);
            if (Boolean(this.getSelectedRowId())) {
                this.setSelectedRow(0)
            }
            return;
        }
        let selectedRow = this.getSelectedRowId()
            , mode = (this.module && this.module.viewMode) ? this.module.viewMode : 'simple'
            , vp
            , lastScrollTop;


        lastScrollTop = (this.lastScrollTop[mode]) ? this.lastScrollTop[mode] : 0;

        this.slick.scrollToYAsix(lastScrollTop);
        vp = this.slick.getViewport();

        if (!selectedRow && selectedRow !== 0) {
            return;
        }

        switch (this.module.viewMode) {
            case 'table': {
                if (selectedRow < vp.top) {
                    this.slick.scrollRowToTop(selectedRow);
                } else if (selectedRow > vp.bottom - 1) {
                    this.slick.scrollRowToTop(selectedRow - (vp.bottom - vp.top - 1));
                }
                break;
            }
            case 'tile': {
                const vpNode = this.slick.getViewportNode()
                    , srNode = this.getSelectedRowNode();

                if (srNode
                    &&
                    (
                        ((srNode.offsetTop - vpNode.clientHeight) > lastScrollTop)
                        ||
                        ((srNode.offsetTop + srNode.clientHeight) < lastScrollTop)
                    )
                ) {
                    this.slick.scrollToYAsix(srNode.offsetTop);
                }
                break;
            }
            default: {
                break;
            }
        }

        // this.saveScrollTop();

    }

    /**
     * Create FinalRequest from search model;
     * @param searchModel
     * @param searchType
     * @returns {FinalSearchRequestType}
     */
    getRequestForSearch(searchModel?: SearchModel, searchType?: string): FinalSearchRequestType {
        if (!searchModel) {
            if (this.componentContext.searchFormConfig && this.module.search.enabled === true) {
                searchModel = this.injector.get(SearchFormProvider).getModel(true, false);
                // searchModel = this.componentContext.searchFormConfig.options.provider.getModel(true, false);
            } else {
                searchModel = new SearchModel();
            }
        }

        // page
        const page = this.module.pager.enabled && this.PagerProvider ? this.PagerProvider.currentPage : 1;

        // sort model
        let colId = '';
        let sort = '';
        const sortModel = this.getSlick().getSortColumns();
        if (sortModel && sortModel.length > 0) {
            const sortModelItem = sortModel[0];
            const sortColumnId = parseInt(sortModelItem.columnId);
            const sortColumn: SlickGridColumn = this.getColumnById(sortColumnId)[0];
            if (sortColumn) {
                colId = sortColumn.field;
                sort = sortModelItem.sortAsc ? 'asc' : 'desc';
            }
        }

        return this.service.getParamsForSearch(searchModel, page, colId, sort, searchType);
    }

    resize(els: SlickGridElementsForResize = null, w: number | 'full' = 'full', h: number | 'full' = 'full') {

        if (els == null) {
            els = this.els;
        }

        if (!this._config || !this.config.moduleContext) {
            return;
        }
        let _h: number;
        let _w: number;
        if (!$.isNumeric(w) || !$.isNumeric(h) || h == 0) {
            let wrapEl;
            if (this.module.externalWrapperEl) {
                wrapEl = $(this.module.externalWrapperEl);
            } else {
                wrapEl = $(this.els.gridWrapper.nativeElement);
            }
            if (wrapEl.length) {
                _h = wrapEl[0].clientHeight;
                _w = wrapEl[0].clientWidth;
            } else {
                return false;
            }

        } else {
            _h = (h as number);
            _w = (w as number);
        }

        // minus height of panels
        if (
            this.module.bottomPanel.enabled == true &&
            els.bottomPanel
            // els.bottomPanel.isVisible
        ) {
            _h = _h - parseFloat($(els.bottomPanel.element.nativeElement).parent().css('height'));
        }
        if (
            this.module.topPanel.enabled == true &&
            els.topPanel
            // els.topPanel.isVisible
        ) {
            _h = _h - parseFloat($(els.topPanel.element.nativeElement).parent().css('height'));
        }

        if (els.grid) {
            $(els.grid.nativeElement).css({
                height: _h + 'px',
                width: _w + 'px'
            });
            this.tileResize();
            if (this.slick) {
                this.slick.resizeCanvas();
            }
        }

        this.updatePlaceholderPosition();
    }

    tileResize() {
        if (this.module.viewMode == 'tile') {
            const gridWrapperWidth = $(this.els.grid.nativeElement).width() - this.slick.getScrollbarDimensions().width * (this.slick.hasViewportScrolls().v - 0);
            // let gridWrapperWidth = this.slick.getCommonViewportClientWidth();
            const tileParams = this.module.tileParams;
            const count = this.module.data.length;

            let inRow = Math.floor(gridWrapperWidth / tileParams.tileWidth);
            inRow = (inRow > 0) ? inRow : 1;

            let rowHeight = tileParams.tileHeight / inRow + ((tileParams.tileHeight * (inRow - (count % inRow))) / (count * inRow)) * ((count % inRow) ? 1 : 0);
            rowHeight = (rowHeight.toFixed(4)) as any - 0;

            if (this.slick.getOptions().rowHeight != rowHeight) {
                this.slick.setOptions({
                    rowHeight
                });
            }
        }
    }

    /**
     * Apply callbacks
     * @param c
     */
    applyCallbacks(c: Function) {
        if (this.slick) {
            c(this.slick, this.dataView);
        }
    }

    collapseTreeRow(item: SlickGridTreeRowData): number[] {
        return this.__triggerTreeRow(item, false);
    }

    expandTreeRow(item: SlickGridTreeRowData): number[] {
        return this.__triggerTreeRow(item, true);
    }

    expandExpandableRow(item, silent) {
        this.__triggerExpandableRow(item, true, silent);
    }

    collapseExpandableRow(item, silent) {
        this.__triggerExpandableRow(item, false, silent);
    }

    __triggerExpandableRow(item: SlickGridExpandableRowData, stateExpanded: boolean = null, silent: boolean = false) {
        const dataView = this.getDataView();
        dataView.beginUpdate();

        if (item && item.id != null) {
            if (stateExpanded != null) {
                item._collapsed = stateExpanded;
            }
            if (!item._collapsed) {
                item._collapsed = true;
                this.lookupDynamicContent(item);
                this.removeExpandableRows(item, item._additionalRows);
            } else {
                item._collapsed = false;
                item._additionalRows = [];
                item._detailContent = null;
                item._sizePadding = 0;
                item._height = 0;
                this.lookupDynamicContent(item);
                this.addExpandableRows(item, item._sizePadding);
            }

            if (!silent) {
                dataView.updateItem((item.id as string), item);
            }
        }

        if (!silent) {
            dataView.endUpdate();
            this.getSlick().updateRowCount();
            this.getSlick().render();
        }
    }

    addExpandableRows(item: SlickGridExpandableRowData, count: number, additionalId = null) {
        const dataView = this.getDataView();
        const idxParent = dataView.getIdxById((item.id as string));
        for (let idx = 1; idx <= count; idx++) {
            const newItem: SlickGridExpandableRowData = this.getPaddingItem(item.id, idx, additionalId);
            dataView.insertItem(idxParent + idx, newItem);
            const key = item._additionalRows.indexOf(newItem.id);
            if (key === -1) {
                item._additionalRows.push(newItem.id);
            }
        }
        this.updateDetailsSize(item);
    }

    createDetailComponent(item) {
        // overrited (see WorkflowSlickGridProvider for example)
    }

    getPaddingItem(id: number | string, idx: number | string, additionalId = null): SlickGridExpandableRowData {
        const _newItem: SlickGridExpandableRowData = {} as SlickGridExpandableRowData;
        _newItem.id = this.getAdditionalRowId(id, idx, additionalId);
        // additional hidden padding metadata fields
        _newItem._collapsed = true;
        _newItem._isPadding = true;

        return _newItem;
    }

    removeExpandableRows(item: SlickGridExpandableRowData, idsToRemove: any[]): void {
        const dataView = this.getDataView();
        const _idsToRemove = JSON.parse(JSON.stringify(idsToRemove));
        $.each(_idsToRemove, (k, idToRemove) => {
            if (idToRemove == undefined) {
                return true;
            }
            if (!dataView.getItemById(idToRemove)) {
                console.error('Slickgrid: row id ', idToRemove, 'not found');
                return true;
            }
            dataView.deleteItem(idToRemove);
            const key = item._additionalRows.indexOf(idToRemove);
            if (key > -1) {
                item._additionalRows.splice(key, 1);
            }
        });

        this.updateDetailsSize(item);
    }

    updateDetailsSize(item: SlickGridExpandableRowData) {
        const rowHeight = this.getSlick().getOptions().rowHeight;
        item._height = (item._additionalRows.length * rowHeight);
        $(this.getGridEl().nativeElement).find('div.dynamic-cell-detail#' + item.ID).height(item._height);
    }

    lookupDynamicContent(item: SlickGridExpandableRowData) {
        // override
    }

    getPrevSelectRows() {
        return this.prevSelectedRows;
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        if (this.plugin.suppressSelection == true) {
            return;
        }
        this.prevSelectedRows = this.getSlick().getSelectedRows();
        this.beforeSetSelectedRow(rowId, eventData, suppressDataUpdated);
        if (rowId == null) {
            this.getSlick().setSelectedRows([]);
            this._selectedRowsIds = [];
            this.prevRowId = null;
            if (!suppressDataUpdated) {
                this.onDataUpdated.emit({
                    row: null,
                    cell: null,
                } as SlickGridEventData);
            }
        } else {
            this.getSlick().setSelectedRows([rowId]);
            this._selectedRowsIds = [rowId];
            if (rowId != this.prevRowId) {
                this.prevRowId = rowId;
                if (!suppressDataUpdated) {
                    // emit data updated
                    const d = this.getSelectedRowData();
                    let c = 0;
                    if (eventData) {
                        c = eventData.cell;
                    }

                    this.onDataUpdated.emit({
                        row: d,
                        cell: c,
                    } as SlickGridEventData);

                    this.onSelectRow.emit([rowId]);
                }
            }
        }
    }

    beforeSetSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {

    }

    setSelectedRows(rowIds: number[]) {
        this.getSlick().setSelectedRows(rowIds);
        this._selectedRowsIds = rowIds;
        this.onSelectRow.emit(rowIds);
    }

    setSelectedRowsAll() {
        let dataView = this.getDataView();
        let items = dataView.getItems();
        this._selectedRowsIds = this.getIdsByItems(items);
        this.getSlick().setSelectedRows(this._selectedRowsIds);
        this.onSelectRow.emit(this._selectedRowsIds);
        this.cdr.detectChanges();
    }

    addSelectedRows(rowIds: number[]) {
        const selected = this.getSelectedRowsIds().concat(rowIds);
        this._selectedRowsIds = selected;
        this.getSlick().setSelectedRows(selected);
        this.onSelectRow.emit(rowIds);
    }

    removeSelectedRows(rowIds: number[]) {
        const selected = this.getSelectedRowsIds().filter((item: number) => {
            return !(rowIds.indexOf(item) > -1);
        });
        this._selectedRowsIds = selected;
        this.getSlick().setSelectedRows(selected);
        this.onUnSelectRow.emit(rowIds);
    }

    setCheckedRows(rowIds: number[], render: boolean = false) {
        this.checkedRows = rowIds;
        // let selectedRows = this.getDataView().getItems().map((item: SlickGridRowData) => {
        //     if (rowIds.indexOf(<number>item.id) > -1) {
        //         item.__checked = true;
        //         return item;
        //     }
        // });

        if (render) {
            this.getSlick().invalidateRows(rowIds);
            this.getSlick().render();
        }
    }

    addCheckedRows(rowIds: number[]) {
        rowIds.forEach((rid: number) => {
            if (this.checkedRows.indexOf(rid) == -1) {
                this.checkedRows.push(rid);
            }
        });
    }

    getCheckedRows(): number[] {
        return this.checkedRows;
        // return this.getDataView().getItems().filter((item: SlickGridRowData) => {return item.__checked});
    }

    getCheckedIndexes(): number[] {
        return this.checkedRows.map(id => this.dataView.getIdxById(id));
        // return this.getDataView().getItems().filter((item: SlickGridRowData) => {return item.__checked});
    }

    getCheckedRowsObjects(): SlickGridRowData[] {
        return this.getCheckedIndexes().map(index => this.dataView.getItemByIdx(index));
        // return this.getDataView().getItems().filter((item: SlickGridRowData) => {return item.__checked});
    }

    removeCheckedRows(rowIds: number[]/*, render: boolean = false*/) {
        rowIds.forEach((rid: number) => {
            const index = this.checkedRows.indexOf(rid);
            if (index > -1) {
                this.checkedRows.splice(index, 1);
            }
        });
        //
        // if(render){
        //     this.getSlick().invalidateRows(rowIds);
        //     this.getSlick().render();
        // }
    }

    isSelectedRow(idx: number): boolean {
        const d = this.getSelectedRowsIds();
        const res = !!d.filter((id: number) => {
            return id === idx ? true : false;
        }).length;

        return res;
    }

    getIdsByItems(items: SlickGridRowData[]): number[] {
        const dv = this.getDataView();
        const ids = items.map((item: SlickGridRowData) => {
            return dv.getRowById(item.id as string);
        });

        return ids;
    }

    /**
     * Return columns from grid (for internal only; instead it use method getActualColumns)
     * @returns {Array}
     */
    getColumns(): SlickGridColumn[] {
        let columns = [];
        if (this.slick) {
            columns = this.slick.getColumns();
        }

        return columns;
    }

    onDragRowStart($event: any) {
        // override
    }

    onDragRowDrop($event: any) {
        // override
    }

    onDragOver($event) {
        return event.preventDefault();
    }

    getMergeOriginalData(data: any[]) {
        const buffOriginalData = $.extend(true, [], this.originalData);
        const origDataIndexes = buffOriginalData.map((el) => el.ID);
        const toMerge = data.map((el) => {
            delete el['$id'];
            return el;
        });

        for (let i = 0; i < toMerge.length; i++) {
            const iOf = origDataIndexes.indexOf(toMerge[i].ID);
            if (iOf !== -1) {
                $.extend(true, buffOriginalData[iOf], toMerge[i]);
            }
        }
        return buffOriginalData;
    }

    getRowsToUpdateByIds(ids: number[]) {
        if (!(typeof this.getSlick().getData().getItems == 'function')) {
            return;
        }

        return this.getSlick().getData().getItems()
            .filter((el) => ids.indexOf(el.ID) >= 0)
            .map((el) => this.getSlick().getData().getIdxById(el.id));

    }

    getMergeDataviewData(data: any[]) {
        if (!(typeof this.getSlick().getData().getItems == 'function')) {
            return;
        }

        const items = this.getSlick().getData().getItems();
        const md = $.extend(true, [], items);
        const toMerge = data.map((el) => {
            delete el['$id'];
            return el;
        });
        const toMergeIndexes = toMerge.map((el) => el.ID);

        for (const key in md) {
            const iOf = toMergeIndexes.indexOf(md[key].ID);
            if (iOf !== -1) {
                // $.extend(true, this.originalData[key], data[iOf]);
                $.extend(true, md[key], toMerge[iOf]);
            }
        }

        return md;
    }

    prepareData(data: any[], count: number = null): any[] {
        // this.originalData = null;
        this.setOriginalData(data);
        // _.cloneDeep();

        let resp = this.prepareSimpleData(data, count);

        if (this.module.isTree.enabled === true) {
            resp = this.prepareTreeData(resp);
            this.applyCallbacksForTreeGrid();
        }
        if (this.module.isExpandable.enabled) {
            resp = this.prepareExpandableData(resp, resp.length);
            this.applyCallbacksForExpandableGrid();
        }
        if (this.module.isDraggable.enabled) {
            this.applyCallbackForDraggableGrid();
        }

        return resp;
    }

    // start of CB. Function exptession allow to save the function execution context and unsubscribe from events

    showAdditionalPanel(): boolean {
        return false;
        // override
    }

    createAdditionalPanel(): boolean {
        return false;
        // override
    }

    implementAdditionalPanel(): void {
        return;
    }

    getRowsBetweenIds(start, end): any[] {
        const res = [];
        const maxVal = start > end ? start : end;
        const minVal = start > end ? end : start;
        const iteration = (maxVal - minVal) + 1;
        for (let i = 0; i < iteration; i++) {
            const row = this.getDataView().getItemByIdx(minVal + i);
            res.push(row);
        }

        return res;

        // let res = [];
        // $.each(allRows)
    }

    getFieldsOfSelectedRows(field): any[] {
        const items = this.getSelectedRows();
        const res = items.map((c: SlickGridColumn) => {
            return c[field];
        });

        return res;
    }

    bindDragCallbacks() {
        $(this.els.grid.nativeElement).find('.slick-cell').on('drop', function (e) {
            $(e.target).addClass('selected');
        });
        // $(this.els.grid.nativeElement).find('.slick-cell').off('drop').on('drop', (e) => {
        //     $(e.target).parent().find('slick-cell').addClass('selected');
        //     // let i = $(e.target).index();
        //     // this.getSlick().setSelectedRows([i]);
        //     // let row = this.getDataView().getItemById(i);
        //     // this.onDrop.emit({row: row});
        //     // console.log('drop', e, row)
        // });
        // $.each(cells, (k, el) => {
        //     let $el = $(el);
        //     $el.unbind('drop')
        //
        //     $el.unbind('dragenter').bind('dragenter', (e) => {
        //         $(e.target).find('slick-cell').addClass('selected');
        //     })
        //
        //     $el.unbind('dragleave').bind('dragleave', (e) => {
        //         $(e.target).find('slick-cell').removeClass('selected');
        //         this.getSlick().setSelectedRows([]);
        //     })
        //
        // });

        // $(this.els.grid.nativeElement).find('.slick-cell').unbind('dragover').bind('dragover', (e) => {
        //     this.getSlick().setSelectedRows([]);
        //     console.log('dragover', e)
        // })

    }

    bindCallbacks() {
        // all callback variables using in linked functions store in _cbVars
        const cbVars = this._cbVars;

        cbVars.isDbl = false;
        cbVars.isMouseDown = false;
        cbVars.isShiftPressed = false;
        cbVars.firstElementShifter = null;
        cbVars.lastElementShifter = null;
        cbVars.isCtrlPressed = false;

        $(this.getGridEl().nativeElement).off('keyup keydown');
        $(this.getGridEl().nativeElement).on('keyup keydown', (e) => {
            cbVars.isShiftPressed = e.shiftKey;
        });

        $(this.getGridEl().nativeElement).on('keyup keydown', (e) => {
            cbVars.isCtrlPressed = e.ctrlKey;
        });

        // on sort
        this.slick.onSort.unsubscribe(this.slick_onSort);
        this.slick.onSort.subscribe(this.slick_onSort);

        // on resize columns
        this.slick.onColumnsResized.unsubscribe(this.slick_onColumnsResized);
        this.slick.onColumnsResized.subscribe(this.slick_onColumnsResized);

        // on reorder columns
        this.slick.onColumnsReordered.unsubscribe(this.slick_onColumnsReordered);
        this.slick.onColumnsReordered.subscribe(this.slick_onColumnsReordered);

        // on select view
        if (this.module.onSelectedView.observers.length > 0) {
            $.each(this.module.onSelectedView.observers, (k, o: any) => {
                o.unsubscribe();
            });
        }
        // this.module.onSelectedView.unsubscribe();
        this.module.onSelectedView.subscribe((data) => {
            if (!data) {
                this.clearAllColumns();
                this.applyColumns();
                this.module.viewIsEmpty = true;
                const viewsProvider: ViewsProvider = this.injector.get(ViewsProvider);
                viewsProvider.deleteView();
            } else {
            }
        });

        // dbl click
        this.slick.onDblClick.unsubscribe(this.slick_onDblClick);
        this.slick.onDblClick.subscribe(this.slick_onDblClick);

        // click
        this.slick.onClick.unsubscribe(this.slick_onClick);
        this.slick.onClick.subscribe(this.slick_onClick);

        // mouse down
        this.slick.onMouseDown.unsubscribe(this.slick_onMouseDown);
        this.calc_slick_onMouseDown();
        this.slick.onMouseDown.subscribe(this.slick_onMouseDown);

        // mouse up
        this.slick.onMouseUp.unsubscribe(this.slick_onMouseUp);
        this.slick.onMouseUp.subscribe(this.slick_onMouseUp);

        // context menu
        this.slick.onContextMenu.unsubscribe(this.slick_onContextMenu);
        this.slick.onContextMenu.subscribe(this.slick_onContextMenu);

        // on scroll
        this.slick.onScroll.unsubscribe(this.slick_onScroll);
        this.slick.onScroll.subscribe(this.slick_onScroll);

        this.slick.onMouseEnter.unsubscribe(this.slick_onMouseEnter);
        this.slick.onMouseEnter.subscribe(this.slick_onMouseEnter);

        this.slick.onMouseLeave.unsubscribe(this.slick_onMouseLeave);
        this.slick.onMouseLeave.subscribe(this.slick_onMouseLeave);

        this.slick.onKeyDown.unsubscribe(this.slick_onKeyDown);
        this.slick.onKeyDown.subscribe(this.slick_onKeyDown);

        this.getDataView().onRowsChanged.unsubscribe(this.dataView_onRowsChanged);
        this.getDataView().onRowsChanged.subscribe(this.dataView_onRowsChanged);

        $(this.gridEl.nativeElement).unbind('dblclick', this.gridEl_dblclick);
        $(this.gridEl.nativeElement).dblclick(this.gridEl_dblclick);

        if (this.module.dragDropCellEvents.dropCell) {
            this.slick.onDropCell.unsubscribe(this.slick_onDropCell);
            this.slick.onDropCell.subscribe(this.slick_onDropCell);
        }

        if (this.module.dragDropCellEvents.dragEnterCell) {
            this.slick.onDragEnterCell.unsubscribe(this.slick_onDragEnterCell);
            this.slick.onDragEnterCell.subscribe(this.slick_onDragEnterCell);
        }

        if (this.module.dragDropCellEvents.dragLeaveCell) {
            this.slick.onDragLeaveCell.unsubscribe(this.slick_onDragLeaveCell);
            this.slick.onDragLeaveCell.subscribe(this.slick_onDragLeaveCell);
        }

        if (this.module.dragDropCellEvents.dragStartCell) {
            this.slick.onDragStartCell.unsubscribe(this.slick_onDragStartCell);
            this.slick.onDragStartCell.subscribe(this.slick_onDragStartCell);
        }

        if (this.module.dragDropCellEvents.dragEndCell) {
            this.slick.onDragEnd.unsubscribe(this.slick_onDragEnd);
            this.slick.onDragEnd.subscribe(this.slick_onDragEnd);
        }

        if (this.module.dragDropCellEvents.dragInit) {
            this.slick.onDragInit.unsubscribe(this.slick_onDragInit);
            this.slick.onDragInit.subscribe(this.slick_onDragInit);
        }

        this.slick.onRenderComplete.unsubscribe(this.slick_onRenderComplete);
        this.slick.onRenderComplete.subscribe(this.slick_onRenderComplete);
    }

    /**
     * Get data of selected row
     * @returns {SlickData}
     */
    getSelectedRow(): SlickGridRowData | SlickGridTreeRowData {
        const rowIds: number[] = this.getSlick().getSelectedRows();
        if (rowIds && rowIds.length > 0) {
            return this.getDataView().getItem(rowIds[0]);
        }
    }

    /**
     * Get number of selected row
     * @returns {number}
     */
    getSelectedRowId(): number {
        const rowIds: number[] = this.getSlick().getSelectedRows();
        if (rowIds && rowIds.length > 0) {
            return rowIds[0];
        }
    }

    getSelectedRowsIds(): number[] {
        let res: number[] = [];
        if (this.getSlick()) {
            res = this.getSlick().getSelectedRows();
        }

        return res;
    }

    getSelectedRows(): SlickGridRowData[] {
        let res: SlickGridRowData[] = [];
        if (this.getSlick()) {
            const ids = this.getSlick().getSelectedRows();
            res = ids.map((id: number) => {
                return this.getDataView().getItem(id);
            });
            res = res.filter((el) => el !== null && el !== undefined);
        }

        return res;
    }

    /**
     * Get only data of row (without __providers and other trash)
     * @returns any
     */
    getSelectedRowData(): any {
        const d: SlickGridRowData | SlickGridTreeRowData = this.getSelectedRow();
        if (d) {
            delete d.__contexts;
        }

        return d;
    }

    getSelectedRowsData(): any {
        let res: SlickGridRowData[] = [];
        if (this.getSlick()) {
            const ids = this.getSlick().getSelectedRows();
            res = ids.map((id: number) => {
                return this.getDataView().getItem(id);
            }).filter((e) => !!e);
        }
        for (const key in res) {
            delete res[key].__contexts;
        }

        return res;
    }

    getSelectedRowNode() {
        let canvas = this.slick.getCanvasNode()
            , selectedRowId = this.getSelectedRowId()
            , rowNode;

        rowNode = (selectedRowId && canvas && canvas.children) ?
            canvas.children[selectedRowId] :
            null;

        return rowNode;
    }

    getClearDataAsArray(arr: SlickGridRowData[] = []): SlickGridRowData[] {
        const res: SlickGridRowData[] = [];
        const prev: SlickGridRowData[] = arr&&arr.length?[...arr]:this.getOriginalData();
        $.each(prev, (k, row: SlickGridRowData) => {
            res.push(this.clearDataItem(row));
        });

        return res;
    }

    /**
     *
     * @param event
     */
    arrowRowSwitch(event) {
        const selectedRowId = this.getSelectedRowId();
        let newselectedRowId;

        if (!(typeof selectedRowId == 'number')) {
            this.setSelectedRow(0);
            this.slick.scrollRowIntoView(0);
            return;
        }

        if (event.which == 38) {
            newselectedRowId = selectedRowId - 1;
        } else if (event.which == 40) {
            newselectedRowId = selectedRowId + 1;
        } else {
            return;
        }

        if (newselectedRowId < 0) {
            return;
        } else if (newselectedRowId >= this.getData().length) {
            return;
        } else {
            this.setSelectedRow(newselectedRowId);
            this.slick.scrollRowIntoView(newselectedRowId);
        }
    }

    prepareColsForAutoSize(columns: SlickGridColumn[] = []) {
        let allColumns = this.getActualColumns();
        if (!columns.length) {
            columns = this.getActualColumns();
        }
        // Sort actual columns by ID for correct entry of values into cells
        columns = columns.sort(CompareFunc);
        allColumns = allColumns.sort(CompareFunc);

        // columns = columns.filter((el) => {
        //     return el.id >= 0;
        // });
        const maxWidthsArr = this.getArrayOfMaxWidths(columns);

        $.each(maxWidthsArr, (i: number, w: number) => {
            const col = allColumns[i];
            if (w < 10) {
                // s = colStr;
            }

            if (w !== col.width) {
                col.calculatedWidth = (col.calculatedWidth || !col.width);
                if (col.minWidth > w) {
                    col.width = col.minWidth;
                } else if (col.maxWidth < w) {
                    col.width = col.maxWidth;
                } else {
                    col.width = w;
                }
            }
        });

        return allColumns;

        function CompareFunc(preEl: SlickGridColumn, nextEl: SlickGridColumn): number {
            return preEl.id as number - nextEl.id as number;
        }
    }

    /**
     * Autosize columns
     */
    autoSizeColumns(columns: SlickGridColumn[] = []) {
        if (!this.slick.getData().getItems().length) {
            this.slick.autosizeColumns();
        } else {
            this.prepareColsForAutoSize(columns);
            this.applyColumns();
        }
    }

    getArrayOfMaxWidths(cols: SlickGridColumn[] = []): any {
        const realPositions = [];
        const viewsProvider = this.injector.get(ViewsProvider);

        if (!cols.length) {
            cols = this.getActualColumns();
        } else {
            $.each(cols, (i: number | string, column: SlickGridColumn) => {
                realPositions[i] = this.getActualColumns().map(function (c: SlickGridColumn) {
                    return c.id;
                }).indexOf(column.id);
            });
        }

        const data = this.slick.getData().getItems();
        const matrixOfSizes = {};
        $.each(cols, (colNumber, col: SlickGridColumn) => {
            const cn = realPositions[colNumber] != undefined ? realPositions[colNumber] : col.id;
            //col with formatter
            const _col = col.__bindingFormat
                ? viewsProvider.getFormatterByFormat(col.__bindingFormat, col.__col, col)
                : viewsProvider.getFormatterByName(col.field, col.__col, col);

            const longestText = (typeof _col.formatter === 'undefined' && (data.length) && data[0].hasOwnProperty(col.field))
                ? data.map(el => el[col.field])
                    .reduce((el, el1) => {
                        return ((el1 === null || el1 === undefined) || (el + '').length > (el1 + '').length)
                            ? el
                            : el1;
                    }, '')
                : ''; //define longest text value. '' - if (data.length==0 || !data[0].hasOwnProperty(field))


            let cell = this.slick.getHeaderColumns()[cn];
            if (!cell || !cell.el) {
                return;
            }
            cell = cell.el;
            measuringCB(cell); //measure header column content

            if (data.length) {
                if (longestText) {
                    cell = this.slick.getCellNode(0, cn);
                    // measure column content via longestText - only without custom formatter
                    if (cell) {
                        measuringCB(cell, {initText: data[0][col.field], longestText: longestText});
                    }

                } else {
                    // measure column content for custom formatter by renderedRows
                    const range = this.slick.getRenderedRange();
                    for (let i = range.top; i <= range.bottom; i++) {
                        const cell = this.slick.getCellNode(i, cn);
                        if (cell && !cell[0]) { // IMPORTANT If you need cell[0] remember it breaks autosize for default grids!
                            measuringCB(cell);
                        } else {
                            measuringCB(cell[0]);
                        }
                    }
                }
            }

            function measuringCB(cell, longestText: { initText: string, longestText: string } = null) {
                let subEl = null;

                if (getComputedStyle(cell).display !== 'none') {
                    cell.style.width = '0px';
                    cell.style.display = 'block';

                    if (longestText) {
                        const findElByText = (el, text) => {
                            let res = null;
                            if (el.children.length) {
                                for (let ch of el.children) {
                                    res = findElByText(ch, text);
                                }
                            } else if (el.innerHTML.toLowerCase().trim() == text.toLowerCase().trim()) {
                                res = el;
                            }

                            return res;
                        };
                        subEl = findElByText(cell, longestText.initText + '');
                    }
                    if (subEl)
                        subEl.innerHTML = longestText.longestText;
                } else {
                    matrixOfSizes[cn] = 0;
                }
                const scW = cell.scrollWidth + (cell.offsetWidth - cell.clientWidth) + 5;
                const maxSize = matrixOfSizes[cn];
                if (maxSize !== 0 && (!maxSize || (maxSize < scW))) {
                    matrixOfSizes[cn] = scW;
                }
                cell.style.width = '';
                cell.style.display = '';

                if (subEl)
                    subEl.innerHTML = longestText.initText;
            }

        });

        return matrixOfSizes;
    }

    tryOpenPopupByRightClick($event, row) {
        const curValpopupOpened = this.popupOpened;

        this.openPopupsByRightClick($event, row);
        const self = this;
        const cb = function f(ev) {
            self.hidePopups();
            document.removeEventListener('click', f);
            document.removeEventListener('contextmenu', f);
        };
        $event.stopPropagation();
        if (!curValpopupOpened) {
            document.addEventListener('click', cb, true);
            document.addEventListener('contextmenu', cb, true);
        }

    }

    openPopupsByRightClick($event, row) {
        if (!this.popupOpened || (row.id != null && row.id != this.popupOpenedId)) {
            if (!this.module.popupsSelectors) {
                return;
            }
            const opts = this.module.popupsSelectors['settings'];
            if (!opts) {
                this.hidePopups();
                return false;
            }

            const btnEl = $($event.target);
            const offset = {
                top: $event.clientY + 4,
                left: $event.clientX + 4
            };
            // let offset = <any>btnEl.offset();
            // offset.top = offset.top + 4 + (<any>btnEl.height());
            // offset.left = offset.left + (<any>btnEl.width());

            $(opts.popupEl).show();
            $(opts.popupEl).offset(offset);

            let outOfconfines;
            outOfconfines = $(window).height() - $(opts.popupEl).children().height() - offset.top - 15;
            if (outOfconfines < 0) {
                offset.top = offset.top + outOfconfines;
            }

            outOfconfines = $(window).width() - $(opts.popupEl).children().width() - offset.left - 15;
            if (outOfconfines < 0) {
                offset.left = offset.left + outOfconfines;
            }

            $(opts.popupEl).offset(offset);
            this.popupOpened = true;
            this.popupOpenedId = row.id;
        } else {
            this.hidePopups();
        }
    }

    // popup
    tryOpenPopup($event) {
        if (!this.els) {
            return;
        }
        $event.stopPropagation();
        const curValpopupOpened = this.popupOpened;
        const dropdown = $(this.els.grid.nativeElement).find('.settingsButton');
        const element = $event.target;
        let target = 0;
        for (let i = 0; i < dropdown.length; i++) {
            target += $(dropdown[i]).has(element).length;
        }

        if (dropdown.length >= 0) {
            this.hidePopups();
        }

        if (target === 1) {
            this.openPopups($event);
            const self = this;
            const cb = function f(ev) {
                self.hidePopups();
                document.removeEventListener('click', f);
                document.removeEventListener('contextmenu', f);
            };
            $event.stopPropagation();
            if (!curValpopupOpened) {
                document.addEventListener('click', cb, true);
                document.addEventListener('contextmenu', cb, true);
            }

        }
    }

    //
    openPopups($event) {
        const selectedRows = this.getSelectedRows();
        const btnEl = $($event.target);

        if (!this.popupOpened || (btnEl.data('rowid') != null && btnEl.data('rowid') != this.popupOpenedId)) {
            if (!this.module.popupsSelectors) {
                return;
            }
            const opts = this.module.popupsSelectors[btnEl.data('popupid')];
            if (!opts) {
                this.hidePopups();
                return false;
            }

            // let rowId = btnEl.data('rowid');
            // let model = this.config.gridOptions.api.getModel();
            // this.rowData = model.getRow(rowId - 1);
            const offset = btnEl.offset() as any;
            offset.top = offset.top + 4 + (btnEl.height() as any);
            offset.left = offset.left + (btnEl.width() as any);

            $(opts.popupEl).show();
            $(opts.popupEl).offset(offset);

            const outOfconfines = $(window).height() - $(opts.popupEl).children().height() - offset.top - 15;
            if (outOfconfines < 0) {
                offset.top = offset.top + outOfconfines;
            }
            $(opts.popupEl).offset(offset);
            this.popupOpened = true;
            this.popupOpenedId = btnEl.data('rowid');
        } else {
            this.hidePopups();
        }

    }

    hidePopups() {
        this.popupOpened = false;
        this.popupOpenedId = null;

        if (!this.config.moduleContext) {
            return;
        }
        // this.rowData = null;
        $.each(this.module.popupsSelectors, (l, sel) => {
            if (sel && sel.popupEl) {
                $(sel.popupEl).hide();
            }
            if (sel && sel.popupMultiEl) {
                $(sel.popupMultiEl).hide();
            }

        });
        return;
    }

    // end of CB

    setPlaceholderText(text: string, translate: boolean = false, params: Object = {}): void {
        let resText = '';
        if (translate) {
            this.translate.get(text, params).subscribe((res: any) => {
                resText = res;
            });
        } else {
            resText = text;
        }

        if (this.loadingIndicator) {
            this.loadingIndicator.remove();
        }

        const $g = $(this.gridEl.nativeElement);
        this.loadingIndicator = $("<span class='overlay-indicator'><label>" + resText + '</label></span>').appendTo($g);
        this.updatePlaceholderPosition();

    }

    updatePlaceholderPosition() {
        if (this.loadingIndicator) {
            const $g = $(this.gridEl.nativeElement);
            this.loadingIndicator
                .css('position', 'absolute')
                .css('top', $g.position().top + 60)
                .css('left', $g.position().left);
        }

    }

    setCustomPlaceholder(el) {
        this.loadingIndicator = el;
    }

    clearPlaceholder() {
        this.loadingIndicator = null;
    }

    hidePlaceholder() {
        if (this.loadingIndicator) {
            this.loadingIndicator.hide();
        }

    }

    showPlaceholder() {
        if (this.loadingIndicator) {
            this.resize();
            this.loadingIndicator.show();
        }
    }

    changeColParams(field, params) {
        const col = this.slick.getColumns().filter((el) => {
            return el.field == field;
        });
        if (col.length > 0) {
            for (const key in params) {
                col[0][key] = params[key];
            }
            const cols = this.getColumns().map((c: SlickGridColumn, i: string & number) => {
                c.id = i;
                return c;
            });
            this.slick.setColumns(cols);
        }
    }

    setRowHeight(field) {
        const col = this.slick.getColumns().filter((el) => {
            return el.field == field;
        });

        let maxTagsLength = 0, tagsCount = 0;
        this.slick.getData().getItems().forEach((el) => {
            if (el[field].join('').length > maxTagsLength) {
                maxTagsLength = el[field].join('').length;
                tagsCount = el[field].length;
            }
        });
        const calcHeight = (30 * (Math.floor((maxTagsLength + tagsCount * 20) / col[0].width) + 2));
        this.plugin.rowHeight = calcHeight;
        this.slick.setOptions({rowHeight: calcHeight}, true);
        // this.resetData();
        const cols = this.getColumns().map((c: SlickGridColumn, i: string & number) => {
            c.id = i;
            return c;
        });
        this.slick.setColumns(cols);

    }

    deleteRow(data, _id: number = null) {
        // const idToRemove = data.data.rowNumber;
        const id = _id != null ? _id : this.getId(data.data.data);
        this.dataView.deleteItem(id);
        this.removeCheckedRows([id]);

        // if (_id != null) {
        //     this.dataView.deleteItem(_id);
        //     this.removeCheckedRows([_id]);
        // } else {
        //     const id = (idToRemove) ? this.dataView.getItem(idToRemove).id : data.data.data.id;
        //     if (id != null) {
        //         this.dataView.deleteItem(id);
        //         this.removeCheckedRows([id]);
        //     }
        // }
        this.slick.invalidate();
        this.slick.render();
        // this.onRowDelete.emit(id);
        this.onRowDelete.emit(data.data.data/*.ID || data.data.data.customId*/);
    }

    deleteFromServer(data): Observable<any> {
        return;
    }

    deleteUnnecessaryDataBeforeSaving(data) {
        for (let i = data.length - 1; i >= 0; --i) {
            delete data[i].__contexts;
            delete data[i].EntityKey;
            delete data[i].$id;
            delete data[i].id;
        }
        return data;
    }

    getAdditionalRowId(id, idx, additionalId: number | string = null) {
        return id + (additionalId != null ? '.' + additionalId : '') + '.' + idx;
    }

    getInjectedContexts() {
        return {
            provider: this,
        } as SlickGridInjectedContexts;
    }

    // openPopupMulti(btnEl) {
    //     const offset = btnEl.offset() as any;
    //     offset.top = offset.top + 4 + (btnEl.height() as any);
    //     offset.left = offset.left + (btnEl.width() as any);
    //
    //     $(opts.popupEl).show();
    //     $(opts.popupEl).offset(offset);
    //
    //     const outOfconfines = $(window).height() - $(opts.popupEl).children().height() - offset.top - 15;
    //     if (outOfconfines < 0) {
    //         offset.top = offset.top + outOfconfines;
    //     }
    //     $(opts.popupEl).offset(offset);
    //     this.popupOpened = true;
    //     this.popupOpenedId = btnEl.data('rowid');
    // }

    prepareExpandableData(data: any[], count: number): any[] {
        const res: any[] = [];
        for (let i = 0; i <= count; i++) {
            const item: SlickGridExpandableRowData = data[i];
            if (item) {
                // item._collapsed = this.module.isExpandable.startState == 'collapsed' ? true : false;
                item._collapsed = true;
                item._sizePadding = 0;     // the required number of padding rows
                item._height = 0;     // the actual height in pixels of the detail field
                item._isPadding = false;
                item._additionalRows = [];
                item._disabled = false;
                if (!item.__contexts) {
                    item.__contexts = this.getInjectedContexts();
                }
                res.push(item);
            }
        }

        return res;
    }

    ngOnDestroy() {
        this.stopRefreshTimer();
        if(this.selectAllHandler)
            this.selectAllHandler.unsubscribe();
    }

    doRefresh(component) {
        this.refreshContainer = component;
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
            this.cdr.detectChanges();
        }
        if ((this.componentContext as any).refreshOn) {
            this.refreshTimer = this.setRefreshTimeout(component);
        }
    }

    stopRefreshTimer() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
            (this.componentContext as any).refreshOn = false;
            this.cdr.detectChanges();
        }
    }

    refreshGrid(withOverlays: boolean = false) {
        if (this.lastSearchModel) {
            // error prone due to async call within this.buildPage
            // this.selectedRows = this.getSlick().getSelectedRows();
            // this.clearData(true);

            this.buildPage((this.storedSearchParams as any).searchModel, false, withOverlays);
            (this.componentContext as any).refreshStarted = true;
        }
    }

    onGridWrapperClick(event: MouseEvent): void {
        if (!this.module.canSetFocus) {
            return;
        }
        let el = event.target;
        let dontResetFocus = false; // if you click on the PLAYER or MEDIA LIST - focus on grid should stay (if it was active)
        while (true) {
            if ((!(el as any).id && (el as any).className.indexOf('simple-list-wrapper') < 0) || ((el as any).id && (el as any).id.indexOf('imfx-video') < 0)) {
                el = (el as any).parentElement;
                if (!el) {
                    break;
                }
            } else {
                dontResetFocus = true;
                break;
            }
        }
        if (dontResetFocus) {
            return;
        }
        this.module.isFocused = this.gridWrapperEl.nativeElement.contains(event.target);
    }

    onClickCancelInOverlay(): void {
        this.hideOverlay();
    }

    /**
     * it returns false by default.
     * you need to redefine it so that it returns true if the click occurs on a submenu.
     * @param event
     */
    clickOnIcon(event): boolean {
        return false;
    }

    /**
     * id - $id (index)
     * @param id
     */
    moveToTopRow(id: number) {
        this.buildPageByData({
            Data: this.arrayProvider.move(this.getData(), id, 0)
        });
    }

    /**
     * id - $id (index)
     * @param id
     */
    moveToBottomRow(id: number) {
        this.buildPageByData({
            Data: this.arrayProvider.move(this.getData(), id, this.getData().length - 1)
        });
    }

    copyToClipboardRow() {
        if (!this.getSelectedRow() || this.getActualColumns().length === 0) {
            return;
        }
        const row = this.getSelectedRow();
        const res = Object.keys(row).reduce((acc: string[], key) => {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                acc.push(row[key]);
            }

            return acc;
        }, []);
        this.clipboardProvider.copy(res.join(','));
    }

    copyToClipboardViewRow() {
        if (!this.getSelectedRow() || this.getActualColumns().length === 0) {
            return;
        }
        const row = this.getSelectedRow();
        const res = this.getActualColumns(true).reduce((acc: string[], column: SlickGridColumn) => {
            if (row[column.field] !== undefined && row[column.field] !== null && row[column.field] !== '') {
                acc.push(row[column.field]);
            }
            return acc;
        }, []);
        this.clipboardProvider.copy(res.join(','));
    }

    updateExtendsColumnsCallback() {
        const lsm = this.lastSearchModel || (this.storedSearchParams as any).searchModel || null;
        if (lsm) {
            this._buildPageRequest(
                this.config.options.searchType,
                lsm,
            );
            // this.buildPage();
        }
    }

    destroyUsedUpFormatters() {
        let sg = this.moduleContext
            , sgCon = sg.vcRef.element.nativeElement
            , i;

        if (sg.vcRef.length == 0) {
            return;
        }

        for (i = sg.vcRef.length - 1; i >= 0; i--) {
            const vr = (sg.vcRef.get(i)) as any;
            if (!sgCon.contains(vr.rootNodes[0])) {
                vr.destroy();
            }
        }
    }

    // for delete formatter
    isDisabledDelete(params): boolean {
        return false;
    }

    // for delete formatter
    isDeleteMultiEnabled(params?): boolean {
        return true;
    }

    isMultiSelectedItems(): boolean {
        const selectedRows = this.getSelectedRows();
        if (this.plugin.multiSelect && selectedRows.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *Set mode for displaying table as grid or tiles
     *@param mode - string value
     */
    setViewMode(mode: 'table' | 'tile') {
        if (this.module.viewMode == mode) {
            return;
        }

        this.saveScrollTop();
        this.module.viewMode = mode;
        switch (mode) {
            case 'tile': {
                this.columnsForSetTableViewMode = this.getActualColumns();
                const columns = this.getTilesFormatter();
                for (const e in columns) {
                    if (!columns[e].__contexts) {
                        columns[e].__contexts = this.getInjectedContexts();
                    }
                }

                this.slick.setOptions({
                    frozenColumn: -1,
                    tileMode: true
                });
                this.tileResize();
                this.slick.setColumns(columns);
                this.update();
                this.setSelectedRows(this.getSelectedRowsIds());
                this.bindCallbacks();

                setTimeout(() => {
                    this.refreshGridScroll();
                });

                const self = this;
                // $(window).resize(function () {
                //     // let rowHeight = Math.round(self.totalPageRows / Math.floor($('#' + self.uid).width() / self.tileWidth)) * self.tileHeight / self.totalPageRows + 10;
                //     // self.slick.setOptions({rowHeight: rowHeight});
                //
                // });
                break;
            }
            case 'table': {
                this.cdr.detectChanges(); // need to detect change after switch from "tile-mode" px-2428
                this.slick.setOptions({autoHeight: false, tileMode: false});
                const thumbEnabled = !!(this.componentContext.searchThumbsComp && this.componentContext.searchThumbsComp.enabled);
                if (!thumbEnabled) {
                    this.slick.setOptions({rowHeight: this.plugin.rowHeight}, true);
                } else {
                    this.slick.setOptions({rowHeight: this.module.rowHeightWithThumb}, true);
                }

                this.setActualColumns(this.columnsForSetTableViewMode, true);
                this.columnsForSetTableViewMode = [];
                this.applyColumns();
                this.bindCallbacks();

                setTimeout(() => {
                    this.refreshGridScroll();
                });

                break;
            }
            default: {
                break;
            }
        }
        this.onToggleViewMode.emit(this.module.viewMode);

        if (mode === 'tile') {
            this.scrollToIndex(this.getSelectedRowsIds()[0]);
        }
    }

    /**
     * Show loading overlay
     */
// public showLoadingOverlay() {
//     this.config.gridOptions.api.showLoadingOverlay();
//     this.setPlaceholderText('', true, {})
// }

    scrollToIndex(rowIndex: number, withSelect: boolean = false) {
        let cN = this.slick.getCellNode(0, 0)
            , vpN = this.slick.getViewportNode()
            , cH
            , vpH
            , offset
            , resOS;

        if (!cN) {
            return;
        }

        cH = cN.clientHeight;
        vpH = vpN.clientHeight;
        offset = Math.floor(vpH / cH / 2);

        if (rowIndex - offset <= 0) {
            resOS = 0;
        } else {
            resOS = rowIndex - offset
        }

        this.slick.scrollRowToTop(resOS);
        if (withSelect) {
            this.setSelectedRow(rowIndex, null, true);
        }
    }

    getExportUrl() {
        return '';
    }

    protected _setSelectionAndDataAfterRequest(resp: SlickGridResp, searchModel?: SearchModel, supressDataUpdated = false, withNullSelection = true) {
        this.selectedRows = (!this.module.resetSelectedRow)
            ? this.getSlick().getSelectedRows()
            : [];
        const data = this.prepareData(resp.Data, resp.Data.length);
        if (this.getData().length) {
            this.clearData(false);
        }

        this.setData(data, true);
        (this.componentContext as any).refreshStarted = false;

        if (data.length > 0) {
            if (this.selectedRows.length > 1) {
                this.setSelectedRows(this.selectedRows);
            } else if (this.selectedRows.length == 1) {
                this.setSelectedRow(this.selectedRows[0]);
            } else if (this.selectedRows.length == 0 && this.module.selectFirstRow == true) {
                this.setSelectedRow(0, data[0]); // selected first row
            } else if(withNullSelection) {
                this.setSelectedRow(null);
            }

        } else if (data.length == 0) {
            this.setSelectedRow(null, null, supressDataUpdated);
        }
    }

    protected _buildPageRequest(searchType: string, searchModel: SearchModel, resetSearch: boolean = false, withOverlays: boolean = true, url: string = null): void {
        this._currentSearchModel = searchModel;

        this.prevStateOfReset = resetSearch;

        const requestForSearch: FinalSearchRequestType = this.getRequestForSearch(searchModel, searchType);

        this.onGridStartSearch.emit({
            newModel: searchModel
        });

        withOverlays && this.showOverlay();

        this.hidePlaceholder();

        this.lastRequestForSearch = requestForSearch;
        let page = requestForSearch.Page;

        if (resetSearch && this.module.pager.enabled == true) {
            if (this.PagerProvider) {
                if (this.PagerProvider.currentPage != 1) {
                    page = 1;
                    this.PagerProvider.setPage(page, false);
                }
            }
            this.setSelectedRow(null, null, true);
        }

        if (this.refreshContainer) {
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
                this.cdr.detectChanges();
            }
        }
        this.storedSearchParams = {
            withOverlays,
            searchModel
        };

        this.searchSubject.next({
            searchType: this.config.options.searchType,
            searchModel,
            page,
            requestForSearch,
            url
        });
    }

    private slick_onSort = (event, args) => {
        const self = this;

        if (self.lastSearchModel) {
            self.buildPage(self.lastSearchModel as SearchModel);
        }

        if (self.module.clientSorting) {
            const currentSortCol = args.sortCol
                , isAsc = args.sortAsc
                , data = currentSortCol.__deps || null
                , _sort = getSortFunc(currentSortCol, isAsc, data);

            if (self.module.isTree.enabled) {
                let sourceRows
                    , resultRows;

                sourceRows = self.dataView.getItems();
                resultRows = [];

                const treeTraversal = function (parentIndex) {

                    const filtRows = sourceRows
                        .filter(function (el) {
                            return `${el.parent}` === `${parentIndex}`;
                        });

                    if (filtRows.length != 0) {
                        filtRows.sort(_sort);
                        for (const item of filtRows) {
                            resultRows.push(item);
                            treeTraversal(item.id);
                        }
                    } else {
                        return;
                    }

                };

                treeTraversal(null);
                self.setData(resultRows, true);

            } else {
                self.dataView.sort(_sort);
            }

            self.slick.invalidate();
            // self.slick.render();  //it's included in invalidate()
        }

        function getSortFunc(currentSortCol, isAsc, data) {
            const formatter = (typeof currentSortCol.formatter == 'function') && currentSortCol.formatter || null;

            switch (formatter) {
                case Select2Formatter :
                    data = data.data;
                    if (!data || !data.values || !data.rule) {
                        console.warn('Not enough data for sorting select2 ("values" or "rule")');
                        return;
                    }

                    let sortDict = {}
                        , values = data.values
                        , key = data.rule.key
                        , text = data.rule.text
                        , i;

                    for (i = 0; i < values.length; i++) {
                        sortDict[values[i][key]] = values[i][text];
                    }

                    return function (dataRow1, dataRow2) {
                        const field = currentSortCol.field;
                        const sign = isAsc ? 1 : -1;
                        let value1 = sortDict[dataRow1[field]],
                            value2 = sortDict[dataRow2[field]];
                        value1 = typeof value1 === 'string' ? value1.toLowerCase().trim() : value1;
                        value2 = typeof value2 === 'string' ? value2.toLowerCase().trim() : value2;
                        const result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                        if (result !== 0) {
                            return result;
                        }
                    };
                case LookupFormatter :
                    if (!data || !data.lookupMap) {
                        console.warn('Not enough data for sorting lookups ("lookupMap")');
                        return;
                    }

                    const lookupMap = data.lookupMap;

                    return function (dataRow1, dataRow2) {
                        const field = currentSortCol.field;
                        const sign = isAsc ? 1 : -1;
                        let value1 = lookupMap[dataRow1[field]],
                            value2 = lookupMap[dataRow2[field]];
                        value1 = typeof value1 === 'string' ? value1.toLowerCase().trim() : value1;
                        value2 = typeof value2 === 'string' ? value2.toLowerCase().trim() : value2;
                        const result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                        if (result !== 0) {
                            return result;
                        }
                    };
                case DatetimeFormatter:
                    return function (dataRow1, dataRow2) {
                        const field = currentSortCol.field;
                        const sign = isAsc ? 1 : -1;
                        const value1 = new Date(typeof dataRow1[field] === 'string' ? dataRow1[field].trim() : dataRow1[field]),
                            value2 = new Date(typeof dataRow2[field] === 'string' ? dataRow2[field].trim() : dataRow2[field]);
                        const result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                        if (result !== 0) {
                            return result;
                        }
                    };
                default:
                    return function (dataRow1, dataRow2) {
                        const field = currentSortCol.field;
                        const sign = isAsc ? 1 : -1;
                        const value1 = typeof dataRow1[field] === 'string' ? dataRow1[field].toLowerCase().trim() : dataRow1[field],
                            value2 = typeof dataRow2[field] === 'string' ? dataRow2[field].toLowerCase().trim() : dataRow2[field];
                        const result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                        if (result !== 0) {
                            return result;
                        }
                    };
            }
        }
    };

    private slick_onColumnsResized = (event, args) => {
        const self = this;

        let aProvCol = self.getActualColumns(true)
            , slickCol = self.getSlick().getColumns()
            , i;

        for (i = 0; i < aProvCol.length; i++) {
            aProvCol[i].width = slickCol[i].width;
        }

        if (self.module.colNameForSetRowHeight) {
            self.setRowHeight(self.module.colNameForSetRowHeight);
        }
    };

    private slick_onColumnsReordered = (event, args) => {
        const self = this;

        // checking of existing sortColumns and save it to apply after setActualColumns
        const _sortCol = [], sortCol = self.getSlick().getSortColumns();
        for (const item of sortCol) {
            const _item = {
                columnIndex: self.getSlick().getColumnIndex(item['columnId']),
                sortAsc: item['sortAsc']
            };
            _sortCol.push(_item);
        }

        let cols = self.getColumns().filter((el) => {
            return el.id >= 0;
        }).map((c: SlickGridColumn, i: string & number) => {
            c.id = i;
            return c;
        });
        const resCols = self.getColumns().filter((el) => {
            return el.id < 0;
        }).concat(cols);

        // set the same sortCols as until id was redefined
        if (_sortCol.length != 0) {
            cols = self.getColumns();
            for (const item of _sortCol) {
                item['columnId'] = cols[item['columnIndex']].id;
                delete item['columnIndex'];
            }
            self.getSlick().setSortColumns(_sortCol);
        }

        self.setActualColumns(resCols, true);
        self.setSelectedRows(self.getSelectedRowsIds());
    };

    private slick_onDblClick = (event, args) => {
        const self = this
            , cbVars = self._cbVars;

        cbVars.isDbl = true;
        const rowData: SlickGridRowData = self.getSlick().getDataItem(args.row);
        self.onRowMouseDblClick.emit({
            row: rowData,
            cell: args.cell,
        } as SlickGridEventData);
    };

    private slick_onMouseUp = (event, args) => {
        const self = this
            , cbVars = self._cbVars;

        cbVars.isMouseDown = false;
        if (cbVars.isDbl) {
            cbVars.isDbl = false;
            return false;
        }

        const rowData: SlickGridRowData = self.getSlick().getDataItem(args.row);
        self.onRowMouseUp.emit({
            row: rowData,
            cell: args.cell,
        } as SlickGridEventData);
    };

    private slick_onContextMenu = (event, args) => {
        const self = this
            , cbVars = self._cbVars;

        cbVars.isMouseDown = false;
        if (cbVars.isDbl) {
            cbVars.isDbl = false;
            return false;
        }

        const rowData: SlickGridRowData = self.getSlick().getDataItem(args.row);
        self.onRowMouseRightClick.emit({
            row: rowData,
            cell: args.cell,
            event
        } as SlickGridEventData);
    };

    private slick_onScroll = (event, args) => {
        const self = this;

        self.onScrollGrid.emit(args as SlickGridScrollEvent);
    };

    private slick_onMouseEnter = (event, args) => {
        const self = this
            , className = 'hover-row'
            , rowEls = self.getMouseHoveredRowElement(event);

        if (rowEls.frozenRowEl) {
            rowEls.frozenRowEl.addClass(className);
        }
        rowEls.rowEl.addClass(className);
    };

    private slick_onMouseLeave = (event, args) => {
        const self = this
            , className = 'hover-row'
            , rowEls = self.getMouseHoveredRowElement(event);

        if (rowEls.frozenRowEl) {
            rowEls.frozenRowEl.removeClass(className);
        }
        rowEls.rowEl.removeClass(className);
    };

    private slick_onKeyDown = (event, args) => {
        this.arrowRowSwitch(event);
    };

    private dataView_onRowsChanged = (event, args) => {
        // let self = this.providerContext;
        this.slick.invalidateAllRows();
        // this.slick.render();
        // setImmediate(() => {
        //     this.resize();
        // })
    };

    private gridEl_dblclick = ($event) => {
        if ($event && $event.target && $($event.target).hasClass('slick-resizable-handle')) {
            // old
            // let columntText = $($event.target).parent().text();
            // let columns = this.getActualColumns().filter((c: SlickGridColumn) => {
            //     return c.name == columntText;
            // });

            const headerElems = $(this.gridEl.nativeElement).find('.slick-header-column');
            const clickedElem = $($event.target).closest('.slick-header-column');
            const index = headerElems.index(clickedElem);
            if (index !== -1 && clickedElem.length) {
                const columns = [this.getActualColumns(true)[index]];
                this.autoSizeColumns(columns);
            }

        }
    };

    private slick_onDropCell = (event, args) => {
        const sel = this.getRowElFromEvent(event);
        this.onDropCell.emit({row: this.getDataView().getItemByIdx($(sel).index())});
    };

    private slick_onDragEnterCell = (event, args) => {
        const sel = this.getRowElFromEvent(event);

        this.setSelectedRow($(sel).index(), null, true);
    };

    private slick_onDragLeaveCell = (event, args) => {
        // let tagName = event.target.tagName;
        // if (tagName == "SPAN") {
        //     event = event.target.parentElement;
        // } else {
        //     event = event.target;
        // }
        // $(e.target.parentElement).find('.slick-cell').removeClass('selected');
        // let row = this.getDataView().getItemById($(event.parentElement).index());
        // this.setSelectedRow($(event.parentElement).index(), null, true);
        // this.onDragLeaveCell.emit({row: row})
    };

    private slick_onDragStartCell = (event, args) => {
        const row = this.getDataView().getItemById($(event.target.parentElement).index());
        this.onDragStartCell.emit({row});
    };

    private slick_onDragEnd = (event, args) => {
        this.onDragRowDrop({e: event, d: args});
        // let row = this.getDataView().getItemById($(e.target.parentElement).index());
        // this.onDragStartCell.emit({row: row});
    };

    private slick_onDragInit = (event, args) => {
        this.onDragRowStart({e: event, d: args});
    };

    private setRefreshTimeout(component) {
        return setTimeout(() => {
            if ($(component).length) {
                this.refreshGrid();
            } else {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
                this.cdr.detectChanges();
            }
        }, 5000);
    }

    // private columnsMap
    private updateExtendsColumns(defColumns: ViewColumnsType, cols: SlickGridColumn[]): Promise<void> {
        return new Promise<any>((resolve) => {
            const extendedColumns: string[] = [];
            $.each(cols, (j, col: SlickGridColumn) => {
                const defColumn = defColumns[col.__bindingName];
                if (defColumn && defColumn.IsExtendedField === true) {
                    if (extendedColumns.indexOf(col.__bindingName) === -1) {
                        extendedColumns.push(col.__bindingName);
                        // console.log('added to extendedColumns', col, defColumn);
                    }
                }
            });
            let isNewColumns: boolean = false;
            if (extendedColumns.length > 0) {
                $.each(extendedColumns, (k, val) => {
                    if (this.extendedColumns.indexOf(val) === -1) {
                        isNewColumns = true;
                        return false;
                    }
                });
            }
            this.extendedColumns = extendedColumns;
            this.service.setExtendsColumns(extendedColumns);
            if (isNewColumns) {
                this.updateExtendsColumnsCallback();
            }
            resolve();
        });
    }

    public updateFacetsFieldOverride(facetsFieldOverrideList): Promise<void> {
        return new Promise<any>((resolve) => {
            this.facetsFieldOverrideList = facetsFieldOverrideList;
            this.service.setFacetsFieldOverride(facetsFieldOverrideList);
            resolve();
        });
    }

    protected calc_slick_onMouseDown() {
        const self = this
            , cbVars = self._cbVars;

        const handleFunction = (row, event, eventData) => {
            if (!this.plugin.multiSelect) { // simple
                // set selected
                this.setSelectedRow(row, eventData);

            } else { // multi
                if (cbVars.isShiftPressed || event.shiftKey) {// shift
                    if (cbVars.firstElementShifter == null) {
                        cbVars.firstElementShifter = this._selectedRowsIds.length > 0 ? this._selectedRowsIds[0] : null;
                    }
                    if (cbVars.firstElementShifter === null) {
                        cbVars.firstElementShifter = eventData.row;
                    } else {
                        cbVars.lastElementShifter = eventData.row;
                        const selectedRows = this.getRowsBetweenIds(cbVars.firstElementShifter, cbVars.lastElementShifter);
                        const _selectedRowsIds = this.getIdsByItems(selectedRows);
                        this._selectedRowsIds = $.extend(this._selectedRowsIds, _selectedRowsIds);
                        this.setSelectedRows(this._selectedRowsIds);
                    }
                } else if (cbVars.isCtrlPressed || event.ctrlKey || event.metaKey) { // ctrl or cmd
                    const lastRowId = this._selectedRowsIds.length - 1;
                    cbVars.firstElementShifter = this._selectedRowsIds.length > 0 && this._selectedRowsIds[lastRowId] ? this._selectedRowsIds[lastRowId] : null;
                    const idx = this._selectedRowsIds.indexOf(eventData.row);
                    if (idx > -1) {
                        this._selectedRowsIds.splice(idx, 1);
                    } else {
                        this._selectedRowsIds.push(eventData.row);
                    }
                    this.setSelectedRows(this._selectedRowsIds);
                } else if (this.clickOnIcon(event)) {
                    this.setSelectedRows(this._selectedRowsIds);
                } else {
                    this._selectedRowsIds = [];
                    this.setSelectedRow(eventData.row, eventData);
                    cbVars.firstElementShifter = cbVars.lastElementShifter = null;
                    if (this._selectedRowsIds.indexOf(eventData.row) == -1) {
                        this._selectedRowsIds.push(eventData.row);
                    }
                }
            }

            // emit mousedown
            this.emitOnRowMouseDown(eventData);
        };

        switch (this.module.viewMode) {
            case 'tile': {
                this.slick_onMouseDown = (event, eventData: any) => {
                    cbVars.isMouseDown = true;
                    if (cbVars.isDbl) {
                        cbVars.isDbl = false;
                        return false;
                    }

                    const el = $(event.target).closest('.slick-row');
                    const i = el.index();

                    handleFunction(i, event, eventData);
                };
                break;
            }
            default: {
                this.slick_onMouseDown = (event, eventData: any) => {
                    if (
                        $(event.target).hasClass('dd-dots') ||
                        $(event.target).parent().hasClass('dd-dots')) {
                        return;
                    }

                    cbVars.isMouseDown = true;
                    if (cbVars.isDbl) {
                        cbVars.isDbl = false;
                        return false;
                    }

                    handleFunction(eventData.row, event, eventData);
                };
            }
        }
    }

    clearDataItem(item: SlickGridRowData | any) {
        delete item.id;
        // item._collapsed = this.module.isExpandable.startState == 'collapsed' ? true : false;
        delete item._collapsed;
        delete item._sizePadding;
        delete item._height;
        delete item._isPadding;
        delete item._additionalRows;
        delete item._disabled;
        delete item.__contexts;

        return item;
    }

    private getMouseHoveredRowElement(e): {
        rowEl: any, frozenRowEl: any
    } {
        let el = $(e.currentTarget).parent();
        const i = el.index();
        let frozenEl = null;
        // if fined element is friozen column
        if (el.parent('.grid-canvas-left').length) {
            frozenEl = el;
            el = $(this.gridEl.nativeElement).find('.grid-canvas-right .slick-row').eq(i);
        } else {
            // find frozen
            // if (this.plugin.frozenColumn > -1) {
            frozenEl = $(this.gridEl.nativeElement).find('.grid-canvas-left .slick-row').eq(i);
            // }
        }
        return {
            rowEl: el,
            frozenRowEl: frozenEl
        };
    }

    private __triggerTreeRow(item: SlickGridTreeRowData, collapsed): number[] {
        const changed: number[] = [];
        const dataView = this.getDataView();
        let childProp = this.module.isTree.expandMode === 'allLevels' ? 'deepChilds' : 'childs';
        const mode = this.module.isTree.expandMode;
        item.collapsedMark = collapsed;
        if (collapsed === true) {
            childProp = 'deepChilds';
        } else {
            childProp = this.module.isTree.expandMode == 'allLevels' ? 'deepChilds' : 'childs';
        }

        if (item[childProp] && item[childProp].length > 0) {
            for (let i = 0; i <= item[childProp].length; i++) {
                const child: SlickGridTreeRowData = (dataView.getItemById(item[childProp][i]) as SlickGridTreeRowData);
                if (child) {
                    child.hidden = collapsed;
                    child.collapsed = item.collapsedMark;
                    child.collapsedMark = mode === 'allLevels' ? item.collapsedMark : !item.collapsedMark;
                    dataView.updateItem((child.id as string), child);
                    // changed.push(<number>child.id);
                }
            }

            dataView.updateItem((item.id as string), item);
        }

        return changed;
    }

    private applyCallbacksForTreeGrid() {
        this.applyCallbacks((slick, dataView) => {
            slick.onMouseDown.subscribe((e, args) => {
                if ($(e.target).hasClass('slickgrid-toggle-row')) {
                    const id: number = parseInt($(e.target).attr('id'));
                    const item: SlickGridTreeRowData = dataView.getItemByIdx(id);
                    const invalidRows = [];
                    if (item.collapsedMark) {
                        this.collapseTreeRow(item);
                        // invalidRows  = item.deepChilds;
                    } else {
                        this.expandTreeRow(item);
                        // invalidRows  = item.childs;
                    }

                    invalidRows.push(id);
                    this.slick.invalidateAllRows();

                    this.slick.render();
                    this.resize();
                    e.stopImmediatePropagation();
                }
            });
        });
    }

    private applyCallbacksForExpandableGrid() {
        this.applyCallbacks((slick, dataView) => {
            slick.onClick.subscribe((e, args) => {
                if ($(e.target).hasClass('slickgrid-toggle-expandable')
                    // || $(e.target).prev().hasClass('slickgrid-toggle-expandable')
                ) {
                    const item: SlickGridExpandableRowData = dataView.getItemByIdx(args.row);
                    this.__triggerExpandableRow(item);
                    e.stopImmediatePropagation();
                }
            });

            // dataView.onRowsChanged.subscribe(function (e, args) {
            //     slick.invalidateRows(args.rows);
            //     slick.render();
            // });
        });
    }

    private applyCallbackForDraggableGrid() {
        this.applyCallbacks((slick, dataView) => {
            slick.onMouseDown.subscribe((e, args) => {
                if ($(e.target).hasClass('dd-dots')) {

                    // e.stopImmediatePropagation();
                }
            });
        });

    }

    /**
     * Prepare rows
     */
    private prepareSimpleData(data: any[], count: number): any[] {
        const res: any[] = [];
        for (let i = 0; i <= count; i++) {
            const item: SlickGridRowData = data[i];
            if (item) {
                item.id = i;
                item.$id = i;
                if (item && !item.__contexts) {
                    item.__contexts = this.getInjectedContexts();
                }
                res.push(item);
            }
        }

        return res;
    }

    /**
     * Prepare rows for tree
     * @param data
     * @returns {Array}
     */
    private prepareTreeData(data: any[]): any[] {
        let res = [];
        const parentId = null;
        const indent = 0;

        res = this.processPrepareTreeData(data, res, parentId, indent);

        return res;
    }

    /**
     * Prepare data for tree in recursion
     * @param data
     * @param treeData
     * @param parentId
     * @param indent
     * @returns {any[]}
     */
    private processPrepareTreeData(data: any[], treeData: any[], parentId: number | string, indent: number): any[] {
        for (let i = 0; i <= data.length; i++) {
            const row: SlickGridTreeRowData = data[i];
            if (row) {
                const collapseState = !(this.module.isTree.startState === 'expanded');
                row.collapsed = collapseState;
                row.collapsedMark = collapseState;
                row.parent = parentId;
                row.indent = indent;
                if (row.Children && row.Children.length > 0) {
                    const newDeepChilds = [];
                    const newChilds = [];
                    const parentRow = treeData.filter((r) => {
                        return r.id === row.parent;
                    })[0];
                    parentId = row.id;
                    indent++;
                    $.each(row.Children, (k: string, child) => {
                        const chId = `${parentId}` + '.' + `${k}`;
                        child.id = chId;
                        if (parentRow && parentRow.deepChilds) {
                            parentRow.deepChilds.push(chId);
                            newDeepChilds.push(chId);
                            newChilds.push(chId);
                        } else {
                            newDeepChilds.push(chId);
                            newChilds.push(chId);
                        }
                    });

                    row.deepChilds = Object.assign([], newDeepChilds);
                    row.childs = Object.assign([], newChilds);
                    treeData.push(row);
                    this.processPrepareTreeData(row.Children, treeData, parentId, indent);
                    indent--;
                    parentId = parentRow ? parentRow.id : null;
                } else {
                    treeData.push(row);
                }
            }
        }

        return treeData;
    }

    private implementDisableFields(jqOld) {
        const origSortable = jqOld.fn.sortable;
        jqOld.fn.sortable = function (options) {
            if (options !== null && typeof options === 'object') {
                options.cancel = '.disable-reorder';
            }
            return origSortable.apply(this, arguments);
        };
    }

    private implementItemMetadata() {
    }

    protected emitOnRowMouseDown(eventData) {
        // get data by rowId
        const rowData: SlickGridRowData = this.getSlick().getDataItem(eventData.row);

        // emit mousedown
        this.onRowMouseDown.emit({
            row: rowData,
            cell: eventData.cell,
        } as SlickGridEventData);
    }

    private getTilesFormatter() {
        const columns = [];
        columns.push({
            id: 'tile-view',
            name: 'Tiles',
            formatter: TileFormatter,
            cssClass: 'tile-cell',
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            __deps: {
                injector: this.injector
            },
            source: this.config.options.module.tileSource,
            isThumbnails: this.config.options.module.tileParams.isThumbnails,
            isIcons: this.config.options.module.tileParams.isIcons
        });
        return columns;
    }

    // https://stackoverflow.com/questions/40603913/search-recursively-for-value-in-object-by-property-name
    findNode(id, currentNode, field = 'ID', chField = 'Children') {
        var i,
            currentChild,
            result;

        if (id == currentNode[field]) {
            return currentNode;
        } else {

            // Use a for loop instead of forEach to avoid nested functions
            // Otherwise "return" will not work properly
            if (currentNode && currentNode[chField]) {
                for (i = 0; i < currentNode[chField].length; i += 1) {
                    currentChild = currentNode[chField][i];

                    // Search in the current child
                    result = this.findNode(id, currentChild, field, chField);

                    // Return the result if the node has been found
                    if (result !== false) {
                        return result;
                    }
                }
            }

            // The node has not been found and we have no more options
            return false;
        }
    }

    getId(row: SlickGridRowData): number {
        return <number>row.id;
    }

    getIdField(): string {
        return 'id' // src/app/modules/search/slick-grid/libs/jlynch7/slick.dataview.js:33
    }

    setNullRow(suppressDataUpdated) {
        this.getSlick().setSelectedRows([]);
        this._selectedRowsIds = [];
        this.prevRowId = null;
        if (!suppressDataUpdated || (this.lastData && this.lastData['row'] !== null && this.lastData['cell'] !== null)) {
            this.onDataUpdated.emit(<SlickGridEventData>{
                row: null,
                cell: null,
            });
        }
    }

    setNotNullRow(eventData, suppressDataUpdated, rowId) {
        this.prevRowId = rowId;
        if (!suppressDataUpdated) {
            // emit data updated
            let d = this.getSelectedRowData();
            let c = 0;
            if (eventData) {
                c = eventData.cell;
            }
            this.onDataUpdated.emit(<SlickGridEventData>{
                row: d,
                cell: c,
            });
            this.onSelectRow.emit([rowId]);
        }
    }
}
