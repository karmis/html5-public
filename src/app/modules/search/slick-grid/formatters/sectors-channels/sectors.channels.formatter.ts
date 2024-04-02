/**
 * Created by IvanBanan 26.06.2019.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewEncapsulation } from "@angular/core";
import { SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData } from "../../types";
import { commonFormatter } from "../common.formatter";
import { SlickGridProvider } from "../../providers/slick.grid.provider";
import * as $ from "jquery";
import { SectorsChannelsDictionary } from './constants/sectors.channels.dictionary';
import { ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'sectors-channels-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
      'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SectorsChannelsFormatterComp {
    @ViewChild('tooltip', {static: false}) private tooltip;
    @ViewChild('field', {static: false}) private field;
    private params;
    public injectedData: SlickGridFormatterData;
    private provider: SlickGridProvider;
    private componentContext: any;
    private column: SlickGridColumn;
    private destroyed$: Subject<any> = new Subject();
    private data;
    private visibleFlag: boolean = false;
    private values: any[] = []; //set of available values
    private selectedValue: any[] = [];
    private inLine; //item count in line of tooltip
    private chPrefix;
    private isNumber = true;
    private mediaType;
    private locked; //to lock edit



    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = (<any>this.injectedData).data.columnDef;
        this.provider = this.column.__contexts.provider;
        this.componentContext = (this.provider.componentContext);

        // this.mediaType = this.componentContext.config.file['MEDIA_TYPE'];
        this.mediaType = this.params.data['TypeName'];
        this.locked = !this.params.data['TypeName'];

        if (this.locked) {
            return;
        }

        this.selectedValue = this.params.data['SECTORS'] && this.params.data['SECTORS'].split(',') || [];
        this.values = (this.mediaType == 'V')
            ? SectorsChannelsDictionary.videoChannels
            : (this.mediaType == 'A')
                ? SectorsChannelsDictionary.audioChannels
                : SectorsChannelsDictionary.audioChannels_2;
        this.isNumber = (this.mediaType == 'A');
        this.inLine = (this.values.length > 9) ? 4 : 3;
        this.chPrefix = this.isNumber ? 'Ch ' : '';

        if (!this.checkMatchingValType(this.selectedValue)) {
            this.selectedValue = [];
            this.sectorsValueChanged();
        }
    }

    checkMatchingValType(values) {
        return values.every(el => this.values.indexOf(el) > -1)
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onClickField($event) {
        if (this.locked) {
            return;
        }

        this.visibleFlag = true;

        let self = this;
        let sub;

        let cb = function f(ev) {
            if ($event.target == ev.target
                || $event.target.parentElement.contains(ev.target)) {
                ev.stopPropagation();
                return;
            }
            if (self.destroyed$.isStopped) {
                document.removeEventListener('click', f);
                sub.unsubscribe();
                return;
            }
            self.visibleFlag = false;
            self.cdr.detectChanges();
            document.removeEventListener('click', f);
            sub.unsubscribe();
        };

        document.addEventListener('click', cb);
        sub = this.provider.onScrollGrid.subscribe(cb);

        this.replaceTooltip();
    }


    replaceTooltip() {
        this.cdr.detectChanges(); // do visible tooltip
        let cont = this.provider.getGridWrapperEl().nativeElement //must be relative
            , tooltip = this.tooltip.nativeElement
            , field = this.field.nativeElement;

        let offset_c = cont.getBoundingClientRect()
            , offset_f = field.getBoundingClientRect();

        let nesOffset = (offset_f.top + field.offsetHeight + tooltip.offsetHeight) - (offset_c.top + cont.clientHeight);

        if (nesOffset < 0) {
            nesOffset = 0
        }

        cont.append(tooltip);
        tooltip.style.top = offset_f.top - offset_c.top + field.offsetHeight - nesOffset + 'px';
        tooltip.style.left = offset_f.left - offset_c.left + 'px';
    }

    onMouseDownTooltip($event) {
        //cancel event emitting on slickGrid onRowMouseDown
        $event.stopPropagation();
    }

    onclickTooltip($event) {
        //cancel event emitting on document click (onClickField closing cb)
        $event.stopPropagation();
    }

    onClickTootlipItem($event, item) {
        let index = this.selectedValue.indexOf(item);
        if (index > -1) {
            this.selectedValue.splice(index, 1);
        } else {
            this.selectedValue.push(item);
            if (this.isNumber) {
                this.selectedValue = this.selectedValue.sort((el1, el2) => el1 - el2);
            }
        }

        this.sectorsValueChanged();
    }

    selectAll($event) {
        if (this.selectedValue.length == this.values.length) {
            this.selectedValue = [];
        } else {
            this.selectedValue = $.extend(true, [], this.values);
        }

        this.sectorsValueChanged();
    }

    sectorsValueChanged () {
        this.componentContext.onSectorsValueChanged.emit({
            data: this.selectedValue.join(','),
            ID: this.params.data.ID
        });
    }

}

export function SectorsChannelsFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(SectorsChannelsFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



