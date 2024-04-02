/**
 * Created by IvanBanan on 07.08.2018.
 */

import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from "jquery";

@Directive({
    selector: 'input[type="text"], input[type="search"], textarea'
})

export class TextDirectionDirective {

    constructor(private el: ElementRef,
                private router: Router) {
        // console.log('directive', this.el.nativeElement);
    }

    @HostListener('keyup') keyUp(event) {
        let el = this.el.nativeElement;
        if(this.isRTL(el.value)){
            el.style.direction = "rtl";
            // el.style.unicodeBidi = "bidi-override";
        } else {
            el.style.direction = "";
            // el.style.unicodeBidi = "";
        }

    }


    isRTL(str: string): boolean{
        let ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
            rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
            rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');

        return rtlDirCheck.test(str);
    };





}
