import {
    ApplicationRef,
    ComponentFactoryResolver,
    Inject,
    Injector,
    ReflectiveInjector
} from "@angular/core";
import { Router } from "@angular/router";
import { CacheManagerExpandRowComponent } from "../comps/grid/formatters/expand.row/expand.row.formatter";
import {
    SlickGridExpandableRowData,
    SlickGridInsideExpandRowFormatterData,
    SlickGridResp
} from "../../../modules/search/slick-grid/types";
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import * as $ from "jquery";
import { BaseProvider } from '../../base/providers/base.provider';
import { CacheManagerComponent } from "../cachemanager.component";
import { SearchModel } from "../../../models/search/common/search";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";

export type SlickGridExpandableRowDataWithDevices = SlickGridExpandableRowData & { Devices: any[] }

export class CMSlickGridProvider extends SlickGridProvider {
    public selectedSubRow?: { id?: number, index?: number, selectedSubRow?: number } = {};
    public expandedRows?: number[] = [];
    public baseProvider: BaseProvider;
    public isDevItemLocked: number = 1; // for disable item lock button
    private componentByID = [];

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.baseProvider = injector.get(BaseProvider);
    }

    onRowDoubleClicked($event): void {
    }

    public __triggerExpandableRow(item: SlickGridExpandableRowDataWithDevices, stateExpanded: boolean = null, silent: boolean = false) {
        if (!item._disabled) {
            super.__triggerExpandableRow(item, stateExpanded, silent);
        }
    }

    public prepareExpandableData(data: any[], count: number): any[] {
        let res: any[] = [];
        for (let i = 0; i <= count; i++) {
            let item: SlickGridExpandableRowDataWithDevices = data[i];
            if (item) {
                item.id = $.isNumeric(item.$id) ? item.$id - 1 : i;
                // item._collapsed = this.module.isExpandable.startState == 'collapsed' ? true : false;
                item._collapsed = true;
                item._sizePadding = 0;     //the required number of padding rows
                item._height = 0;     //the actual height in pixels of the detail field
                item._isPadding = false;
                item._additionalRows = [];
                if (!item.Devices || item.Devices.length == 0) {
                    item._disabled = true;
                }
                if (!item.__contexts) {
                    item.__contexts = this.getInjectedContexts();
                }
                res.push(item);
            }
        }

        return res;
    }

    public lookupDynamicContent(item: SlickGridExpandableRowData | any): void {
        if (item._collapsed == true) {
            this.expandedRows = this.expandedRows.filter((e) => {
                e == item.ID ? false : true;
            });

            delete this.componentByID[item.ID];
            return;
        } else {
            this.expandedRows.push(item.ID);
        }
        let content = [];
        content.push('<div class="expanded-row-detail-' + item.id + '">Loading...</div>');
        item._detailContent = content.join("");
        let contentCount = (<any>item).Devices.length > 0 ? (<any>item).Devices.length + 1 : 0;
        item = this.calcSize(item, contentCount);
    }

    public calcSize(item, contentCount = 1) {
        let rowHeight = this.getSlick().getOptions().rowHeight;
        let lineHeight = 30; //we know cuz we wrote the custom css init ;)
        item._sizePadding = Math.ceil((contentCount * lineHeight) / rowHeight);
        item._height = (item._sizePadding * rowHeight);

        return item;
    }

    public createDetailComponent(item): void {
        // prepare ang module for render

        let factory = this.compFactoryResolver.resolveComponentFactory(CacheManagerExpandRowComponent);
        let resolvedInputs = ReflectiveInjector.resolve([{
            provide: 'data', useValue: {
                data: <SlickGridInsideExpandRowFormatterData>{
                    item: item,
                    provider: this
                }
            }
        }]);
        let injector = ReflectiveInjector.fromResolvedProviders(
            resolvedInputs
        );
        let componentRef = factory.create(injector);
        this.componentByID[item.ID] = componentRef;
        let el: any = $(this.getGridEl().nativeElement).find('div.expanded-row-detail-' + item.id);
        if (el) {
            this.baseProvider.insertComponentIntoView(this.moduleContext.vcRef, componentRef, el);
        }
    }

    lockUnlockItemInCache($event, flag) {
        let data = this.getSelectedRowData();
        if (!data) {
            return;
        }
        let items = this.getData();
        (<CacheManagerComponent>this.config.componentContext).cachemanagerService.lockItemInCache(data.ID, 0, flag).subscribe((res: any) => {
                flag ? this.notificationService.notifyShow(1, 'cachemanager.lock_success') : this.notificationService.notifyShow(1, 'cachemanager.unlock_success');
                (<any>items).forEach((el) => {
                    if (el.Devices) {
                        if (el.ID == data.ID) {
                            el.Devices.forEach((elem) => {
                                elem.IS_LOCKED = flag;
                            });
                            this.getSlick().invalidateRow((<number>el.$id));
                            this.getSlick().render();
                        }
                    }
                });
            },
            (err) => {
                flag ? this.notificationService.notifyShow(2, 'cachemanager.lock_error') : this.notificationService.notifyShow(2, 'cachemanager.unlock_error');
            });
    }

    forceUnforceItemInCache(flag) {
        let data = this.getSelectedRowData();
        if (!data) {
            return;
        }
        (<CacheManagerComponent>this.config.componentContext).cachemanagerService.forceItemInCache(data.ID, flag).subscribe((res: any) => {
                flag ? data.FORCE_FLAG = 1 : data.FORCE_FLAG = 0;
                flag ? this.notificationService.notifyShow(1, 'cachemanager.force_success') : this.notificationService.notifyShow(1, 'cachemanager.unforce_success');
            },
            (err) => {
                flag ? this.notificationService.notifyShow(2, 'cachemanager.force_error') : this.notificationService.notifyShow(2, 'cachemanager.unforce_error');
            });
    }

    copyToClipboard() {
        let data = this.getSelectedRowData();
        if (!data) {
            return;
        }
        this.clipboardProvider.copy(data.EVENT_ID + ', ' + data.TITLE);
        this.notificationService.notifyShow(1, 'common.copied');
    }

    lockUnlockItemInCacheInSubRow($event, flag) {
        let btnEl = $($event.target);
        let devId = btnEl.parents('.cacheManagerExpandRowItemSettingsPopup').data('childid');
        let id = btnEl.parents('.cacheManagerExpandRowItemSettingsPopup').data('parentid');
        let data = this.getData();
        (<CacheManagerComponent>this.config.componentContext).cachemanagerService.lockItemInCache(id, devId, flag).subscribe((res: any) => {
                flag ? this.notificationService.notifyShow(1, 'cachemanager.lock_success') : this.notificationService.notifyShow(1, 'cachemanager.unlock_success');
                (<any>data).forEach((el) => {
                    if (el.Devices) {
                        if (el.ID == id) {
                            let device: SlickGridExpandableRowDataWithDevices = el.Devices.filter((elem) => {
                                return elem.DEV_ID == devId;
                            })[0];
                            device && ((<any>device).IS_LOCKED = flag);
                            this.getSlick().invalidateRow((<number>el.$id));
                            this.getSlick().render();
                        }
                    }
                });
            },
            (err) => {
                flag ? this.notificationService.notifyShow(2, 'cachemanager.lock_error') : this.notificationService.notifyShow(2, 'cachemanager.unlock_error');
            });
    }

    resetChecksInSubRow($event) {
        let btnEl = $($event.target);
        let devId = btnEl.parents('.cacheManagerExpandRowItemSettingsPopup').data('childid');
        let id = btnEl.parents('.cacheManagerExpandRowItemSettingsPopup').data('parentid');
        (<CacheManagerComponent>this.config.componentContext).cachemanagerService.resetChecksInSubRow(id, devId).subscribe((res: any) => {
                this.buildPageLazy(id);
                this.notificationService.notifyShow(1, 'cachemanager.reset_checks_success');
            },
            (err) => {
                this.notificationService.notifyShow(2, 'cachemanager.reset_checks_error');
            });
    }

    isItemLocked() {
        return this.isDevItemLocked;
    }

    isItemForced() {
        let data = this.getSelectedRowData();
        if (!data) {
            return;
        }
        return data.FORCE_FLAG;
    }

    buildPageLazy(id) {
        let searchModel: SearchModel = new SearchModel();
        let asm_id = new AdvancedSearchModel();

        asm_id.setDBField('ID');
        asm_id.setField('Id');
        asm_id.setOperation('=');
        asm_id.setValue(id);
        if (!searchModel.hasAdvancedItem(asm_id)) {
            searchModel.addAdvancedItem(asm_id);
        }

        this._buildPageRequestLazy(searchModel);
    }

    afterRequestDataLazy(resp, searchModel) {
        let mergedRespData = this.getMergeOriginalData(resp.Data);
        this.setOriginalData(mergedRespData);
        let rows = this.getData();
        this.selectedRows = (<any>rows).filter((el: any) => {
            return el.ID == searchModel.getAdvanced()[0].getValue();
        })[0].$id;
        this.setSelectedRows(this.selectedRows);

        let data = this.getMergeDataviewData(resp.Data);
        this.updateData(this.selectedRows, data);
        // (<CacheManagerComponent>this.config.componentContext).refreshStarted = false;
    }

    private _buildPageRequestLazy(searchModel: SearchModel) {
        this.isBusyGrid = true;
        this.onGridStartSearch.emit();

        this.service.search(
            this.config.options.searchType,
            searchModel,
            1,
            '',
            'desc'
        ).subscribe(
            (resp: SlickGridResp) => {
                this.afterRequestDataLazy(resp, searchModel);
            }, (err) => {
                this.isBusyGrid = false;
                this.onGridEndSearch.emit(false);

            }, () => {
                this.isBusyGrid = false;
                this.onGridEndSearch.emit(true);
            });
    }
}
