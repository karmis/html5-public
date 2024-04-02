/**
 * Created by Sergey Trizna on 30.03.2018.
 */
import { Component, Injector, ViewEncapsulation } from "@angular/core";
import {
    SlickGridColumn,
    SlickGridExpandableRowData,
    SlickGridFormatterData,
    SlickGridRowData
} from "../../types";
import { SlickGridProvider } from "../../providers/slick.grid.provider";


@Component({
    selector: 'dragdrop-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DragDropFormatterComp {
    private data: SlickGridFormatterData;
    private provider: SlickGridProvider;
    private idx: number;
    private col: SlickGridColumn;
    private row: SlickGridRowData & SlickGridExpandableRowData;

    constructor(private injector: Injector) {
        this.data = this.injector.get('data').data;
        this.row = this.data.data;
        this.provider = this.data.columnDef.__contexts.provider;
        this.idx = this.provider.getDataView().getIdxById(<string>this.row.id);
    }

    ngAfterViewInit() {
        this.dotsPreparing();
    }

    onDragRowStart(ev) {
        // don't remove it. fix for ff
        ev.dataTransfer.setData('text/plain', 'anything');
        ev.dataTransfer.effectAllowed = 'move';
        this.provider.onDragRowStart(ev);
        return true;
    }

    private dotsPreparing() {
        let el = this.provider.getSlick().getCellNode(this.data.rowNumber, this.data.cellNumber);
        let $dotEl = $(el);
        $($dotEl).addClass('skipSelection');
        let ids = this.provider.getSelectedRowsIds();
        if (ids.indexOf(this.idx) > -1) {
            $dotEl.show();
        } else {
            $dotEl.hide();
        }

        this.provider.onSelectRow.subscribe((ids) => {
            let needAdd = false;
            if (ids.length > 0 && ids.indexOf(this.idx) > -1) {
                needAdd = true;
            }

            if (needAdd) {
                $dotEl.show();
            } else {
                $dotEl.hide();
            }
        });
    }

    // onDragRowEnd(ev) {
    //     debugger
    // }


    //
    // handleDragStart(e) {
    //     // debugger
    // }
    //
    // handleDragEnter(e) {
    //     this.switchHighLight(e, true);
    // }
    //
    // handleDragOver(e) {
    //     if (e.preventDefault) {
    //         e.preventDefault();
    //     }
    //
    //     e.dataTransfer.dropEffect = 'move';  // See the section on the
    // }
    //
    // handleDragLeave(e) {
    //     this.switchHighLight(e, false);
    // }
    //
    // private switchHighLight(e, state: boolean){
    //     let el = $(e.target).parents('.slick-row').find('.slick-cell');
    //     // let oEl = $(e.target).parents('.slick-row').find('.slick-cell');
    //     if(state === true){
    //         el.addClass('selected');
    //     } else {
    //         el.removeClass('selected');
    //     }
    // }
    //
    // drop(e) {
    //     debugger
    // }
}
