/**
 * Created by Sergey Trizna on 13.01.2018.
 */
import {
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactory,
    ComponentFactoryResolver, ComponentRef,
    Inject,
    Injector
} from '@angular/core';
import {BasketService} from '../../../services/basket/basket.service';
import {Router} from '@angular/router';
import {WorkflowExpandRowComponent} from '../comps/slickgrid/formatters/expand.row/expand.row.formatter';
import {SlickGridProvider} from '../../../modules/search/slick-grid/providers/slick.grid.provider';
import {
    SlickGridColumn,
    SlickGridExpandableRowData,
    SlickGridInsideExpandRowFormatterData,
    SlickGridResp,
    SlickGridRowData
} from '../../../modules/search/slick-grid/types';
import {WorkflowComponent} from '../workflow.component';
import {SearchModel} from '../../../models/search/common/search';
import {AdvancedSearchModel} from '../../../models/search/common/advanced.search';
import {JobService} from '../services/jobs.service';
import {Observable, Subscription} from 'rxjs';
import {IMFXModalEvent} from '../../../modules/imfx-modal/types';
import {IMFXModalAlertComponent} from '../../../modules/imfx-modal/comps/alert/alert';
import {IMFXModalComponent} from '../../../modules/imfx-modal/imfx-modal';
import {IMFXModalProvider} from '../../../modules/imfx-modal/proivders/provider';
import {NotificationService} from '../../../modules/notification/services/notification.service';
import {SecurityService} from '../../../services/security/security.service';
import {BaseProvider} from '../../base/providers/base.provider';
import * as $ from 'jquery';
import {WorkflowChangeByModalComponent} from '../comps/changeby/changeby';
import {WorkflowProvider} from '../../../providers/workflow/workflow.provider';
import {lazyModules} from "../../../app.routes";
import {copyText} from "../../../utils/imfx.guid";

export class WorkflowSlickGridProvider extends SlickGridProvider {
    router?: Router;
    basketService?: BasketService;
    compFactoryResolver?: ComponentFactoryResolver;
    appRef?: ApplicationRef;
    selectedSubRow?: { id?: number, index?: number } = {};
    expandedRows?: any[] = [];
    cdr: ChangeDetectorRef;
    jobService?: JobService;
    isGridExpanded?: boolean;
    selectedTreeNodes?: any[] = [];
    modalProvider?: IMFXModalProvider;
    securityService?: SecurityService;
    baseProvider?: BaseProvider;
    workflowProvider?: WorkflowProvider;
    wfdragmode?: string;
    item?: any;
    selectedRows;
    popupMultiOpenedData: SlickGridRowData[] = null;
    popupMultiOpened = false;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.cdr = injector.get(ChangeDetectorRef);
        this.modalProvider = injector.get(IMFXModalProvider);
        this.jobService = injector.get(JobService);
        this.securityService = injector.get(SecurityService);
        this.baseProvider = injector.get(BaseProvider);
        this.workflowProvider = injector.get(WorkflowProvider);
    }

    beforeSetSelectedRow() {
        this.selectedSubRow = {};
    }

    onClickByExpandRow(item, i) {
        this.setSelectedRows([]);
        this.prevRowId = item + i + 2; // 2 - offset (next value; a space filled in by expanded header)
        this.selectedSubRow = {id: item.id, index: i};
        this.getSlick().render();
    }

    getSelectedSubRow() {
        return this.selectedSubRow;
    }

    lookupDynamicContent(item: SlickGridExpandableRowData): void {
        if (item._collapsed == true) {
            if (!this.expandedRows.length && this.isGridExpanded === true) {
                this.clearItem(item);
            } else {
                const index = this.expandedRows[this.PagerProvider.getCurrentPage()].indexOf(item.id);
                if (index > -1) {
                    this.expandedRows[this.PagerProvider.getCurrentPage()].splice(index, 1);
                }
            }
            return;
        } else {
            if (!this.expandedRows[this.PagerProvider.getCurrentPage()]) {
                this.expandedRows[this.PagerProvider.getCurrentPage()] = [];
            }
            if (this.expandedRows[this.PagerProvider.getCurrentPage()].indexOf(item.id) == -1) {
                this.expandedRows[this.PagerProvider.getCurrentPage()].push(item.id);
            }
        }
        const content = [];
        if (!item.Tasks) {
            return;
        }
        const contentCount = (item.Tasks.length);
        content.push('<div class="expanded-row-detail-' + item.id + '">Loading...</div>');
        item._detailContent = content.join('');
        const rowHeight = this.getSlick().getOptions().rowHeight;
        const lineHeight = 24; // we know cuz we wrote the custom css init ;)
        item._sizePadding = Math.ceil(((contentCount * lineHeight) / rowHeight) + 1); // + 1 cuz we are added additional row as caption of subrows
        item._height = (item._sizePadding * rowHeight);
    }

    createDetailComponent(item): void {
        const promise: Promise<ComponentFactory<any>> = this.baseProvider.createComponentByPath(
            lazyModules.wf_expand_row_module,
            WorkflowExpandRowComponent,
            [{
                provide: 'data', useValue: {
                    data: {
                        item,
                        provider: this,
                        isDD: this.config.options.module.isDraggable.enabled
                    } as SlickGridInsideExpandRowFormatterData
                }
            }]);
        promise.then((comp: ComponentFactory<any> | any) => {
            const el: any = $(this.getGridEl().nativeElement).find('div.expanded-row-detail-' + item.id);
            if (el) {
                const compView: ComponentRef<any> = this.moduleContext.vcRef.createComponent(comp);
                this.baseProvider.insertComponentIntoView(this.moduleContext.vcRef, compView, el);
            }
            // this.contentFactory = comp;
            // this._contentView = this.vcRef.createComponent(comp);
            // this.doInsertContentView(this._contentView);
            // resolve(this._contentView);
        });


        // // let self = this;
        // // prepare ang module for render
        // const factory = this.compFactoryResolver.resolveComponentFactory(WorkflowExpandRowComponent);
        // const resolvedInputs = ReflectiveInjector.resolve([{
        //     provide: 'data', useValue: {}
        // }]);
        // const injector = ReflectiveInjector.fromResolvedProviders(
        //     resolvedInputs
        // );
        // const componentRef = factory.create(injector);
        //


    }

    clearItem(item) {
        item._collapsed = true;
        item._sizePadding = 0;     // the required number of padding rows
        item._height = 0;     // the actual height in pixels of the detail field
        item._isPadding = false;
        delete item._detailContent;
        return item;
    }

    setAllExpanded(state: boolean) {
        let insertData = [];
        const dataView = this.getDataView();
        const slick = this.getSlick();
        dataView.beginUpdate();
        if (state == false) {
            insertData = dataView.getItems().slice(0);
            // dataView.setItems(insertData);
            insertData = insertData.filter((item: SlickGridExpandableRowData) => {
                return !item._isPadding;
            });

            insertData = insertData.map((item: SlickGridExpandableRowData) => {
                return this.clearItem(item);
            });

        } else {
            // let ids = this.module.data.slice(0).map((r: SlickGridRowData) => {
            //     return r.$id
            // });

            const allItems: SlickGridExpandableRowData = dataView.getItems().slice(0);

            dataView.setItems([]);
            const itms = [];
            // setTimeout(() => {
            $.each(allItems, (k, item) => {
                if (item && item.ID) {
                    item._collapsed = false;
                    this.lookupDynamicContent(item);

                    insertData.push(item);
                    for (let idx = 1; idx <= item._sizePadding; idx++) {
                        const newItem = this.getPaddingItem(item.id, idx);
                        insertData.push(newItem);
                        const key = item._additionalRows.indexOf(newItem.id);
                        if (key == -1) {
                            item._additionalRows.push(newItem.id);
                        }
                    }

                    itms.push(item);
                }
            });
        }

        slick.invalidateAllRows();
        dataView.setItems(insertData);
        dataView.endUpdate();
        slick.updateRowCount();
        slick.resizeCanvas();
    }

    onDragRowStart($event) {
        this.wfdragmode = $event ? $event.mode : null;
        this.item = $event ? $event.item : null;
    }

    navigateToPageByTask(item) {
        this.workflowProvider.navigateToPageByTask(item, this);
    }

    navigateToPage(job, i) {
        if (!this.hasPermissionByName('workflow-search')) {
            return;
        }

        if (job.Tasks.length > 0) {
            const item = job.Tasks[i];
            this.navigateToPageByTask(item);
        }
        return false;
    }

    afterRequestData(resp, searchModel) {
        // if (!(<WorkflowComponent>this.componentContext).refreshOn && !(<WorkflowComponent>this.componentContext).refreshStarted) {
        //     this.expandedRows = [];
        // }
        if (!(this.componentContext as WorkflowComponent).refreshStarted) {
            super.afterRequestData(resp, searchModel);

        } else {
            const respLength = resp.Rows ? resp.Rows : resp.Data.length;
            const data = this.prepareData(resp.Data, respLength);
            // this.originalPreparedData = data;
            if ((this.componentContext as WorkflowComponent).refreshStarted) {
                this.selectedRows = this.getSlick().getSelectedRows();
                this.setSelectedRows(this.selectedRows);
            }
            this.updateData(null, data);
            this.onGridRowsUpdated.emit(resp);
            (this.componentContext as WorkflowComponent).refreshStarted = false;
            this.resize();
        }

        if (this.isGridExpanded) {
            this.setAllExpanded(true);
        } else if (this.expandedRows[this.PagerProvider.getCurrentPage()] && this.expandedRows[this.PagerProvider.getCurrentPage()].length > 0) {
            // let expandedItems = this.expandedRows.map((row:{id: number|string, page:number}) => {
            //     if(row.page == this.PagerProvider.getCurrentPage()){
            //         return this.getDataView().getItemById(row.id);
            //     }
            // });

            $.each(this.expandedRows[this.PagerProvider.getCurrentPage()], (k, id) => {
                const row = this.getDataView().getItemById(id);
                this.expandExpandableRow(row, false);
            });
            // this.expandByItems(expandedItems)
        }
    }

    buildPage(searchModel: SearchModel, resetSearch: boolean = false, withOverlays: boolean = true) {
        // if ((this.componentContext as WorkflowComponent).isOpenedSchedule) {
            this.fillSchedule(searchModel);
        // }

        if (resetSearch === true) {
            this.expandedRows = [];
        }
        super.buildPage(searchModel, resetSearch, withOverlays);
    }

    fillSchedule(searchModel: SearchModel) {
        searchModel.setAdvanced(searchModel.removeAdvancedItemByDBField('SCHEDULE'));
        const ids = [];
        const asm = new AdvancedSearchModel();
        asm.setDBField('SCHEDULE');
        asm.setField('Schedule');
        asm.setOperation('=');
        this.selectedTreeNodes = (this.componentContext as WorkflowComponent).ddUser.tree.getSelected();
        const selectedNodes = this.selectedTreeNodes;
        if (selectedNodes && selectedNodes.length > 0) {
            $.each(selectedNodes, (k, node) => {
                const dirtyData = node.data.dirtyObj;
                const id = dirtyData.NodeType == 'User' ? dirtyData.Id * (-1) : dirtyData.Id;
                ids.push(id);
            });
            asm.setValue(ids);
            searchModel.addAdvancedItem(asm);
        }
    }

    refreshGridLazy(ids: number[] = []) {
        if (!this.lastSearchModel) {
            return;
        }

        const param = Array.isArray(ids)
            ? ids
            : (isNaN(ids - 0) || !(ids - 0))
                ? []
                : [ids];
        this.buildPageLazy(param);
        (this.componentContext as any).refreshStarted = true;
    }

    buildPageLazy(ids: number[]) {
        let updateIds,
            searchModel: SearchModel = new SearchModel();

        if (Array.isArray(ids) && ids.length != 0) {
            updateIds = ids;
        } else {
            const subRow = this.getSelectedSubRow();
            const selRows = this.getSelectedRows();

            if (selRows.length) {
                updateIds = selRows.map((e) => e.ID);
            } else if (subRow && subRow.hasOwnProperty('id')) {
                updateIds = [this.getDataView().getItemById(subRow.id).ID];
            }
        }

        if (updateIds && updateIds.length > 0) {
            for (const item of updateIds) {
                const asm_id = new AdvancedSearchModel();

                asm_id.setDBField('ID');
                asm_id.setField('Id');
                asm_id.setOperation('=');
                asm_id.setValue(item);
                asm_id.setGroupId(searchModel.getNextAvailableGroupId());
                if (!searchModel.hasAdvancedItem(asm_id)) {
                    searchModel.addAdvancedItem(asm_id);
                }
            }
        }

        this._buildPageRequestLazy(searchModel);
    }

    afterRequestDataLazy(resp, searchModel) {
        // console.log('WF_afterRequestData_Lazy');
        const mergedRespData = this.getMergeOriginalData(resp.Data);
        // let respLength = Object.keys(mergedRespData).length;
        this.setOriginalData(mergedRespData);
        this.selectedRows = this.getSlick().getSelectedRows();
        this.setSelectedRows(this.selectedRows);
        // }

        // toDo get Array<AdvancedSearchModel> method for SearchModel
        const refreshIds = searchModel.getAdvanced()
            .filter((e) => e.getDBField() == 'ID' && e.getOperation() == '=')
            .map((e) => e._value);

        const md = (this.getData() as any[]).map((e) => e.ID);
        const refreshIndexes = refreshIds.map((e) => md.indexOf(e));

        const data = this.getMergeDataviewData(resp.Data);
        // this.updateData(this.selectedRows, data);
        this.updateData(refreshIndexes, data);
        // this.onGridRowsUpdated.emit(resp);
        (this.componentContext as WorkflowComponent).refreshStarted = false;

        // this.reopenWfDecisionTask(); // TODO clarify

    }

    reopenWfDecisionTask() {
        let task;
        const subRow = this.getSelectedSubRow();
        const selRows = this.getSelectedRows();

        if (selRows.length == 1) {
            task = selRows[0];
        } else if (subRow
            && subRow.hasOwnProperty('id')
        ) {
            task = this.getDataView().getItemById(subRow.id).Tasks[subRow.index];
        }

        if (task && task.TSK_TYPE == 57) {
            this.navigateToPageByTask(task);
        }
    }

    deleteFromServer(data): Observable<Subscription> {
        return this.jobService.delete(data.data.ID);
    }

    isDeleteEnabled() {
        return true;
    }

    delete($event) {
        const self = this;
        const rowData = this.getSelectedRowData();
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            const modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'workflow.modal_remove_conformation',
                {jobName: rowData['CMB_IN_TTLS_text'] + '  ( ID - ' + rowData['ID'] + ' )'}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    self.jobService.delete(rowData.ID).subscribe(() => {
                        if (self.config.options.module.isExpandable.enabled) {
                            self.removeExpandableRows(rowData, rowData._additionalRows);
                        }
                        self.deleteRow({data: {data: rowData}});

                        self.notificationService.notifyShow(1, 'workflow.remove_success');
                        modal.hide();
                    }, (err) => {
                        this.notificationService.notifyShow(2, 'common.error');
                    }, () => {

                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    //
    deleteMulti() {
        const rowsData = this.getSelectedRows().filter(row => row['CMB_IN_TTLS_text'] && row['ID'] !== undefined);
        let confrimText = '';
        const deleteIds = [];
        rowsData.forEach((row) => {
            confrimText += row['CMB_IN_TTLS_text'] + ' (ID - ' + row['ID'] + '), ';
            deleteIds.push(row['ID']);
        });
        confrimText = confrimText.slice(0, confrimText.length - 2);
        const self = this;
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            const modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'workflow.modal_remove_conformation_multi',
                {textParam: confrimText}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    self.jobService.deleteMulti(deleteIds).subscribe(() => {
                        if (self.config.options.module.isExpandable.enabled) {
                            rowsData.forEach((row: SlickGridExpandableRowData) => {
                                self.removeExpandableRows(row, row._additionalRows);
                            });
                        }
                        rowsData.forEach((row) => {
                            self.deleteRow({data: {data: row}});
                        });
                        self.setSelectedRow(0);
                        self.notificationService.notifyShow(1, 'workflow.remove_success');
                        modal.hide();
                    }, (err) => {
                        this.notificationService.notifyShow(2, 'common.error');
                    }, () => {

                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });

        })
    }

    openPopups($event) {
        const selectedRows = this.getSelectedRows();
        const btnEl = $($event.target);

        if (selectedRows.length > 1) {
            if (!this.popupMultiOpened) {
                if (!this.module.popupsSelectors) {
                    return;
                }
                const opts = this.module.popupsSelectors[btnEl.data('popupid')];
                if (!opts) {
                    this.hidePopups();
                    return false;
                }

                const offset = btnEl.offset() as any;
                offset.top = offset.top + 4 + (btnEl.height() as any);
                offset.left = offset.left + (btnEl.width() as any);

                $(opts.popupMultiEl).show();
                $(opts.popupMultiEl).offset(offset);

                const outOfconfines = $(window).height() - $(opts.popupMultiEl).children().height() - offset.top - 15;
                if (outOfconfines < 0) {
                    offset.top = offset.top + outOfconfines;
                }
                $(opts.popupMultiEl).offset(offset);
                this.popupMultiOpenedData = selectedRows;
                this.popupMultiOpened = true;
            } else {
                this.hidePopups();
            }
        } else {
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
    }

    hidePopups() {
        this.popupOpened = false;
        this.popupOpenedId = null;
        this.popupMultiOpened = false;
        this.popupMultiOpenedData = null;
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

    markResolved($event) {
        const self = this;
        const rowsData = this.getSelectedRowsData()
            .filter((e) => e.CMB_STAT == 19 && e.J_FAILURE_RESOLVED == false)
            .map((e) => ({ID: e.ID, Title: e.CMB_IN_TTLS_text}))
            , rowsIds = rowsData.map((e) => e.ID);
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });

        modal.load().then(cr =>{
            const modalContent: IMFXModalAlertComponent = cr.instance;

            let textParam = ''
                , text = '';
            if (rowsData.length == 1) {
                text = 'workflow.mark_resolved.modal_confirmation_1';
                textParam = `${rowsData[0].Title} (ID - ${rowsData[0].ID} )`;
            } else if (rowsData.length > 1 && rowsData.length < 5) {
                text = 'workflow.mark_resolved.modal_confirmation_less_5';
                for (const item of rowsData) {
                    textParam += `&#13;${item.Title} (ID - ${item.ID} )`;
                }

            } else if (rowsData.length >= 5) {
                text = 'workflow.mark_resolved.modal_confirmation_more_5';
                textParam = rowsData.length + '';
            }

            modalContent.setText(
                text,
                {textParam}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    self.jobService.markResolved(rowsIds).subscribe(
                        () => {
                            self.refreshGridLazy(rowsIds);
                            self.notificationService.notifyShow(1,
                                (rowsData.length == 1)
                                    ? 'workflow.mark_resolved.success_1'
                                    : 'workflow.mark_resolved.success_many');
                            modal.hide();
                        }, (err) => {
                            self.notificationService.notifyShow(2, 'workflow.mark_resolved.error');
                            modal.hide();
                        }, () => {

                        });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    isMarkResolvedEnabled() {
        const sd = this.getSelectedRowsData(),
            isAllFailed = sd.every((e) => e && e.CMB_STAT == 19),
            isExistToResolve = !sd.every((e) => e.J_FAILURE_RESOLVED == true);

        return isAllFailed && isExistToResolve;
    }

    isNothingToResolve() {
        return (this.getSelectedRows() as any).some((e) => !e || e.CMB_STAT != 19);
    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).parent().parent().parent().hasClass('selected') ||
            $(event.target).parent().parent().hasClass('selected');
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    changeCompletedDate(multi: boolean = false) {
        const modalProvider = this.injector.get(IMFXModalProvider);
        const ids = multi ? this.getSelectedRows().map((item: any) => {
            return item.ID;
        }) : [this.getSelectedRow().ID];
        const modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_changeby,
            WorkflowChangeByModalComponent, {
                size: 'sm',
                title: 'changeby.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {
                jobs: ids,
                provider: this
            });
        modal.load().then(() => {
        });
    }

    issetColumns() {
        const cols = this.getActualColumns();
        const regularCols = cols.filter((c: SlickGridColumn) => {
            return c.id > -1;
        });

        if (regularCols.length) {
            return true;
        }

        return false;
    }

    issetData(): boolean {
        if (this.getData().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    copy(collName) {
        copyText(this.getSelectedRow()[collName]);
    }

    private _buildPageRequestLazy(searchModel: SearchModel) {
        // this.isBusyGrid = true;
        // this.searchFormProvider.lockForm();
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
                // this.isBusyGrid = false;
                // this.searchFormProvider.unlockForm();
                this.onGridEndSearch.emit(false);

            }, () => {
                // this.isBusyGrid = false;
                // this.searchFormProvider.unlockForm();
                this.onGridEndSearch.emit(true);
                // this.searchFormProvider && this.searchFormProvider.unlockForm();
            });
    }
}
