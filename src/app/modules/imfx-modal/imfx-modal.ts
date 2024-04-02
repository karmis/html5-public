/**
 * Created by Sergey Trizna on 17.04.2018.
 */
import {
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentRef,
    ElementRef,
    EventEmitter, HostListener,
    Injector,
    NgZone,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
// provider
import {Event as RouterEvent, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {BaseProvider} from '../../views/base/providers/base.provider';
import {IMFXModalEvent, IMFXModalInitialStateType, IMFXModalOptions} from './types';
import {ThemesProvider} from '../../providers/design/themes.providers';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {OverlayComponent} from '../overlay/overlay';
import {Subscriber, Subscription} from 'rxjs';
import {IMFXModalGlobalProvider, MRefType} from "./proivders/imfx-modal.global.provider";
import {Location, LocationStrategy, PopStateEvent} from "@angular/common";

@Component({
    selector: 'imfx-modal',
    templateUrl: './tpl/index.html',
    styleUrls: ['./styles/index.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush, // default only!
    encapsulation: ViewEncapsulation.None,
    providers: [
        // BsModalRef,
        BsModalService,
        Location
    ]

})
export class IMFXModalComponent {
    @ViewChild('modalFooterContainer', {
        read: ViewContainerRef,
        static: false
    }) modalFooterContainerRef: ViewContainerRef;
    public modalEvents: EventEmitter<IMFXModalEvent> = new EventEmitter<IMFXModalEvent>();
    public routerEventsSubscr: Subscription;
    private _contentFactoryPromise: Promise<ComponentFactory<any>>;
    private _data: IMFXModalInitialStateType;
    // public routeSubscr: Subscription;
    @ViewChild('modalHeader', {static: false}) private modalHeaderRef: ElementRef;
    @ViewChild('modalBody', {static: false}) private modalBodyRef: ElementRef;
    @ViewChild('modalFooter', {static: true}) private modalFooterRef: ElementRef;
    @ViewChild('overlayModal', {static: false}) private overlayModalRef: OverlayComponent;
    @ViewChild('footerHider', {static: false}) private footerHider: ElementRef;
    // public onHidden: EventEmitter<void> = new EventEmitter<void>();
    private footerRef: ComponentRef<any>;
    // private mService: BsModalService;
    // private mRef: BsModalRef;
    private uid: number = 0;
    private contentFactory: ComponentFactory<any>;

    // private isDefault: boolean = false;
    // private isGlobal: boolean = false;
    // public onShow: EventEmitter<void> = new EventEmitter<void>();
    // public onShown: EventEmitter<void> = new EventEmitter<void>();
    // public onHide: EventEmitter<void> = new EventEmitter<void>();

    constructor(protected ngZone: NgZone,
                private router: Router,
                private injector: Injector,
                private translate: TranslateService,
                private themesProvider: ThemesProvider,
                private baseProvider: BaseProvider,
                private mService: BsModalService,
                private mRef: BsModalRef,
                private vcRef: ViewContainerRef,
                public cdr: ChangeDetectorRef,
                private location: Location,
                private modalGlobalProvider: IMFXModalGlobalProvider) {
        // this.uid = globalProvider.mRefs.length;
        // globalProvider.addLoader({
        //     id: this.uid,
        //     ref: mRef
        // });
        this.routerEventsSubscr = router.events.subscribe((event: RouterEvent) => {
            this._navigationInterceptor(event);
        });

        const onShowSbscr = mService.onShow.subscribe(($event) => {
            this.modalEvents.emit({
                name: 'show',
                $event: $event
            });
            onShowSbscr.unsubscribe();
        });

        const onShownSbscr = mService.onShown.subscribe(($event) => {
            this.modalEvents.emit({
                name: 'shown',
                $event: $event
            });
            onShownSbscr.unsubscribe();
        });

        const onHiddenSbscr = mService.onHidden.subscribe(($event) => {
            this.modalEvents.emit({
                name: 'hidden',
                $event: $event
            });
            onHiddenSbscr.unsubscribe();
        });

        const onHideSbscr = mService.onHide.subscribe(($event) => {
            this.modalEvents.emit({
                name: 'hide',
                $event: $event
            });
            onHideSbscr.unsubscribe();
        });

        // // this.locationStrategy.onPopState().subscribe(() => {
        // //     history.pushState(null, null, window.location.href);
        // // });
        // const loc = this.location.path(true)
        // // any modal window should to know about address
        // this.location.subscribe((event: PopStateEvent) => {
        //     const refs = this.modalGlobalProvider.mRefs;
        //
        //     console.log(loc, this)
        //     debugger
        //     if (refs.length) {
        //         console.log(this, location, self, refs);
        //         const m: MRefType = refs.pop();
        //         if(m) {
        //             m.ref.hide()
        //             window.location.href = loc;
        //         }
        //     } else {
        //         window.history.back();
        //     }
        // })



        this.clearObs();
    }

    private _contentView: any/*ComponentRef<any>*/;

    get contentView(): ComponentRef<any> {
        if (!this._contentView) {
            throw new Error('You tried get contentView of modal. It is undefined now.' +
                'If you using lazyLoading way you need call `load<Promise<any>>` before;');
        }
        return this._contentView;
    }

    getContent(): any {
        return this.contentView.instance;
    }

    load(): Promise<ComponentRef<any>> {
        return new Promise<any>((resolve, reject) => {
            if (this._contentView && this._contentView instanceof ComponentRef) {
                console.warn('this.contentView is loaded already. Probably you use ' +
                    'something like `const modal = this.modalProvider.show`. In this case you can just use ' +
                    '`modal.getContent()` or `modal.contentView.instance`');
                resolve(this.contentView);
            } else if (this._contentFactoryPromise && this._contentFactoryPromise instanceof Promise) {
                this._contentFactoryPromise.then((comp: ComponentFactory<any> | any) => {
                    this.contentFactory = comp;
                    this._contentView = this.vcRef.createComponent(comp);
                    this.doInsertContentView(this._contentView);
                    resolve(this._contentView);
                });
            }
        }).catch((e) => {
            console.error(e);
        });
    }


    getData(): any {
        return this._data.data;
    }

    getModalOptions(): IMFXModalOptions {
        return this._data.modalOptions;
    }

    // getCheckboxes(): any {
    //     return {
    //         isDefault: this.isDefault,
    //         isGlobal: this.isGlobal
    //     };
    // }

    ngOnInit() {
        const modalState = {
            modal : true,
            desc : 'fake state for our modal'
        };
        if (this.getModalOptions().usePushState) {
            history.pushState(modalState, null);
        }
    }

    @HostListener('window:popstate', ['$event'])
    dismissModal($event) {
        if (this.getModalOptions().usePushState) {
            console.log($event);
            this.hide()
        }
    }

    ngAfterViewInit() {
        const modalOpts = this.getModalOptions();
        if (modalOpts._compPath) {
            // lazy loading
            this._contentFactoryPromise = this.baseProvider.createComponentByPath(
                modalOpts._compPath, modalOpts._compFunc, [
                    {provide: 'modalRef', useValue: this}
                ]);
        } else {
            // module already loaded
            this._contentView = this.baseProvider.createComponent(
                modalOpts._compFunc, [
                    {provide: 'modalRef', useValue: this}
                ]);
        }

        if (this._contentView && this._contentView instanceof ComponentRef) {
            // The promise is necessary for correct LC of creating inner component.
            Promise.resolve().then(() => {
                this.doInsertContentView(this._contentView);
            });
        }
    }

    ngOnDestroy() {
        if (window.history.state.modal) {
            history.back();
        }
        // this.hide();
    }

    /**
     * Hide modal
     */
    hide(name: string = 'autohide', $event = null) {
        this.mRef.hide();
        // $('modal-container').each((el) => {
        //     $(el).remove();
        // })

        // inside mRef.hide()
        // this.contentView.destroy();

        this.modalEvents.emit({
            name: name,
            $event: $event
        });
        this.routerEventsSubscr.unsubscribe();
        this.clearObs();
        if(this.modalGlobalProvider.mRefs.length > 0) {
            this.modalGlobalProvider.removeLoader(this.modalGlobalProvider.mRefs.length-1)
        }
    }

    hideAll(name: string = 'autohide', $event = null) {
        // @ts-ignore: Accessing private variable as workaround for missing feature
        // this.mService.loaders.forEach(loader => { loader.hide(); });
        this.mRef.hide();
        // this.globalProvider.mRefs.forEach((mRef: MRefType) => {
        //     mRef.ref.hide();
        //     this.globalProvider.removeLoader(mRef.id)
        // })
    }

    /**
     * Emmiter for events of buttons
     */
    emitClickFooterBtn(name: string, $event = null) {
        this.modalEvents.emit({
            name: name,
            $event: $event
        });
    }

    showOverlay(withFooterHide = false, onlyFooterHider = false) {
        if (!onlyFooterHider)
            this.overlayModalRef.show(this.modalBodyRef.nativeElement);
        if (withFooterHide)
            $(this.footerHider.nativeElement).show();
    }

    hideOverlay(withFooterShow = true, onlyFooterHider = false) {
        if (!onlyFooterHider)
            this.overlayModalRef.hide(this.modalBodyRef.nativeElement);
        if (withFooterShow)
            $(this.footerHider.nativeElement).hide();
    }

    /**
     * Apply custom css styles
     */
    public applyCustomCss() {
        // color schema
        let dialogEl = $(this.modalHeaderRef.nativeElement).parent().parent().parent();
        // set position center

        if (this.getModalOptions().size == 'md') {
            // dialogEl[0].style.maxWidth = ''; // not
            dialogEl.css({
                maxWidth: ''
            });
        }

        // // fix for z-index
        // dialogEl.parent().css({zIndex:'1028'});
        // dialogEl.parent()
        // set xl size
        if (this.getModalOptions().size == 'lg') {
            dialogEl.css({
                maxWidth: '1000px'
            });
        }

        if (this.getModalOptions().size == 'xl') {
            dialogEl.css({
                maxWidth: '1140px'
            });
        }
        if (this.getModalOptions().size == 'xxl') {
            dialogEl.css({
                maxWidth: '1366px'
            });
        }
        if (this.getModalOptions().position == 'center') {
            dialogEl.css($.extend({}, {
                height: '80%',
                width: '100%',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
            }, this.getModalOptions().dialogStyles));
            dialogEl.find('.modal-content').css({
                width: '100%',
                '-webkit-box-shadow': '-1px 10px 0px 9999px rgba(0,0,0,0.75)',
                '-moz-box-shadow': '-1px 10px 0px 9999px rgba(0,0,0,0.75)',
                'box-shadow': '-1px 10px 0px 9999px rgba(0,0,0,0.75)'
            });
        }
        if (this.getModalOptions().size == 'full-size') {
            dialogEl.css($.extend({}, {
                maxWidth: '100%',
                width: '100%',
                height: '100%',
                margin: 0,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                position: 'fixed'
            }));
        }
    }

    cancel() {
        this.modalEvents.emit({
            name: 'overlay-cancel',
        })
    }

    // }
    setTitle(title) {
        let opt = this.getModalOptions();
        opt.title = title;
    }
    setSubTitle(subTitle) {
        let opt = this.getModalOptions();
        opt.subTitle = subTitle;
    }

    private clearObs() {
        if (this.modalEvents.observers && this.modalEvents.observers.length > 0) {
            $.each(this.modalEvents.observers, (k, obs: Subscriber<any>) => {
                if (obs && obs.unsubscribe) {
                    obs.unsubscribe();
                }
            });
        }
    }

    private insertContentView(contentView: ComponentRef<any>) {
        this.baseProvider.insertComponentIntoView(this.vcRef, contentView, this.modalBodyRef.nativeElement);
    }

    private doInsertContentView(contentView: ComponentRef<any>) {
        // insert comp to DOM
        this.insertContentView(contentView);
        // build footer
        this.buildFooter(contentView);

        // set modal position
        this.applyCustomCss();
        this.modalGlobalProvider.addLoader({id: this.modalGlobalProvider.mRefs.length, ref: this.mRef})
    }

    private _navigationInterceptor(event) {
        if (event instanceof NavigationEnd) {
            this.ngZone.runOutsideAngular(() => {
                this.hideAll()
            });
        }
    }

    private buildFooter(contentView: ComponentRef<any>) {
        if (this.getModalOptions().footerRef) {
            let footerRefStr = this.getModalOptions().footerRef;
            this.footerRef = contentView.instance[footerRefStr];
            this.cdr.detectChanges();
            // if(footerRef) {
            //     let footerView =  footerRef.createEmbeddedView(footerRef, {name: 'some description'});
            //     this.modalFooterContainerRef.insert(footerView);
            // }
        }
    }
}
