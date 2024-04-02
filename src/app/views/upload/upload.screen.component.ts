import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {IMFXModalComponent} from "../../modules/imfx-modal/imfx-modal";
import {UploadComponent} from "../../modules/upload/upload";
import {IMFXModalEvent} from "../../modules/imfx-modal/types";
import {IMFXModalProvider} from "../../modules/imfx-modal/proivders/provider";
import {UploadProvider} from "../../modules/upload/providers/upload.provider";
import {SlickGridComponent} from "../../modules/search/slick-grid/slick-grid";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {SlickGridProvider} from "../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../modules/search/slick-grid/services/slick.grid.service";
import {ViewsProvider} from "../../modules/search/views/providers/views.provider";
import {UploadScreenViewsProvider} from "./providers/views.provider";
import {UploadScreenSlickGridProvider} from "./providers/slick.grid.provider";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../modules/search/slick-grid/slick-grid.config";

import {UploadModel} from "../../modules/upload/models/models";
import {SecurityService} from "../../services/security/security.service";
import {lazyModules} from "../../app.routes";


@Component({
    selector: 'upload-screen',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: UploadScreenViewsProvider},
        {provide: SlickGridProvider, useClass: UploadScreenSlickGridProvider},
    ]
})

export class UploadScreenComponent {

    @ViewChild('datasetFilter', {static: false}) datasetFilter: ElementRef;
    public destroyed$: Subject<any> = new Subject();
    @ViewChild('overlay', {static: true}) private overlay: any;
    @ViewChild('uploadGridWrapper', {static: true}) private uploadGridWrapper: any;
    @ViewChild('slickGridComp', {static: true}) private slickGridComp: SlickGridComponent;
    private slickGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: "#uploadSlickGridExternalWrapper",
                selectFirstRow: false,
                clientSorting: true,
                /*popupsSelectors: {
                    'settings': {
                        'popupEl': '.class_for_popup'
                    }
                }*/
            },
            plugin: <SlickGridConfigPluginSetups>{
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });
    private modal: IMFXModalComponent;
    private uploadData = [];
    private data: any = {};
    private inputTimeout;
    private selectedData;
    private uploadModelStatesMapping = {
        'waiting': 'Waiting',
        'progress': 'In Progress',
        'success': 'Completed',
        'error': 'Error',
        'aborted': 'Aborted',
        'calculating': 'Calculating',
        'warning': 'Warning',
        'restored': 'Restored',
        'paused': 'Paused',
    };

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected cdr: ChangeDetectorRef,
                protected uploadProvider: UploadProvider,
                protected viewsProvider: ViewsProvider,
                protected modalProvider: IMFXModalProvider,
                protected injector: Injector,
                protected securityService: SecurityService) {
        this.data = {
            tableRows: [],
            tableColumns: []
        };
    }

    ngOnInit() {
        let self = this;
        this.overlay.show(self.uploadGridWrapper.nativeElement);
        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                self.InitUploadGrid();
                setInterval(() => {
                    self.UpdateUploadGrid();
                });
                self.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
                    //delete data.row.id;
                    //this.doAction(data);
                });
                self.slickGridComp.provider.onSelectRow.subscribe((data) => {
                    if (data && data.length > 0) {
                        const row = self.slickGridComp.provider.getSelectedRow();
                        if(row){
                            self.selectedData = {
                                field: "Title",
                                value: row["Title"]
                            };
                        }
                    }
                });
            });
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        clearTimeout(this.inputTimeout);
        this.overlay.hide(this.uploadGridWrapper.nativeElement);
    }

    private InitUploadGrid() {
        this.selectedData = null;
        this.overlay.show(this.uploadGridWrapper.nativeElement);
        this.cdr.detectChanges();
        this.slickGridComp.provider.dataView.beginUpdate();
        this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
        this.slickGridComp.provider.dataView.setFilterArgs({
            filter: ""
        });
        this.slickGridComp.provider.dataView.endUpdate();

        this.data.tableColumns = [];

        this.prepareDataForGrid(this.uploadData, false);
        this.uploadProvider.getService(this.uploadProvider.getUploadMethod()).retrieveQueue().subscribe((/*ums: UploadModel[]*/) => {
            this.UpdateUploadGrid();
            this.overlay.hide(this.uploadGridWrapper.nativeElement);
        });
    }

    private UpdateUploadGrid() {
        this.slickGridComp.provider.dataView.beginUpdate();
        this.data.tableColumns = [];
        this.uploadData = [];
        //
        this.uploadProvider.getUploadModelsByStates("progress", "aborted", "success", "calculating", "restored", "warning", "waiting", "paused").map((um: UploadModel) => {
            // todo implement all cases in um.getFormattedPercentValue();
            const percent = um.method === 'native.chunk'?um.chunkingUploadPercent:um.getFormattedPercentValue();
            if(um) {
                // console.log(um);
                this.uploadData.push({
                    Title: um.meta.Title,
                    Filename: um.name,
                    Type: um.meta.MediaFormat.text,
                    Size: um.getFormattedSize(),
                    Progress: um.state==='success'||um.state==='warning'?100:percent.toFixed(2),
                    Status: this.uploadModelStatesMapping[um.state]
                });
            }

            this.slickGridComp.provider.setData(this.uploadData);
        });

        this.slickGridComp.provider.buildPageByData({Data: this.uploadData});
        this.slickGridComp.provider.dataView.endUpdate();
        this.slickGridComp.provider.autoSizeColumns();
        this.cdr.detectChanges();
    }

    private prepareDataForGrid(res, isReload) {
        if (!isReload) {
            this.data.tableColumns = this.data.tableColumns.concat(this.viewsProvider.getCustomColumns());
        }

        this.data.tableRows = res;
        this.bindDataToGrid(isReload);
    }

    private clearDatasetFilter() {
        $(this.datasetFilter.nativeElement).val("");
        this.updateDataset("", 0);
    }

    private updateDataset(filter, timeout = 500, isFilter = true) {
        clearTimeout(this.inputTimeout);
        if (timeout == 0)
            this.overlay.show(this.uploadGridWrapper.nativeElement);
        this.inputTimeout = setTimeout(() => {
            this.slickGridComp.provider.slick.scrollRowToTop(0);
            if (timeout != 0)
                this.overlay.show(this.uploadGridWrapper.nativeElement);
            filter = filter.trim();
            this.slickGridComp.provider.dataView.beginUpdate();
            this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
            this.slickGridComp.provider.dataView.setFilterArgs({
                filter: filter,
                //myArg: true,
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
            this.overlay.hide(this.uploadGridWrapper.nativeElement);
            if (isFilter) {
                this.selectedData = null;
                setTimeout(() => {
                    if (this.destroyed$.isStopped) {
                        return;
                    }
                    this.slickGridComp.provider.slick.scrollRowToTop(0);
                    this.slickGridComp.provider.setSelectedRow();
                });
            } else {
                if (this.selectedData != null) {
                    setTimeout(() => {
                        if (this.destroyed$.isStopped) {
                            return;
                        }
                        this.slickGridComp.provider.setSelectedBy(this.selectedData.field, this.selectedData.value, true);
                    });
                } else {
                    setTimeout(() => {
                        if (this.destroyed$.isStopped) {
                            return;
                        }
                        this.slickGridComp.provider.slick.scrollRowToTop(0);
                        this.slickGridComp.provider.setSelectedRow();
                    });
                }
            }
        }, timeout);
    }

    private filterByValue(o, filterArgs) {
        /*if (filterArgs.myArg) {
            return false;
        }*/

        var result = Object.keys(o).some(k => {
            if (o[k] == null) {
                return false;
            }
            if (o.hasOwnProperty(k)) {
                return o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase());
            } else {
                return false;
            }
        });
        return result;
    }

    private openUpload(files?: FileList): IMFXModalComponent {
        if(!this.securityService.hasPermissionByName('media_upload')) {
            console.warn('>>> Upload not allowed');
            return;
        }
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.upload_modal, UploadComponent, {
            title: 'base.media_upload',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });

        modal.load().then((cr: ComponentRef<UploadComponent>) => {
            const uc: UploadComponent = cr.instance;

            if (files) {
                uc.onSelectFiles(files);
            }

            const msbs = modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'hide' || e.name === 'autohide') {
                    this.uploadProvider.uploadModalIsOpen = false;
                    msbs.unsubscribe();
                }
            });
            this.modal = modal;

        });

        return modal;
    }

    private bindDataToGrid(isReload) {
        let self = this;
        if (!isReload) {
            this.slickGridComp.provider.setGlobalColumns(this.data.tableColumns);
            this.slickGridComp.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }
        this.slickGridComp.provider.buildPageByData({Data: this.data.tableRows});

        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                self.slickGridComp.provider.autoSizeColumns();
                self.slickGridComp.provider.slick.setSortColumns([]);
                self.cdr.detectChanges();
                if (self.selectedData != null) {
                    setTimeout(() => {
                        if (this.destroyed$.isStopped) {
                            return;
                        }
                        self.slickGridComp.provider.setSelectedBy(self.selectedData.field, self.selectedData.value, true);
                    });
                } else {
                    setTimeout(() => {
                        if (this.destroyed$.isStopped) {
                            return;
                        }
                        self.slickGridComp.provider.slick.scrollRowToTop(0);
                        self.slickGridComp.provider.setSelectedRow();
                    });
                }
            });

        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }

            self.overlay.hide(this.uploadGridWrapper.nativeElement);
            self.cdr.detectChanges();
            if (isReload) {
                self.cdr.detectChanges();
                self.updateDataset($(this.datasetFilter.nativeElement).val().trim(), 100, false);
            }
        }, 1);
    }
}
