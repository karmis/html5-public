import {ChangeDetectionStrategy, Component, ComponentRef, Injector, ViewEncapsulation} from "@angular/core";
import {
    SlickGridColumn,
    SlickGridFormatterData,
    SlickGridRowData,
    SlickGridTreeRowData
} from "../../types";
import { commonFormatter } from "../common.formatter";
import {appRouter} from "../../../../../constants/appRouter";
import {IMFXModalProvider} from "../../../../imfx-modal/proivders/provider";
import {DocumentModalComponent} from "../../../../controls/document.modal/document.modal.component";
import {lazyModules} from "../../../../../app.routes";

@Component({
    selector: 'preview-files-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class PreviewFilesFormatterComp {
    public injectedData: SlickGridFormatterData;
    private params;
    private previewType: PreviewType = PreviewType.None;
    private viewerConfig = {};

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.params.url = this.params.data.Url;
        if(!this.params || !this.params.data || ! this.params.data.Filename){
            return;
        }
        if (this.params.data.Filename.toLowerCase().includes(".pdf")) {
            this.previewType = PreviewType.Pdf;
        }
        else if (this.params.data.Filename.toLowerCase().includes(".xml")) {
            this.previewType = PreviewType.Xml;
            this.viewerConfig = {
                url: this.params.url,
                language: 'xml',
                onlyButton: true,
                fullSize: false
            };
        }
        else if (this.params.data.Filename.toLowerCase().includes(".png") ||
            this.params.data.Filename.toLowerCase().includes(".bmp") ||
            this.params.data.Filename.toLowerCase().includes(".jpeg") ||
            this.params.data.Filename.toLowerCase().includes(".jpg")) {
            this.previewType = PreviewType.Image;
        }
        this.params.onlyButton = true;
    }

    checkType(type) {
        if (type == 'pdf' && this.previewType == PreviewType.Pdf) {
            return true;
        }
        if (type == 'xml' && this.previewType == PreviewType.Xml) {
            return true;
        }
        else if (type == 'img' && this.previewType == PreviewType.Image) {
            return true;
        }
        return false;
    }
    openPDF() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal = modalProvider.showByPath(lazyModules.document_modal_module,
            DocumentModalComponent, {
                size: 'full-size',
                class: 'stretch-modal',
                footer: false,
            }, {url: this.params.url, fullSize: true});
        modal.load().then((comp: ComponentRef<DocumentModalComponent>) => {
        });
    }
    // getMediaUrl() {
    //     let url = this.params.data.Url;
    //     if (this.params.data.UsePresignedUrl) {
    //         let htmlPlayerService = this.injector.get(HTMLPlayerService);
    //         htmlPlayerService.getPresignedUrl(this.params.data.Id).subscribe((res: any) => {
    //             url = res;
    //         });
    //     }
    //     return url;
    // }
}

export function PreviewFilesFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(PreviewFilesFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    }); // appRouter.fake_routes.formatter.preview_file.src
}

export enum PreviewType {
    None,
    Image,
    Pdf,
    Xml
}
