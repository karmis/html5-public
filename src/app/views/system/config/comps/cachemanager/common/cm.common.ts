import {
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    ElementRef,
    Injector,
    Type,
    ViewChild
} from '@angular/core';
import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';

import { SlickGridService } from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../../../../../../modules/search/slick-grid/slick-grid';
import { IMFXModalComponent } from '../../../../../../modules/imfx-modal/imfx-modal';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { IMFXModalProvider } from '../../../../../../modules/imfx-modal/proivders/provider';
import { LookupService } from '../../../../../../services/lookup/lookup.service';
import { takeUntil } from 'rxjs/operators';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../../../../modules/search/slick-grid/slick-grid.config';
import { CacheManagerAvailableTypes, CacheManagerCommonService } from './cm.common.service';
import { CacheManagerCommonProvider } from './cm.common.provider';
import { CacheManagerCommonSlickGridProvider } from './cm.common.slickgrid.provider';
import { ViewsProvider } from '../../../../../../modules/search/views/providers/views.provider';
import { CacheManagerCommonViewsProvider } from './cm.common.views.provider';

export class CacheManagerCommonComponent {
    public wrapper: ElementRef;
    public datasetFilter: ElementRef;
    public slickGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                },
                externalWrapperEl: "#externalWrapperXsltTables",
                selectFirstRow: false,
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 25,
                fullWidthRows: true,
                forceFitColumns: false,
                multiAutoHeight: true
            }
        })
    });
    public data: any = {};
    public modal: IMFXModalComponent;
    public tableData = [];
    public inputTimeout;
    public selectedData = null;
    public gridReady = false;
    public purgePreset = [];
    public destroyed$: Subject<any> = new Subject();

    public firstLoad = true;
    public self = this;
    // @ViewChild('devicesControl', {static: false}) private devicesControl: IMFXControlsLookupsSelect2Component;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    public slickGridWrapper: ElementRef;
    public slickGridComp: SlickGridComponent;
    public cdr: ChangeDetectorRef;
    public translate: TranslateService;
    public lookupService: LookupService;
    public modalProvider: IMFXModalProvider;
    public compFactoryResolver: ComponentFactoryResolver;
    public appRef: ApplicationRef;
    public slickGridProvider: CacheManagerCommonSlickGridProvider;
    public provider: CacheManagerCommonProvider;
    public service: CacheManagerCommonService;
    public viewsProvider: ViewsProvider;
    public listName: CacheManagerAvailableTypes;
    public saveName: CacheManagerAvailableTypes;
    public res: any = {};

    constructor(public injector: Injector) {
        this.cdr = this.injector.get(ChangeDetectorRef);
        this.translate = this.injector.get(TranslateService);
        this.lookupService = this.injector.get(LookupService);
        this.modalProvider = this.injector.get(IMFXModalProvider);
        this.compFactoryResolver = this.injector.get(ComponentFactoryResolver);
        this.appRef = this.injector.get(ApplicationRef);
        this.slickGridProvider = this.injector.get(CacheManagerCommonSlickGridProvider);
        this.provider = this.injector.get(CacheManagerCommonProvider);
        this.service = this.injector.get(CacheManagerCommonService);
        this.viewsProvider = this.injector.get(CacheManagerCommonViewsProvider);
        this.slickGridProvider.compContext = this;
        this.data = {
            tableRows: [],
            tableColumns: []
        };
    };

    ngOnInit() {
        this.toggleOverlay(true);
    }

    ngAfterViewInit() {
        this.bindDataToGrid(false);
        this.getTable(false);
        if (!this.slickGridComp) {
            return;
        }
        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
                    delete data.row.id;
                    this.doAction({
                        data: data.row
                    });
                });
                this.slickGridComp.provider.onSelectRow.subscribe((data) => {
                    if (data && data.length > 0 && this.gridReady) {
                        let row = this.slickGridComp.provider.getSelectedRow();
                        if (row) {
                            this.selectedData = {
                                field: "ID",
                                value: row["ID"]
                            }
                        }

                    }
                });
            });
    }

    processTable(res, self, isReload) {
        if (!isReload) {
            this.data.tableColumns = this.viewsProvider.getCustomColumns(null, res, {
                purgePreset: this.purgePreset,
                context: this,
                injector: this.injector,
                translate: this.translate
            });
        }

        this.data.tableRows = res;
        this.bindDataToGrid(isReload);
    }

    doAction(data) {
        this.showModal(data);
    }

    public showModal(data) {
        // override
    }

    public getTable(isReload: boolean = false) {
        this.gridReady = false;
        if (!isReload) {
            this.selectedData = null;
            this.cdr.detectChanges();
        }
        this.toggleOverlay(true);
        if (this.slickGridComp) {
            this.slickGridComp.provider.dataView.beginUpdate();
            if (this.datasetFilter && this.datasetFilter.nativeElement) {
                this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
                this.slickGridComp.provider.dataView.setFilterArgs({
                    filter: $(this.datasetFilter.nativeElement).val().trim()
                });
            }
        }

        this.data.tableColumns = [];
        this.service.getList(this.listName)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                if (res) {
                    this.res = res;
                    this.tableData = res;
                    this.processTable(res, self, isReload);
                    this.onGridLoaded(res);
                    this.toggleOverlay(false);
                    this.cdr.detectChanges();
                }
            });
    }

    onGridLoaded(res: any[]) {

    }

    toggleOverlay(show) {
        if (show)
            this.overlayGroup.show(this.slickGridWrapper.nativeElement);
        else
            this.overlayGroup.hide(this.slickGridWrapper.nativeElement);
    }

    convertToMap(lookupData, field) {
        var result = {};
        for (var i = 0; i < lookupData.length; i++) {
            result[lookupData[i][field]] = lookupData[i].text;
        }
        return result;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.toggleOverlay(false);
        clearTimeout(this.inputTimeout);
        // this.slickGridComp.onGridReady.unsubscribe();
        if (this.slickGridComp) {
            this.slickGridComp.provider.onRowMouseDblClick.unsubscribe();
            this.slickGridComp.provider.onSelectRow.unsubscribe();
        }
    }

    updateDataset(filter, timeout = 500) {
        clearTimeout(this.inputTimeout);
        if (timeout == 0)
            this.toggleOverlay(true);
        this.inputTimeout = setTimeout(() => {
            this.slickGridComp.provider.slick.scrollRowToTop(0);
            if (timeout != 0)
                this.toggleOverlay(true);
            filter = filter.trim();
            this.slickGridComp.provider.dataView.beginUpdate();
            this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
            this.slickGridComp.provider.dataView.setFilterArgs({
                filter: filter
            });
            this.slickGridComp.provider.dataView.endUpdate();
            var renderedRange = this.slickGridComp.provider.slick.getRenderedRange();
            this.slickGridComp.provider.dataView.setRefreshHints({
                ignoreDiffsBefore: renderedRange.top,
                ignoreDiffsAfter: renderedRange.bottom + 1,
                isFilterNarrowing: true,
                isFilterExpanding: true,
            });
            this.slickGridComp.provider.dataView.refresh();
            this.slickGridComp.provider.slick.invalidateAllRows();
            this.slickGridComp.provider.slick.render();
            this.toggleOverlay(false);
        }, timeout);
    }

    clearDatasetFilter() {
        $(this.datasetFilter.nativeElement).val("");
        this.updateDataset("", 0);
    }

    filterByValue(o, filterArgs) {
        return Object.keys(o).some(k => {
            if (o[k] == null) {
                return false;
            }
            delete o.__contexts;
            delete o.$id;
            delete o.EntityKey;
            if (o.hasOwnProperty(k)) {
                return o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase());
            } else {
                return false;
            }
        });
    }

    _showModal(path: { loadChildren: () => Promise<any> }, type: Type<any>, itemData: any = null, titleFn: Function, size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full-size' = 'md') {
        let isNew = false;
        if (!itemData) {
            isNew = true;
        }
        const data = {isNew: isNew, itemData: itemData, context: this};
        this.modal = this.modalProvider.showByPath(path, type, {
            size: size,
            title: titleFn(data),
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, data);
        this.modal.load().then(() => {
            this.modal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    this.getTable(true);
                }
            })
        });
    }

    public bindDataToGrid(isReload) {
        if (!this.slickGridComp) {
            this.toggleOverlay(false);
            return;
        }
        (this.slickGridComp.provider as CacheManagerCommonSlickGridProvider).compContext = this;
        if (!isReload) {
            this.slickGridComp.provider.setGlobalColumns(this.data.tableColumns);
            this.slickGridComp.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }
        this.slickGridComp.provider.buildPageByData({Data: this.data.tableRows});

        this.slickGridComp.whenGridRendered((e, grid) => {
            this.slickGridComp.provider.autoSizeColumns();
            this.slickGridComp.provider.slick.setSortColumns([]);
            this.gridReady = true;
            this.cdr.detectChanges();
            if (this.selectedData != null) {
                this.slickGridComp.provider.setSelectedBy(this.selectedData.field, this.selectedData.value, true);
            } else {
                this.slickGridComp.provider.slick.scrollRowToTop(0);
                this.slickGridComp.provider.setSelectedRow();
            }
        });

        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }

            if (this.firstLoad) {
                this.firstLoad = false;
            } else {
                this.toggleOverlay(false);
            }
            this.cdr.detectChanges();
        }, 1);
    }
}
