import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {SlickGridProvider} from "../../providers/slick.grid.provider";
import { NotificationService } from '../../../../notification/services/notification.service';
import { IMFXModalProvider } from '../../../../imfx-modal/proivders/provider';
import { Observable } from 'rxjs';

@Component({
    selector: 'doaction-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
      'styles/index.scss'
    ],
    host: { 'style' : 'display: flex; height: 100%; flex-direction: column; justify-content: center;'},
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DoActionFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private provider: SlickGridProvider;
    private column: SlickGridColumn;
    private actionDelegate: DoActionDelegate;
    private titleHint;
    private data;
    private optionalIconStyle = null;


    constructor(private injector: Injector,
                protected modalProvider: IMFXModalProvider,
                private notificationRef: NotificationService) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = (<any>this.injectedData).data.columnDef;
        this.provider = this.column.__contexts.provider;
        this.data = this.column.__deps.data;
        if(this.data && this.data.titleHint) {
            this.titleHint = this.data.titleHint
        }
        if(this.data && this.data.optionalIconStyle) {
            this.optionalIconStyle = this.data.optionalIconStyle;
        }
        if(this.data && this.data.actionDelegate) {
            this.actionDelegate = this.data.actionDelegate
        }
        else {
            console.exception("missing mandatory argument DoAction formatter - '__deps.data.actionDelegate: DoActionDelegate'");
        }
    }

    doAction($event) {
        $event.stopPropagation();
        this.actionDelegate.doAction(this.params);
    }
}

export function DoActionFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(DoActionFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}

export interface DoActionDelegate {
    doAction(data: any);
}



