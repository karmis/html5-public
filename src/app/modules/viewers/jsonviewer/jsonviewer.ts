import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    ViewEncapsulation
} from '@angular/core';
import 'codemirror/mode/javascript/javascript';
import { Observable } from 'rxjs';
import { HttpService } from "../../../services/http/http.service";

@Component({
    selector: 'json-viewer',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class JsonViewerComponent {

    @Input('url') private url: string;
    public onResize: EventEmitter<any> = new EventEmitter<any>();

    private jsonString: string = "";
    private showOverlay: boolean = true;
    private fullSize = false;
    private resultInner: string;
    private _config: any = {
        url: '',
        inner: ''
    };
    @Input('config')private config: any;

    constructor(private httpService: HttpService,
                private cdr: ChangeDetectorRef) {

    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        let self = this;
        this.getCode().subscribe((resultInner: string) => {
            self.jsonString = resultInner;
            this.cdr.detectChanges();
            setTimeout(() => {
                this.refreshCodeMirror();
            });
        }, (err) => {
            throw new Error('Error loading file. Please contact support.');
        });
    }

    toggleFullSize() {
        this.fullSize = !this.fullSize;
        this.cdr.detectChanges();
        this.refreshCodeMirror();
    }

    toggleOverlay(show) {
        this.showOverlay = show;
        this.cdr.detectChanges();
    }

    private getCode(): Observable<String> {
        let self = this;
        return new Observable((observer: any) => {
            if (self.config.inner) {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(this.getInnerCode());
                observer.complete();
                // });
            } else if (self.config.url) {
                self.getFileByURL(self.config.url).subscribe((codeString) => {
                    observer.next(codeString);
                }, (err) => {
                    // observer.error(err);
                    throw new Error('Error loading file. Please contact support.');
                }, () => {
                    observer.complete();
                });
            } else {
                observer.error('Not defined URL or INNER parameter!');
                throw new Error('Not defined URL or INNER parameter!');
            }
        });
    }

    private getInnerCode() {
        return this.config.inner;
    }

    private getFileByURL(url): Observable<String> {
        return new Observable((observer: any) => {
            if ((<any>window).FileReader && (<any>window).File
                && (<any>window).FileList && (<any>window).Blob) {
                this.httpService.http.get(url, {responseType: 'blob'})
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
                                observer.complete();
                            };

                            reader.readAsText(blob);
                        },
                        (error) => {
                            observer.error(error);
                        }/*, () => {       // don't display xml
                            observer.complete();
                        }*/
                    );

            } else {
                throw new Error('FileReader is not supported');
            }
        });
    }

    refreshCodeMirror() {
        let editor = (<any>($('.CodeMirror')[0])).CodeMirror;
        editor.on('refresh', () => {
            this.toggleOverlay(false);
        });
        editor.refresh();
    }
}
