import {ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import * as Cookies from "js-cookie";
import {ConfigService} from "../../../../../services/config/config.service";
import {SlickGridComponent} from "../../slick-grid";
import * as $ from "jquery";



@Component({
    selector: 'image-link-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ImageLinkFormatterComp {
    // @ViewChild('image') image: ElementRef;
    private params;
    private column;
    private data;
    public injectedData: SlickGridFormatterData;

    private url;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = this.params.columnDef;
        this.data = this.params.data.Attaches;
        this.url = ConfigService.getAppApiUrl() + '/getfile.aspx?id=';
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }
}

export function ImageLinkFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(ImageLinkFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



