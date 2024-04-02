/**
 * Created by Sergey Trizna on 16.05.2017.
 */
import { ChangeDetectorRef, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../../services/http/http.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { Observable, throwError as observableThrowError } from 'rxjs';


@Component({
    selector: 'docx-viewer',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        // PDFViewerProvider
    ]
})

export class DOCXViewerComponent {
    @Input('config') private config: any = {
        url: ''
    };
    @ViewChild('target', {static: false}) private compRef;
    @ViewChild('docx', {static: false}) private docx;
    private mammoth;
    private innerHTML: string = '';
    private error: boolean = true;
    private height;
    private text;

    constructor(private httpService: HttpService,
                private cd: ChangeDetectorRef,
                private translate: TranslateService) {
        this.mammoth = require('mammoth');
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        let self = this;
        let $iframe = $(self.docx.nativeElement).find('iframe')[0];
        $iframe.onload = function() {
            $($(self.docx.nativeElement)
                .find('iframe')[0]['contentWindow']).resize(function () {
                if (self.error) {
                    self.height = $(self.docx.nativeElement).find('iframe').height() + 'px';
                    self.cd.detectChanges();
                }
            });
        };
        this.getFileByURL(this.config.url).subscribe((ab: ArrayBuffer) => {
            self.convertToHtml(ab).subscribe((result: any) => {
                self.innerHTML = result.value;
                self.error = false;
                self.cd.markForCheck();
            });
        }, (error) => {
            if (error.status === 500) {
                // ошибка сервера
                this.text = this.translate.instant('details_item.server_not_work');
            } else if (error.status === 400 || error.status === 404) {
                // элемент не найден
                this.text = this.translate.instant('details_item.document_not_found');
            } else if (error.status === 0) {
                // сети нет
                this.text = this.translate.instant('details_item.check_network');
            }
            self.height = $(self.docx.nativeElement).find('iframe').height() + 'px';
            console.log(error);
            this.cd.detectChanges();
        });
    }

    getMammoth() {
        return this.mammoth;
    }

    convertToHtml(arrayBuffer: ArrayBuffer) {
        return new Observable((observer: any) => {
            this.getMammoth().convertToHtml({arrayBuffer: arrayBuffer})
                .then((result) => {
                    observer.next(result);
                    observer.complete();
                })
                .done();
        });
    }


    getFileByURL(url) {
        return new Observable((observer: any) => {
            if ((<any>window).FileReader && (<any>window).File
            && (<any>window).FileList && (<any>window).Blob) {
                this.httpService.http.get(url, {responseType: 'blob'})
                    .pipe(catchError(error => observableThrowError(error)))
                    .subscribe(
                        (blob: Blob) => {
                            let reader = new FileReader();
                            reader.onload = (e) => {
                                observer.next(reader.result);
                                observer.complete();
                            };
                            reader.onerror = (e) => {
                                observer.error(e);
                            };
                            reader.onabort = (e) => {
                                observer.complete(e);
                            };

                            reader.readAsArrayBuffer(blob);
                        }, (error) => {
                            observer.error(error);
                        }
                    );

            } else {
                throw new Error('FileReader is not supported');
            }
        });
    }
}
