import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ConfigService} from "../../../services/config/config.service";
import {IMFXHtmlPlayerComponent} from "../../controls/html.player/imfx.html.player";
import {SecurityService} from "../../../services/security/security.service";
import {ProfileService} from "../../../services/profile/profile.service";
import { NativeNavigatorProvider } from '../../../providers/common/native.navigator.provider';
import {forkJoin, Observable, Subject} from "rxjs";
import {ItemTypes} from "../html.player/item.types";
import {takeUntil} from "rxjs/operators";
import {MediaDetailMediaVideoResponse} from "../../../models/media/detail/mediavideo/media.detail.mediavideo.response";
import {DetailService} from "../../search/detail/services/detail.service";

@Component({
    selector: 'thumb-component',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThumbComponent {
    @ViewChild('thumbPlayer', {static: false}) player: IMFXHtmlPlayerComponent;
    @ViewChild('thumbWrapper', {static: true}) thumbWrapper: any;
    private params: any;
    private url: string;
    private proxyUrl: string;
    private playable: boolean;
    private isVideo: boolean;
    private hoverOnThumb: boolean = false;
    private start_hover: boolean = false;
    private currentVideoTime: number = 0;
    private initedFlag: boolean = false;
    private onHoverFlag: boolean = false;
    private muted = false;
    private personalSubscription;
    public destroyed$: Subject<any> = new Subject();
    @Input() mediaInfoType = 'media';
    @Input() disablePlayer: boolean = false;

    @Input('params') set setParams(params) {
        if (params instanceof Object) {
            this.params = $.extend(true, this.params, params);
        }
        else {
            this.params = {
                value: params
            };
        }
    }

    constructor(public cdr: ChangeDetectorRef,
                private profileService: ProfileService,
                private nativeNavigatorProvider: NativeNavigatorProvider,
                private securityService: SecurityService) {
    };

    ngAfterViewInit() {
        this.url = this.params.value || this.params.THUMBURL ||
        (this.params.data && this.params.data['THUMBURL']) || './assets/img/default-thumb.PNG';
        if (!this.params.value && this.params.data && (this.params.data['THUMBID'] && this.params.data['THUMBID'] != -1)) {
            // if (this.params.data['THUMBID'] != -1) {}
            this.url = ConfigService.getAppApiUrl() + '/getfile.aspx?id=' + this.params.data['THUMBID'];
        }
        if (this.url.indexOf('id=-1') !== -1) {
            this.url = './assets/img/default-thumb.PNG';
        }
        this.thumbInit(this.params.data || this.params);
        this.cdr.detectChanges();
    }

    aspectRatio = null;
    defineAspectRatio() : void {
        if (!this.isVideo) {
            return;
        }

        if (this.params.ASPECT_R_text) {
            this.aspectRatio = this.params.ASPECT_R_text;
        }
    }

    // called on init
    public thumbInit(params: any): void {
        this.initedFlag = false;
        if ((!this.securityService.hasPermissionByName("play_restricted_content")
            && params && params.MEDIA_STATUS == 1) || this.disablePlayer) {
            this.playable = false;
            return;
        }

        $(this.thumbWrapper.nativeElement).on('mouseenter', this, this.onmouseenter);
        $(this.thumbWrapper.nativeElement).on('mouseleave', this, this.onmouseleave);
        this.params = params;
        if (!this.params)
            return;
        this.proxyUrl = this.params.PROXY_URL || this.params.ProxyUrl;
        if (this.proxyUrl && this.proxyUrl.length > 0 && this.proxyUrl.match(/^(http|https):\/\//g) && this.proxyUrl.match(/^(http|https):\/\//g).length > 0) {
            this.playable = true;
        }

        const isEdge = this.nativeNavigatorProvider.isEdge();
        if (this.params && this.params['MEDIA_FORMAT_text'] == 'WEBM' && isEdge) {
            this.playable = false;
        }

        if (this.params && (this.params['MediaTypeOriginal'] == undefined || this.params['MediaTypeOriginal'] == 100 || this.params['MediaTypeOriginal'] == 150)) {
            this.isVideo = true;
        }

        if (this.isVideo) {
            this.defineAspectRatio();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onmouseenter(event): void {
        let comp = event.data;
        if (comp) {
            comp.start_hover = true;
            comp.profileService.GetPersonal().pipe(
                takeUntil(comp.destroyed$)
            ).subscribe((res: any) => {
                if (res) {
                    comp.muted = res['Mute'];
                }
                if (comp.initedFlag === false) {
                    comp.initedFlag = true;
                }
                if (comp) {
                    if (comp.start_hover) {
                        comp.hoverOnThumb = true;
                        comp.cdr.markForCheck();
                        if (comp.player && comp.player.player) {
                            setTimeout(() => {
                                comp.player.resizeProvider.onResize();
                            }, 0);
                            // comp.player.player.play();
                        }
                    }
                }
            });
        }
    };

    onmouseleave(event): void {
        let comp = event.data;
        if (comp) {
            if (comp.player && comp.player.player && comp.player.player.el_) {
                comp.player.player.muted(true);
                comp.player.player.pause();
                if (comp.player.player.duration() !== comp.player.player.currentTime()) {
                    comp.currentVideoTime = comp.player.player.currentTime();
                }
                else {
                    comp.currentVideoTime = 0;
                }
                comp.player.refresh();
            }
            comp.hoverOnThumb = false;
            comp.start_hover = false;
            comp.cdr.markForCheck();
        }
    };
}
