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
    selector: 'drop-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DropFormatterComp {
    private data: SlickGridFormatterData;
    private provider: SlickGridProvider;
    private idx: number;
    private col: SlickGridColumn;
    private row: SlickGridRowData & SlickGridExpandableRowData;
    private bindList: any[] = [];
    private cellList: any[] = [];
    private rowEl: any;

    constructor(private injector: Injector) {
        this.data = this.injector.get('data').data;
        this.row = this.data.data;
        this.provider = this.data.columnDef.__contexts.provider;
        this.idx = this.provider.getDataView().getIdxById(<string>this.row.id);
    }

    ngAfterViewInit() {
        this.bindEvents();
    }

    private onEnter(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        this.switchHighLight(true);
    }

    private onOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        e.dataTransfer.dropEffect = 'move';

        this.switchHighLight(true);
    }

    private onLeave(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        this.switchHighLight(false);
    }

    private onDrop(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        this.provider.onDropToGrid.emit({data: <SlickGridFormatterData>this.data, event: e});
        this.switchHighLight(false);
    }

    private bindEvents() {
        let $grid = $(this.provider.getGridEl().nativeElement);
        let leftEl = $grid.find('.slick-viewport-left .slick-row').get(this.data.rowNumber);
        let rightEl = this.rowEl = $grid.find('.slick-viewport-right .slick-row').get(this.data.rowNumber);
        if (leftEl) {
            this.bindList.push(leftEl);
        }

        if (rightEl) {
            this.bindList.push(rightEl);
        }

        [].forEach.call(this.bindList, (col) => {
            const $col = $(col);
            $col.unbind('dragover').bind('dragover', (e) => {
                this.onOver(e.originalEvent);
            });
            $col.unbind('dragenter').bind('dragenter', (e) => {
                this.onEnter(e.originalEvent);
            });
            $col.unbind('dragleave').bind('dragleave', (e) => {
                this.onLeave(e.originalEvent);
            });
            $col.unbind('drop').bind('drop', (e) => {
                this.onDrop(e.originalEvent);
            });
        });

        this.bindList.forEach((rowEl) => {
            $(rowEl).find('.slick-cell').each((i, cellEl) => {
                // if(cellEl.tagName == 'DIV'){
                this.cellList.push(cellEl);
                // }
            });
        });
    }

    private switchHighLight(state: boolean) {
        if (state === true) {
            $(this.cellList).addClass('selected');
        } else {
            $(this.cellList).removeClass('selected');
        }
    }
}
