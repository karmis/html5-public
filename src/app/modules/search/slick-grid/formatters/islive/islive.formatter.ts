/**
 * Created by Sergey Trizna on 9.12.2017.
 */

import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import { NativeNavigatorProvider } from '../../../../../providers/common/native.navigator.provider';


@Component({
    selector: 'islive-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class IsLiveFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private isLive:string;
    private isVideo: boolean = false;
    private playable: boolean = true;
    constructor(private injector: Injector,
                private nativeNavigatorProvider: NativeNavigatorProvider) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngOnInit() {
        if (this.params.data && this.params.data['PROXY_URL'] && this.params.data['PROXY_URL'].length > 0 && this.params.data['PROXY_URL'].match(/^(http|https):\/\//g) && this.params.data['PROXY_URL'].match(/^(http|https):\/\//g).length > 0) {
            this.playable = true;
        }
        const isEdge = this.nativeNavigatorProvider.isEdge();
        if (this.params.data && this.params.data['MEDIA_FORMAT_text'] == 'WEBM' && isEdge)  {
            this.playable = false;
        }

        if (this.params.data && (this.params.data['MediaTypeOriginal'] === 100 || this.params.data['MediaTypeOriginal'] === 150)) {
            this.isVideo = true;
        }
    }

    ngAfterViewInit() {
    }

}

export function IsLiveFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(IsLiveFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



