/**
 * Created by Sergey Trizna on 12.06.2017.
 */
// see: https://gasparesganga.com/labs/jquery-loading-overlay/
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from "@angular/core";
import {Location} from "@angular/common";
import { TranslateService } from '@ngx-translate/core';
import {ThemesProvider} from "../../providers/design/themes.providers";
import * as $ from "jquery";
import {Observable} from "rxjs";
import { HttpResponse } from '@angular/common/http';

require('gasparesganga-jquery-loading-overlay/src/loadingoverlay.js');
require('gasparesganga-jquery-loading-overlay/extras/loadingoverlay_progress/loadingoverlay_progress.js');

@Component({
    selector: 'overlay',
    templateUrl: './tpl/index.html',
    styleUrls: ['./styles/index.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class OverlayComponent {
    @Output('isError') public isError: EventEmitter<any> = new EventEmitter<any>();
    @Output('onHide') public onHide: EventEmitter<void> = new EventEmitter<void>();
    @Input('color') private color = 'rgba(255, 255, 255, 1)';
    @Input('detail') private detail: boolean = false;
    @Input('image') private image = '';
    @Input('custom') private custom = '<div class="spinner large"></div>'; // will be changed in ngAfterViewInit
    @Input('maxSize') private maxSize = "80px";
    @Input('minSize') private minSize = "20px";
    @Input('resizeInterval') private resizeInterval = 50;
    @Input('size') private size = "50%";
    @Input('fade') private fade = [100, 700];
    @Input('mode') private mode: boolean = false;
    // @Input('recentMode') private recentMode: boolean = false;
    // @Input('queueMode') private queueMode: boolean = false;
    // @Input('simpleMode') private simpleMode: boolean = false;
    @Input('zIndex') private zIndex: number = 400;
    @Input('text') private text: string = "";
    // @Input('groupsMode') private groupsMode: boolean = false;
    private extendsOptions = {};
    private timeoutHandler: any;
    private isShowed: boolean = false;
    private overlappedElements = [];

    constructor(private location: Location,
                private themesProvider: ThemesProvider,
                private translate: TranslateService,
                private cdr: ChangeDetectorRef,
                private elRef: ElementRef) {
    }

    /**
     * Get default options
     * @returns Object
     */
    public getDefaultOptions() {
        return {
            color: this.color,
            image: this.image,
            custom: this.custom,
            maxSize: this.maxSize,
            minSize: this.minSize,
            resizeInterval: this.resizeInterval,
            size: this.size,
            fade: this.fade,
            zIndex: this.zIndex
        };
    }

    /**
     * Set default options
     * @param paramOptions
     */
    public setDefaultOptions(paramOptions) {
        this.extendsOptions = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            paramOptions // options from params
        );
    }

    /**
     * Returned current state options for plugin
     * @returns Object
     */
    public getActualOptions(paramOptions = {}) {
        // @todo remove it
        let color = this.themesProvider.getColorByCode(1);
        let opts = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            {color: color},
            this.extendsOptions, // actually options
            paramOptions, // options from params
        );

        return opts;
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        let overlayElem = (<any>$(this.overlappedElements)).data("LoadingOverlay");
        clearTimeout(this.timeoutHandler);
        $(overlayElem).remove();
    }

    ngAfterViewInit() {
        let theme = this.themesProvider.theme_class;
        this.custom = "<div class='spinner-wrapper " + theme + "'>" +
                "<div class='spinner large'></div>" +
                "</div>";

        (<any>$).LoadingOverlaySetup(this.getActualOptions());
        // console.log(this.zIndex, this, this.elRef.nativeElement);
    }

    showWithButton(el) {
        let text = this.translate.instant("common.cancel");
        let self = this;
        this.timeoutHandler = setTimeout(function () {
            let theme = self.themesProvider.theme_class;
            (<any>$(el)).LoadingOverlay('hide', true);
            self.isShowed = true;
            (<any>$(el)).LoadingOverlay('show', $.extend(true, self.getActualOptions(), {
                custom: "<div class='spinner-wrapper " + theme + "'>" +
                    "<div class='spinner large'></div>" +
                    "<button id='buttonCancel' class='icon-button-overlay cancelButtonClass' title='Back'>" +
                    text +
                    "</button>" +
                    "</div>",
                fade: [0, 700],
                zIndex: self.zIndex + 1
            }));
            let button = $('#buttonCancel');
            button.on('click', function () {
                if (self.mode) {
                    self.hide(el);
                    self.isError.emit(true);
                } else {
                    self.clickBack();
                }
            });
            $('overlay').trigger("click");
            $('.loadingoverlay').trigger("click");
            // text
            if (self.text && self.text != "") {
                let parentEl = $('.loadingoverlay .spinner');
                parentEl.parent().append("<p class='overlay-text text-color-" + theme + "'>" + self.text + "</p>");
            }
            self.cdr.detectChanges();
        }, 7000);
    }

    pushToOverlappedElements(el){
        let isIn= false;

        isIn = this.overlappedElements.some((elem)=>{
            return elem==el;
        });

        !isIn && this.overlappedElements.push(el);
    }

    delFromOverlappedElements(el){
        let arr = this.overlappedElements
            ,i;
        for (i in arr){
            if(arr[i] == el){
                arr.splice(i);
            }
        }
    }

    show(el, request?: Observable<HttpResponse<any>>) {
        if (!this.isShowed) {
            (<any>$(el)).LoadingOverlay("show", this.getActualOptions());
            this.pushToOverlappedElements(el);
            this.isShowed = true;
            if (request) {
                //TODO test and implement normally
                request.subscribe((res: any) => {
                        this.hide(el);
                    },
                    (error) => {
                        this.hide(el);
                    });
            }
            else {
                this.showWithButton(el);
            }
        }
    }

    showWithoutButton(el) {
        this.isShowed = true;
        (<any>$(el)).LoadingOverlay("show", this.getActualOptions());
        this.pushToOverlappedElements(el);
    }

    clickBack() {
        this.location.back();
    }

    hide(el) {
        let overlayElem = (<any>$(el)).data("LoadingOverlay");
        this.isShowed = false;
        (<any>$(el)).LoadingOverlay("hide", true);
        // this.delFromOverlappedElements(el);
        clearTimeout(this.timeoutHandler);
        $(overlayElem).remove();
        this.onHide.emit();
    }

    showWhole() {
        this.isShowed = true;
        (<any>$).LoadingOverlay("show", this.getActualOptions());
    }

    hideWhole() {
        this.isShowed = false;
        (<any>$).LoadingOverlay("hide", true);
        clearTimeout(this.timeoutHandler);
        this._hide();
    }

    isShowedOverlay(): boolean {
        return this.isShowed;
    }

    public setText(text: string) {
        this.text = text;
    }

    private _hide() {
        this.isShowed = false;
        $('.loadingoverlay').hide();
    }
}
