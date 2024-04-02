import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";



@Component({
    selector: 'folder-link-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class FolderLinkFormatterComp {
    private params;
    private column;
    private data;
    public injectedData: SlickGridFormatterData;

    private transitionFunc: Function = null;
    private compContext = null;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = this.params.columnDef;
        this.data = this.column.__deps.data;

        this.compContext = this.data.compContext || this;
        this.transitionFunc = this.data.transitionFunc && this.compContext
            ? this.data.transitionFunc.bind(this.compContext)
            : () => {};
     }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    //preprocessing the transition by reference
    goToFolder($event) {
        const UId = this.params.data.UId;
        this.transitionFunc(UId);
    }

    isEmpty(data) {
        if (data === '' || data === undefined || data === null) {
            return true;
        }
        return false;
    }
}

export function FolderLinkFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(FolderLinkFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



