/**
 * Created by dvvla on 28.08.2017.
 */

import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from "jquery";

@Directive({
    selector: '[dropdown]'
})

export class DropDownDirective {
    constructor(private el: ElementRef,
                private router: Router) {
        let self = this;
        // this.router.events.subscribe(() => {
        //   self.close();
        // });
    }

    @HostListener('click', ['$event']) onClick(event) {
        let dropdown = $('.basket-dropdown');
        let targetBasket = $(dropdown[0]).has(event.target).length;
        if (targetBasket === 1) {
            return;
        }

        if(event.target.className.toString().indexOf('upload') > -1 || ( event.target.parentElement && event.target.parentElement.className.indexOf('upload') > -1)) {
            $('.dialog-upload.submenu').addClass('active-submenu');
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        let subdropdown = $('.subdropdown');
        let target = $(subdropdown[0]).has(event.target).length;
        if (target === 1) {
            let ddc = subdropdown[0].children;
            let dd;
            for (var i = 0; i < ddc.length; i++) {
                let element = ddc[i];
                if (typeof element.className === 'string') {
                    if (element.className.indexOf('active-submenu') + 1) {
                        dd = element;
                    } else if (element.className.indexOf('submenu') + 1) {
                        dd = element;
                    }
                }
            }
            let el = $(dd).has(event.target).length;
            if (el !== 0) {
                $('.active-submenu').toggleClass('active-submenu');
                $('.active-dropdown').toggleClass('active-dropdown');
            }
            $(dd).toggleClass('active-submenu');
        } else {
            $(this.el.nativeElement).toggleClass('active-dropdown');
            let ddc = this.el.nativeElement.children;
            let dd;
            for (var i = 0; i < ddc.length; i++) {
                let element = ddc[i];
                if (typeof element.className === 'string') {
                    if (element.className.indexOf('active-submenu') + 1) {
                        dd = element;
                    } else if (element.className.indexOf('submenu') + 1) {
                        dd = element;
                    }
                }
            }
            if (dd) {
                if (dd.className.indexOf('active-submenu') + 1) {
                    $(dd).removeClass('active-submenu');
                } else {
                    $(dd).addClass('active-submenu');
                    this.calcIndent(event, dd);
                }
            }
        }
    }


    calcIndent(event,elem) {
        let elemMetrics = elem.getBoundingClientRect();
        let targetMetrics = event.currentTarget.getBoundingClientRect();
        let outOfconfines = document.documentElement.clientHeight - (targetMetrics.top + (2 * targetMetrics.height - 16) + elemMetrics.height);
        if (outOfconfines < 0) {
            elem.style.top = (targetMetrics.height + outOfconfines) + 'px';
        } else {
            elem.style.top = "";
        }
    }



    @HostListener('document:mousedown', ['$event']) onMousedown(event) {
        if(this.isPrevented(event)) {
            return
        }
        let dropdown = $('.active-dropdown');
        let submenu = $('.active-submenu');
        let target = this.getTarget({dropdown, submenu, event});

        if (target === 0) {
            $(dropdown).removeClass('active-dropdown');
            $(submenu).removeClass('active-submenu');
        }
    }

    @HostListener('mouseover', ['$event']) onHover(event) {
        if(this.isPrevented(event)) {
            return
        }
        if (event.target.tagName != 'BUTTON') {
            let dropdown = $('.basket-dropdown');
            let submenu = $('.dialog-basket.submenu');
            let target = this.getTarget({dropdown, submenu, event});
            if (target === 1) {
                $(dropdown).addClass('active-dropdown');
                $(submenu).addClass('active-submenu');
            }
        }
    }

    @HostListener('mouseleave', ['$event']) onLeave(event) {
        if(this.isPrevented(event)) {
            return
        }
        let dropdown = $('.basket-dropdown');
        let submenu = $('.dialog-basket.submenu');
        let target = this.getTarget({dropdown, submenu, event});
        if (target === 0) {
            $(dropdown).removeClass('active-dropdown');
            $(submenu).removeClass('active-submenu');
        }
    }

    private isPrevented(event) {
        if (event.target.tagName === 'line' || event.target.tagName === 'svg' || (event.target.parentElement && typeof event.target.parentElement.className === 'object')) {
            return false
        }
        return (event.target.className && event.target.className.toString().indexOf('upload') > -1) || (event.target.parentElement && event.target.parentElement.className.indexOf('upload') > -1)
    }

    getTarget({dropdown, submenu, event}) :  number{
        let target;

        if (dropdown.length ===0){
            return 0;
        }

        target = $(dropdown[0]).has(event.target).length;

        return target;
    }

    private close() {
        let dropdown = $('.active-dropdown');
        let submenu = $('.active-submenu');
        $(dropdown).removeClass('active-dropdown');
        $(submenu).removeClass('active-submenu');
    }
}
