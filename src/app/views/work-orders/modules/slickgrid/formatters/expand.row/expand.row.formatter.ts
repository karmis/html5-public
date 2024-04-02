/**
 * Created by Sergey Trizna on 17.01.2018.
 */

import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    Injector,
    ViewEncapsulation
} from "@angular/core";
import {
    SlickGridExpandableRowData,
    SlickGridInsideExpandRowFormatterData
} from "../../../../../../modules/search/slick-grid/types";
import * as $ from "jquery";
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
    selector: 'work-orders-grid-rows-cell-detail-component',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [

    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrdersExpandRowComponent {
    public injectedData: {
        data: SlickGridInsideExpandRowFormatterData
    };
    protected rowItem: SlickGridExpandableRowData;
    protected provider: any;
    protected Items: any;
    private popupOpened: boolean = false;
    private popupOpenedId: string;
    private popupSelector: string = '.workOrdersSettingsPopup';
    private childId: number;
    private destroyed$: Subject<any> = new Subject();

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.rowItem = this.injectedData.data.item;
        this.Items = this.rowItem.Items;
        this.provider = this.injectedData.data.provider;

        fromEvent(document, 'click')
            .pipe(
                takeUntil(this.destroyed$)
            )
            .subscribe(() => {
            this.hidePopups();
        })
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onClick(item, i) {
        this.provider.onClickByExpandRow(item, i);
    }

    onDoubleClick(item, i) {
        this.provider.navigateToPage(item, i);
    }

    checkValue(val) {
        if (val === undefined || val === null || ((typeof val == 'number') && isNaN(val))) {
            return '-';
        }
        return val;
    }

    openPopups($event) {
        let btnEl = $($event.target);
        if (!this.popupOpened || (btnEl.data('rowid') != null && btnEl.data('rowid') != this.popupOpenedId)) {
            this.provider.hidePopups();
            let offset = <any>btnEl.offset();
            offset.top = offset.top + 4;
            offset.left = offset.left;
            let sel = $('work-orders').find(this.popupSelector);
            $(sel).css(offset);
            $(sel).show();
            $(sel).data('parentid', this.rowItem.ID);
            $(sel).data('childid', btnEl.data('childid'));

            let outOfconfines = $(window).height() - $(this.popupSelector).children().height() - offset.top - 15;
            if (outOfconfines < 0) {
                offset.top = offset.top + outOfconfines;
            }
            $(sel).css(offset);
            this.popupOpened = true;
            this.childId = btnEl.data('childid');
            this.popupOpenedId = btnEl.data('rowid');
        } else {
            this.hidePopups();
        }

        $event.preventDefault();
        $event.stopPropagation();
        return false;
    }

    hidePopups() {
        this.popupOpened = false;
        this.popupOpenedId = null;
        let sel = $('work-orders').find(this.popupSelector);
        $(sel).hide();
        return;
    }

    getClass(item) {
        // switch (item.TSK_STATUS) {
        //     case JobStatuses.READY:
        //         return 'ready';
        //     case JobStatuses.FAILED:
        //         return 'failed';
        //     case JobStatuses.ABORT:
        //         return 'failed';
        //     case JobStatuses.INPROG:
        //         return 'inprogress';
        //     case JobStatuses.COMPLETED:
        //         return 'completed';
        //     default:
        //         return '';
        // }
    }

    checkIcon(item) {
        // if (item.TSK_TYPE === 1) {
        //     let subtype = item.TECH_REPORT_SUBTYPE ? item.TECH_REPORT_SUBTYPE : item.TechReportSubtype;
        //     switch (subtype) {
        //         case "subtitleassess":
        //             return true;
        //         case "simpleassess":
        //             return true;
        //     }
        //     return false;
        // }
        // else if (item.TSK_TYPE === 62) { // media logger
        //     return true;
        // }
        // else if (item.TSK_TYPE === 57 && item.SUBTYPE === 'Manual') {
        //     return true;
        // }
        // else if (item.TSK_TYPE === 57 && item.SUBTYPE === 'Auto') {
        //     return true;
        // }
        return false;
    }

    // showInfo($event, task?) {
    //
    // }
}

