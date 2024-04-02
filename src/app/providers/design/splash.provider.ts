/**
 * Created by Sergey Trizna on 28.02.2017.
 */
// http://stackoverflow.com/questions/37069609/show-loading-screen-when-navigating-between-routes-in-angular-2
import {EventEmitter, Inject, NgZone} from '@angular/core';
import {
    Event as RouterEvent,
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router
} from '@angular/router';


export class SplashProvider {
    changed: EventEmitter<any> = new EventEmitter<any>();
    onHideSpinner: EventEmitter<any> = new EventEmitter<any>();
    public enabled: boolean;
    public ignoreInterceptorOnce: boolean;
    // public loaderElRef: ElementRef;
    public overlay;
    disabledSpinnerEndPoint = [
        'detail',
        'media-logger',
        'clip-editor',
        'assessment',
        'segmenting',
        'component-qc'
    ];
    disabledSpinnerStartPoint = [
        'production-detail'
    ];

    constructor(@Inject(Router) protected router: Router,
                @Inject(NgZone) protected ngZone: NgZone) {
        router.events.subscribe((event: RouterEvent) => {
            this._navigationInterceptor(event);
        });
        this.onHideSpinner.subscribe(
            () => {
                this._hideSpinner();
            }
        );
    };

    public show() {
        this.overlay && this.overlay.showWhole();
        // this.renderer.setElementStyle(
        //     this.loaderElRef.nativeElement,
        //     'display',
        //     'block'
        // );
    }

    public hide() {
        this.overlay && this.overlay.hideWhole();
        // this.renderer.setElementStyle(
        //     this.loaderElRef.nativeElement,
        //     'display',
        //     'none'
        // );
    }

    private _navigationInterceptor(event: RouterEvent): void {
        const url = window.location.hash;

        if (event instanceof NavigationStart) {
            if (!this.disabledSpinnerStartPoint.find(exUrl => url.indexOf(exUrl) !== -1)) {
                this.ngZone.runOutsideAngular(() => {
                    this.show();
                });
            }
        }

        if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            if (!this.disabledSpinnerEndPoint.find(exUrl => url.indexOf(exUrl) !== -1)) {
                if(url.indexOf('login') > -1 && this.ignoreInterceptorOnce) {
                    this.ignoreInterceptorOnce = false;
                }
                else
                    this._hideSpinner();
            }
        }
    };

    private _hideSpinner(): void {
        this.ngZone.runOutsideAngular(() => {
            this.hide();
            // this.renderer.setElementStyle(
            //     this.loaderElRef.nativeElement,
            //     'display',
            //     'none'
            // );
        });
    };


}
