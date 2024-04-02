import {ChangeDetectionStrategy, Component, ComponentRef, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {HTMLPlayerService} from "../../../../controls/html.player/services/html.player.service";
import {IMFXModalProvider} from "../../../../imfx-modal/proivders/provider";
import {DocumentModalComponent} from "../../../../controls/document.modal/document.modal.component";
import {appRouter} from "../../../../../constants/appRouter";
import {lazyModules} from "../../../../../app.routes";

@Component({
    selector: 'doc-viewer-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DocViewerFormatterComp {
    public injectedData: SlickGridFormatterData;
    private params;
    private viewerConfig: any;
    private mediaType: string;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngOnInit() {
        let fileExtension = this.params.data.ReportName.match(/\.[0-9A-Za-z]+$/g);
        switch (fileExtension && fileExtension.length > 0 && fileExtension[0].toLocaleLowerCase()) {
            case '.pdf': {
                this.mediaType = 'pdfViewer';
                this.viewerConfig = {
                    url: this.getMediaUrl(),
                    onlyButton: true
                };
                break;
            }
            case '.xml': {
                this.mediaType = 'xmlViewer';
                this.viewerConfig = {
                    url: this.getMediaUrl(),
                    language: 'xml',
                    onlyButton: true,
                    fullSize: false
                };
                break;
            }
            default: {
                this.viewerConfig = {
                    // url: 'https://www.catster.com/wp-content/uploads/2018/04/Angry-cat-sound-and-body-language.jpg',
                    url: this.getMediaUrl(),
                };
                this.mediaType = 'downloadFileViewer';
                break;
            }
        }
    }

    getMediaUrl() {
        let url = this.params.data.Url;
        if (this.params.data.UsePresignedUrl) {
            let htmlPlayerService = this.injector.get(HTMLPlayerService);
            htmlPlayerService.getPresignedUrl(this.params.data.Id).subscribe((res: any) => {
                url = res;
            });
        }
        return url;
    }
    openPDF() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal = modalProvider.showByPath(lazyModules.document_modal_module,
            DocumentModalComponent, {
                size: 'full-size',
                class: 'stretch-modal',
                footer: false,
            }, {url: this.viewerConfig.url, fullSize: true, onlyButton: true});
        modal.load().then((comp: ComponentRef<DocumentModalComponent>) => {
        });
    }
}

export function DocViewerFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(DocViewerFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}


