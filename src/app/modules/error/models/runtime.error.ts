/**
 * Created by Sergey Trizna on 29.03.2017.
 */
import { ErrorInterface } from './interface.error';

export class RuntimeError implements ErrorInterface {
    text: string;
    title: string;
    originalError?: any;

    getTitle(): string {
        let title = "";
        if (this.title) {
            title += this.text;
        }
        let errStr: string = '';
        if(this.originalError){
            if (this.originalError.error) {
                errStr = this.getStrErr();
            } else if (this.originalError.stack) {
                errStr = this.originalError.stack.split('\n')[0];
            } else if (this.originalError.error && typeof this.originalError.error === 'string') {
                errStr = this.originalError.error;
            } else if ( this.originalError.error && typeof this.originalError.error === 'object') {
                errStr = this.originalError.error.error.stack.split('\n')[0];
            }
        } else {
            errStr = 'Unexpected error. It looks like you lost network connection'
        }

        title += '' + errStr;
        return title;
    }

    getText(type: 'html' | 'text' = 'html', mode: 'small' | 'full' = 'full', cstrs: number = null): string {
        let err = "";
        let br = type == 'html' ? "<br />" : "\r\n";
        let errStr: string = '';
        if(this.originalError){
            if (this.originalError.error) {
                errStr = this.getStrErr();
            } else {
                errStr = this.originalError.stack;
            }
        } else {
            errStr = 'Unexpected error. It looks like you lost network connection'
        }

        if (this.originalError && mode === 'full' && cstrs === null) {
            err += errStr + br;
        } else if (this.originalError && mode === 'full' && cstrs !== null) {
            let strArr = [];
            if (this.originalError && this.originalError.error instanceof ProgressEvent) {
                strArr = [this.originalError.error.currentTarget.__zone_symbol__xhrURL];
            } else {
                if(errStr){
                    strArr = errStr.split('\n');
                } else {
                    return;
                }

            }
            $.each(strArr, (k: number, str) => {
                if (k > cstrs) {
                    return false;
                }
                err += str;
            });
        }

        if (this.originalError && this.originalError.statusText) {
            err += this.originalError.statusText + br;
        }

        if (this.text) {
            err += this.text;
        }


        return err;
    }


    getOriginalError() {
        return this.originalError;
    }

    setOriginalError(originalError) {
        this.originalError = originalError;
    }

    private getStrErr(): string {
        let strErr;
        if (this.originalError && this.originalError.error) {
            if(typeof this.originalError.error === 'object') {
                strErr = this.originalError.error.Error + '('+this.originalError.error.ErrorDetails||this.originalError.error.ErrorDesc+')';
            } else {
                try {
                    strErr = JSON.parse(this.originalError.error);
                    if (strErr.Message) {
                        strErr = strErr.Message;
                    }
                } catch (e) {
                    strErr = this.originalError.error;
                }
            }
        } else {
            strErr = this.originalError;
            if (this.originalError.stack) {
                strErr = this.originalError.stack;
            } else if (this.originalError.error && typeof this.originalError.error === 'string') {
                strErr = this.originalError.error;
            } else if ( this.originalError.error && typeof this.originalError.error === 'object') {
                strErr = this.originalError.error.error.stack.split('\n')[0];
            }
        }

        return strErr;
    }
}
