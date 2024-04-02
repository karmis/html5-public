import { ComponentRef, Inject, Injectable, Injector } from '@angular/core';
import { SearchModel } from '../../../../../../models/search/common/search';
import { SlickGridEventData, SlickGridResp } from '../../../../slick-grid/types';
import { AdvancedSearchModel } from '../../../../../../models/search/common/advanced.search';
import { WorkflowComponent } from '../../../../../../views/workflow/workflow.component';
import { IMFXModalProvider } from '../../../../../imfx-modal/proivders/provider';
import { NotificationService } from '../../../../../notification/services/notification.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { ProductionService } from '../../../../../../services/production/production.service';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { IMFXModalComponent } from '../../../../../imfx-modal/imfx-modal';
import { lazyModules } from '../../../../../../app.routes';
import { IMFXModalEvent } from '../../../../../imfx-modal/types';
import { MakeItemsModalComponent } from '../comps/make.items.modal/make.items.modal.component';
import { ProductionDetailProvider } from "../../../../../../views/detail/production/providers/production.detail.provider";
import {ItemTypes} from "../../../../../controls/html.player/item.types";
import {NativeNavigatorProvider} from "../../../../../../providers/common/native.navigator.provider";
import {appRouter} from "../../../../../../constants/appRouter";
import { PRODUCTION_TEMPLATE_CONFIG } from '../../../../../../views/detail/production/constants';
import $ from "jquery";

@Injectable()
export class ProductionListTabSlickGridProvider extends SlickGridProvider {
    selectedSubRow?: { id?: number, index?: number } = {};
    productionService: ProductionService;
    productionDetailProvider: ProductionDetailProvider;
    nativeNavigatorProvider: NativeNavigatorProvider;
    selectedRows = [];
    lastClickedRow = null;
    updateCheckbox: Subject<any> = new Subject<any>();
    cavMulti = {
        selectedRows: [],
        lastSelected: null
    }
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.productionService = injector.get(ProductionService);
        this.productionDetailProvider = injector.get(ProductionDetailProvider);
        this.nativeNavigatorProvider = injector.get(NativeNavigatorProvider);
    }

    onRowDoubleClicked(data) {
        switch (this.productionDetailProvider.templateConfig.ConfigTypeText.toLocaleLowerCase()) {
            case PRODUCTION_TEMPLATE_CONFIG.VERSIONS:
            case PRODUCTION_TEMPLATE_CONFIG.EVENTS:
                if ((data.row as any).ITEM.TITLE_MEDIA_ID) {
                    this.router.navigate([
                        appRouter.versions.detail.split(':')[0],
                        (data.row as any).ITEM.TITLE_MEDIA_ID,
                    ]);
                } else {
                    this.notificationService.notifyShow(2, 'Version not found',true, 360);
                }
                break
            default:
                return
        }
    }

    protected calc_slick_onMouseDown() {
        const self = this
            , cbVars = self._cbVars;

        const handleFunction = (row, event, eventData) => {
            if (this.productionDetailProvider.templateConfig.ConfigTypeText.toLocaleLowerCase() === PRODUCTION_TEMPLATE_CONFIG.VERSIONS) { // multi
                // @ts-ignore
                const rowData = this.getData().find(el => el.id === row);
                // console.log(rowData, this.lastClickedRow);
                if (cbVars.isShiftPressed || event.shiftKey) {// shift
                    if (this.lastClickedRow !== null && this.lastClickedRow.STATUS_TEXT !== rowData.STATUS_TEXT) {
                        return
                    }

                    if (cbVars.firstElementShifter == null) {
                        cbVars.firstElementShifter = this._selectedRowsIds.length > 0 ? this._selectedRowsIds[0] : null;
                    }
                    if (cbVars.firstElementShifter === null) {
                        cbVars.firstElementShifter = eventData.row;
                    } else {
                        cbVars.lastElementShifter = eventData.row;
                        let selectedRows = this.getRowsBetweenIds(cbVars.firstElementShifter, cbVars.lastElementShifter);
                        selectedRows = selectedRows.filter(el => el.STATUS_TEXT === this.lastClickedRow.STATUS_TEXT)
                        const _selectedRowsIds = this.getIdsByItems(selectedRows);
                        this._selectedRowsIds = $.extend(this._selectedRowsIds, _selectedRowsIds);
                        this.setSelectedRows(this._selectedRowsIds);
                    }
                } else if (cbVars.isCtrlPressed || event.ctrlKey || event.metaKey) { // ctrl or cmd
                    if (this.lastClickedRow !== null && this.lastClickedRow.STATUS_TEXT !== rowData.STATUS_TEXT) {
                        return
                    }

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
                this.lastClickedRow = rowData;
            } else if($(event.target).hasClass('multi-selected')) { // multi select for Clear and Versions
                this.setSelectedRow(row, eventData);
            } else  {
                this.setSelectedRow(row, eventData);
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

    setMultiSelected({data, status}) {
        const rowData = data.data;
        const dataOld = this.getData();

        dataOld.forEach(el => {
            if (data.data.id === el.id) {
                el.MULTI.IS_SELECTED = status;
            }
        });

        if (status) {
            this.cavMulti.selectedRows.push(rowData)

            if (this.cavMulti.lastSelected === null) { // disable all items with unequal statuses
                dataOld.forEach(el => {
                    if (data.data.STATUS_TEXT !== el.STATUS_TEXT) {
                        el.MULTI.IS_DISABLED = true;
                    }
                })
            }
            this.cavMulti.lastSelected = rowData;

        } else {

            this.cavMulti.selectedRows = this.cavMulti.selectedRows.filter(el => el.id !== rowData.id)
            if (this.cavMulti.selectedRows.length === 0) {
                dataOld.forEach(el => {
                    el.MULTI.IS_DISABLED = false;
                    el.MULTI.IS_SELECTED = false;
                })
                this.cavMulti.lastSelected = null;
            }

        }

        console.log(data, status);
        this.updateCheckbox.next();
        this.productionDetailProvider.makeMultiSelected.next(this.cavMulti.selectedRows)
    }

    isMultiSelected(data) {
        return true
    }

    resetCAVMulti() {
        const dataOld = this.getData();
        dataOld.forEach(el => {
            el.MULTI.IS_DISABLED = false;
            el.MULTI.IS_SELECTED = false;
        })
        this.cavMulti.lastSelected = null;
        this.cavMulti.selectedRows = [];
        this.productionDetailProvider.makeMultiSelected.next([]);
        this.updateCheckbox.next();
    }

    onRowMouseclick(data) {
        if ($(data.event.target).hasClass('multi-selected')) {
            return
        }
        if (this.cavMulti.lastSelected !== null) {
            this.resetCAVMulti();
        }
    }

    addNewMakeItem(type: "version" | "master", form: any) {
        this.productionDetailProvider.addMakeItem(type, form, this.getSelectedRowData());
    }

    deleteFromServer(data): Observable<Subscription> {
        return this.productionService.removeProduction(data.data.ID);
    }

    private updateTable(message) {
        this._buildPageRequestLazy(new SearchModel(), message);
        (this.componentContext as any).refreshStarted = true;
    }

    private refreshGridLazy(ids: number[] = [], message) {
        let updateIds,
            searchModel: SearchModel = new SearchModel();

        if (Array.isArray(ids) && ids.length != 0) {
            updateIds = ids;
        } else {
            if (this.getSelectedRows().length) {
                updateIds = this.getSelectedRows().map((e) => e.ID);
            } else if (this.getSelectedSubRow() && this.getSelectedSubRow().hasOwnProperty('id')) {
                updateIds = [this.getDataView().getItemById(this.getSelectedSubRow().id).ID];
            }

        }

        if (updateIds && updateIds.length > 0) {
            const asm_id = new AdvancedSearchModel();

            asm_id.setDBField('ID');
            asm_id.setField('Id');
            asm_id.setOperation('=');
            asm_id.setValue(updateIds.join('|'));
            asm_id.setGroupId(searchModel.getNextAvailableGroupId());
            if (!searchModel.hasAdvancedItem(asm_id)) {
                searchModel.addAdvancedItem(asm_id);
            }

        }

        this._buildPageRequestLazy(searchModel, message);
        (this.componentContext as any).refreshStarted = true;
    }

    private getSelectedSubRow() {
        return this.selectedSubRow;
    }

    private _buildPageRequestLazy(searchModel: SearchModel, message) {
        this.onGridStartSearch.emit();

        this.service.search(
            this.config.options.searchType,
            searchModel,
            1,
            '',
            'desc'
        ).subscribe(
            (resp: SlickGridResp) => {
                this.afterRequestDataLazy(resp, searchModel, message);
            }, (err) => {
                this.onGridEndSearch.emit(false);

            }, () => {
                this.onGridEndSearch.emit(true);
            });
    }

    private afterRequestDataLazy(resp, searchModel, message = null) {
        this.selectedRows = this.getSlick().getSelectedRows();
        this.setSelectedRows(this.selectedRows);

        this.selectedRows.forEach((indexRow, i) => {
            resp.Data[i].Id = indexRow;
            this.getDataView().changeItem(indexRow, resp.Data[i]);
        });

        const data = this.getMergeDataviewData([]);
        this.setOriginalData(data);
        this.updateData(this.selectedRows, data);
        (this.componentContext as WorkflowComponent).refreshStarted = false;
        if (message) {
            this.notificationService.notifyShow(message.type, message.message, message.autoClose);
        }
    }

    private goToMediaClipEditor() {
        if(this.getSelectedRows().length) {
            this.showOverlay();
            let versionId = this.getSelectedRows().map((e) => e.ID)[0];
            this.productionService.getMediaByVersionId(versionId).subscribe((resp: any) => {
                if(resp.Data.length == 0){
                    this.notificationService.notifyShow(2, 'There is no media for RCE!'); //todo translates
                    this.hideOverlay();
                } else {
                    let mediaIds = [];
                    resp.Data.forEach((media, idx) => {
                        let clipEditorEnabled = this.clipEditorEnabledForMedia(media);
                        if (clipEditorEnabled) {
                            mediaIds.push(media.ID);
                        }
                    });
                    if (mediaIds.length == 0) {
                        this.notificationService.notifyShow(2, 'There is no media for RCE!');//todo translates
                        this.hideOverlay();
                    } else {
                        this.router.navigate(
                            [
                                appRouter.clip_editor_media.substr(
                                    0,
                                    appRouter.clip_editor_media.lastIndexOf('/')
                                ),
                                mediaIds.join(',')
                            ]
                        );
                    }
                }
            }, (err) => {
                this.hideOverlay();
            });
        }
    }

    clipEditorEnabledForMedia(media) {
        let playable = false;
        if (media &&
            media["PROXY_URL"] &&
            media["PROXY_URL"].length > 0 &&
            media["PROXY_URL"].match(/^(http|https):\/\//g) &&
            media["PROXY_URL"].match(/^(http|https):\/\//g).length > 0 &&
            (media["MEDIA_TYPE"] == ItemTypes.AUDIO || media["MEDIA_TYPE"] == ItemTypes.MEDIA)) {
            playable = true;
        }
        if (media.UsePresignedUrl) { // use for Presigned Url
            playable = true;
        }

        const isEdge = this.nativeNavigatorProvider.isEdge();
        if (media && media["MEDIA_FORMAT_text"] == "WEBM" && isEdge) {
            playable = false;
        }
        return playable;
    }
}
