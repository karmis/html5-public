/**
 * Created by Sergey Trizna on 29.03.2017.
 */
import {ErrorInterface} from "./interface.error";
import { HttpErrorResponse } from '@angular/common/http';
import {IMFXXHRType, NativeUploadXHRStatusText} from "../../upload/types";

export class NetworkError implements ErrorInterface {
    text: string;
    title: string;
    originalError?: IMFXXHRType | HttpErrorResponse | any;
    request?: any;
    mode: 'xhr' | 'http' = 'http';

    getTitle(): string {
        let title = '';
        if(this.mode === 'xhr') {
            const imfxStatusText:NativeUploadXHRStatusText = this.originalError.imfx_status_text;
            if(imfxStatusText){
                if(imfxStatusText === 'status_aborted'){
                    this.title = 'Upload Request Aborted';
                    return this.title;
                }
            }
        }
        if (this.title) {
            title += this.text;
        }
        let url: string = '[none]';
        if(this.request && this.request.url) {
            url = this.request.url
        } else if(this.originalError && this.originalError.request) {
            url = this.originalError.request.url;

        }
        title += ' NetworkError: ' + url + ' ( traceId: '+this.getTraceId()+' )';

        // title += "<br>" + this.getStrErr();

        return title;
    }

    getText(type: 'html' | 'text' = 'html', mode: 'small' | 'full' = 'full', cstrs: number = null): string {
        let err = "";
        let br = type == 'html' ? "<br />" : "\r\n";
        if (this.text) {
            err += this.text + br;
        }

        if (this.request) {
            if (mode == 'full' && cstrs === null) {
                err += "<strong>Error on request</strong>: " + br;
                err += "<strong>Url</strong>: " + "<span>" + this.request.url + "</span>" + br;
                err += "<strong>TraceId</strong>: " + "<span>" + this.request.headers.get('trace-id') + "</span>" + br;
                err += "<strong>Headers</strong>: " + JSON.stringify(this.request.headers.toJSON()) + br;
                err += "<strong>Body</strong>: " + this.request.body + br;
            } else if (mode == 'full' && cstrs !== null) {
                let strErr = this.getStrErr();
                let strArr = [];
                if (this.originalError && this.originalError.error instanceof ProgressEvent) {
                    strArr = [(this.originalError.error.currentTarget as any).__zone_symbol__xhrURL];
                } else {
                    strArr = strErr.split('\n');
                }
                $.each(strArr, (k: number, str) => {
                    if (k > cstrs) {
                        return false;
                    }
                    err += str;
                });
            }
        }

        if (this.originalError) {
            err += "<span>" + this.getOriginalError() + "</span>";
            // err += "<span>" + this.originalError.toLocaleString() + "</span>" + br;
        }

        if (type == 'text') {
            err = err.replace(/<\/?[^>]+(>|$)/g, ""); // strip_tags
        }

        return err;
    }

    getOriginalError() {
        let err;
        let _origErr = this.originalError as any;
        if (_origErr && _origErr.text && (_origErr.text())) {
            let parsedErr = _origErr.text() || null;
            if (typeof parsedErr == "string") {
                parsedErr = JSON.parse(parsedErr);
            }

            if (parsedErr.Message) {
                err = parsedErr.Message;
            }
        }

        if (!err) {
            err = _origErr.stack;
        }

        return err;
    }

    setOriginalError(originalError) {
        this.originalError = originalError;
        if (this.mode === 'xhr') {
            const request = {
                url: this.originalError.responseURL,
                body: this.originalError.response,
                headers: this.originalError.getAllResponseHeaders()
            };

            this.setRequest(request)
        }
    }

    getTraceId() {
        let req = this.originalError;
        if(!req) {
            req = this.request;
        }
        // if(!req || !req.getResponseHeader) {
        //     return 'none';
        // }
        return req.headers ?
            req.headers.get('trace-id') :
            req.getResponseHeader ?
                req.getResponseHeader('trace-id') : null; // HttpErrorResponse
    }

    setRequest(request: any) {
        this.request = request;
    }

    setText(str: string) {
        this.text = str;
    }

    private getStrErr(): string {
        let strErr: any = '>> undefined';
        if (!this.originalError) {
            return strErr;
        }

        if (this.originalError instanceof HttpErrorResponse) {
            // try {
            strErr = this.originalError.error;
            if (strErr.Message) {
                strErr = strErr.Message;
            }
            // }
            // catch (e) {
            //     strErr = this.originalError.error;
            // }
        } else if (this.originalError.stack) {
            strErr = this.originalError.stack;
        } else if (this.originalError.responseURL) { //XMLHttpRequest
            strErr = this.originalError.responseURL;
        }

        return strErr;
    }
}
