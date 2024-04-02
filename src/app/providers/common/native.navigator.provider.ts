/**
 * Created by Ivan Banan on 12.02.2020.
 */
import { Injectable } from '@angular/core';

export enum BrowserNames {
    Chrome = 'Google Chrome',
    Firefox = 'Firefox',
    Opera = 'Opera',
    Safari = 'Safari',
    IE = 'Internet Explorer',
    Edge = 'Edge'
}

@Injectable()
export class NativeNavigatorProvider {
    get navigator() : any {
        return self.navigator;
    }

    getNameBrowser(){
        const ua = this.navigator.userAgent;
        if (ua.search(/Chrome/) > 0) return BrowserNames.Chrome;
        if (ua.search(/Firefox/) > 0) return BrowserNames.Firefox;
        if (ua.search(/Opera/) > 0) return BrowserNames.Opera;
        if (ua.search(/Safari/) > 0) return BrowserNames.Safari;
        if ((ua.search(/MSIE/) > 0) || (ua.search('Trident') > 0)) return BrowserNames.IE;
        if (ua.search('Edge') > 0) return BrowserNames.Edge;
        return;
    }

    isSafari() {
        return (this.getNameBrowser() === BrowserNames.Safari);
    }

    isIE() {
        // isIE = /msie\s|trident\/|edge\//i.test(this.navigator.userAgent);
        return (this.getNameBrowser() === BrowserNames.IE);
    }

    isEdge() {
        return (this.getNameBrowser() === BrowserNames.Edge);
    }


    isFirefox() {
        return (this.getNameBrowser() === BrowserNames.Firefox);
    }

    isOpera() {
        return (this.getNameBrowser() === BrowserNames.Opera);
    }

    isChrome() {
        return (this.getNameBrowser() === BrowserNames.Chrome);
    }

    defineIE() {
        const ua = this.navigator.userAgent;

        const msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        const trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            const rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        // other browser
        return false;
    }
}
