/**
 * Created by Sergey Trizna on 15.03.2018.
 */
import { SlickGridProvider } from "../../../../slick-grid/providers/slick.grid.provider";
import { Injectable, Injector } from "@angular/core";
import { SlickGridExpandableRowData } from "../../../../slick-grid/types";
import { DetailProvider } from "../../../providers/detail.provider";
import { BaseProvider } from '../../../../../../views/base/providers/base.provider';
import $ from 'jquery';
import { SlickGridExpandableRowDataWithDevices } from '../../../../../../views/cachemanager/providers/cm.slickgrid.provider';

@Injectable()
export class SegmentsSlickGridProvider extends SlickGridProvider {
    public rowCountForValidation: number = 0;
    public validGrid: boolean = true;
    public selectedSubRow?: { id?: number, index?: number, selectedSubRow?: number } = {};
    public expandedRows?: number[] = [];
    public baseProvider: BaseProvider;
    public isDevItemLocked: number = 1; // for disable item lock button
    private componentByID = [];

    constructor(public injector: Injector) {
        super(injector);
    }

    onRowMousedown(data) {
        let row = data.row;
        (<any>this.componentContext).config.elem.emit('setMarkers', {
            markers: [
                {time: row.SOMS},
                {time: row.EOMS}
            ],
            m_type: 'locator',
            id: row.id
        });
    }

    isValid(error) {
        this.validGrid = this.validGrid && !error;
        this.rowCountForValidation++;
        if (this.getData().length * 2 === this.rowCountForValidation) {
            (<any>this.componentContext).getValidation(this.validGrid);
        }
    }

    getTimecodeValid(id) {
        let segments = (<any>this.componentContext).config.file['Segments'];
        let valid = false;
        segments.forEach(el => {
            if (el.customId == id || el.ID == id) {
                valid = el.timecodesNotValid;
            }
        });
        return valid;
    }

    onChangedRowOrder(newDataOrdering) {
        let comp = (<any>this.componentContext);
        let segments = this.deleteUnnecessaryDataBeforeSaving(newDataOrdering);
        let index = 1;

        let temp_segments = [];
        (<any>segments).forEach((el, idx) => {
            let resId = el.ID || el.customId;
            let tmp = comp.config.file['Segments'].filter((segment, ind) => {
                return segment.ID === resId || segment.customId === resId;
            });
            if (tmp.length) {
                temp_segments = temp_segments.concat(tmp)
            }
        });
        console.log(temp_segments)
        temp_segments.forEach((el, idx) => {
            el.SQ_NUM = idx + 1;
            if (comp.segmentsTypes.filter(elem => {
                return elem.NAME == el.TYPE_text;
            }).length) {
                el.PRT_NUM = index++;
            } else {
                el.PRT_NUM = 0;
            }
        });
        comp.config.file['Segments'] = temp_segments;
        let detailProvider = this.injector.get(DetailProvider);
        let _data = this.prepareData(detailProvider._deepCopy(temp_segments), temp_segments.length);
        this.setData(_data, true);

        comp.onDataChanged.emit();
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
                // Credits ?
                // if (!item.Devices || item.Devices.length == 0) {
                //     item._disabled = true;
                // }
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
                e != item.ID;
            });

            delete this.componentByID[item.ID];
            return;
        } else {
            this.expandedRows.push(item.ID);
        }
        let content = [];
        content.push('<div class="expanded-row-detail-' + item.id + '">Loading...</div>');
        item._detailContent = content.join("");
        // Devices
        // let contentCount = (<any>item).Devices.length > 0 ? (<any>item).Devices.length + 1 : 0;
        let contentCount = 2;
        item = this.calcSize(item, contentCount);
    }


    public calcSize(item, contentCount = 1) {
        let rowHeight = this.getSlick().getOptions().rowHeight;
        let lineHeight = 30; //we know cuz we wrote the custom css init ;)
        item._sizePadding = Math.ceil((contentCount * lineHeight) / rowHeight);
        item._height = (item._sizePadding * rowHeight);

        return item;
    }

}
