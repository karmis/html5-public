/**
 * Created by Sergey Trizna on 16.05.2017.
 */
import { Component, ViewEncapsulation, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../services/http/http.service';
require('code-prettify/loader/prettify.js');
// require('code-prettify/loader/prettify.css');
// require('code-prettify/loader/skins/sons-of-obsidian.css');
@Component({
    selector: 'code-prettify-viewer',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})

export class CodePrettiffyViewerComponent {
    @Input('url') private url: string;
    @Input('inner') private inner: string;
    @Input('language') private language: 'bsh'|'c'|'cc'|'cpp'|'cs'|'csh'|'cyc'|'cv'|'htm'|'html'|
    'java'|'js'|'m'|'mxml'|'perl'|'pl'|'pm'|'py'|'rb'|'sh'|'xhtml'|'xml' = 'xml';
    @Input('width') private width: number = 400;
    @Input('height') private height: number = 400;
    @ViewChild('target', {static: false}) private compRef;
    private resultInner: string;
    private _config: any = {
        url: '',
        inner: '',
        language: 'xml',
        fullSize: false,
        onlyButton: false
    };
    @Input('config')private config: any;

    constructor(private httpService: HttpService,
                private cd: ChangeDetectorRef) {
    }

    ngAfterViewInit() {
        this.config = $.extend(true, this._config, this.config);
        let self = this;
        this.getCode().subscribe((resultInner: string) => {
            self.resultInner = self.formatXML(resultInner);
            this.cd.detectChanges();
            setTimeout(() => {
                (<any>window).PR.prettyPrint();
            });
        }, (err) => {
            throw new Error('Error loading file. Please contact support.');
        });
    }

    triggerFullSize() {
        this.config.fullSize = !this.config.fullSize;
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

    /**
     * TODO Remove duplication from it and docx.ts
     * @param url
     * @returns {any}
     */
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
    private formatXML(input, indent = null)
    {
      if(!input)
        return "";
      indent = indent || '\t';
      var xmlString = input.replace(/^\s+|\s+$/g, '');

      xmlString = input
        .replace( /(<([a-zA-Z]+\b)[^>]*>)(?!<\/\2>|[\w\s])/g, "$1\n" )
        .replace( /(<\/[a-zA-Z]+[^>]*>)/g, "$1\n")
        .replace( />\s+(.+?)\s+<(?!\/)/g, ">\n$1\n<")
        .replace( />(.+?)<([a-zA-Z])/g, ">\n$1\n<$2")
        .replace(/\?></, "?>\n<")

      var xmlArr = xmlString.split('\n');

      var tabs = '';
      var start = 0;

      if (/^<[?]xml/.test(xmlArr[0]))  start++;

      for (var i = start; i < xmlArr.length; i++)
      {
        var line = xmlArr[i].replace(/^\s+|\s+$/g, '');

        if (/^<[/]/.test(line))
        {
          tabs = tabs.replace(indent, '');
          xmlArr[i] = tabs + line;
        }
        else if (/<.*>.*<\/.*>|<.*[^>]\/>/.test(line))
        {
          xmlArr[i] = tabs + line;
        }
        else if (/<.*>/.test(line))
        {
          xmlArr[i] = tabs + line;
          tabs += indent;
        }
        else
        {
          xmlArr[i] = tabs + line;
        }
      }
      return  xmlArr.join('\n');
    }
}
