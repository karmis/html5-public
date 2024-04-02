/**
 * Created by Sergey on 10.03.2017.
 */
import { EventEmitter, Injectable, Injector, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DetailConfig, GoldenConfig } from '../detail.config';
import { ActivatedRoute, Event as RouterEvent, NavigationStart, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Cookie } from 'ng2-cookies';
import { SessionStorageService } from "ngx-webstorage";
import { MediaDetailResponse } from '../../../../models/media/detail/media.detail.response';
import { MediaDetailDetailsViewResponse } from '../../../../models/media/detail/detailsview/media.detail.detailsview.response';
import { MediaDetailMediaCaptionsResponse } from '../../../../models/media/detail/caption/media.detail.media.captions.response';
import { MediaDetailPacSubtitlesResponse } from '../../../../models/media/detail/pacsubtitles/media.detail.pac.subtitiles.response';
import { TranslateService } from "@ngx-translate/core";
import {NotificationService} from "../../../notification/services/notification.service";
import { takeUntil } from 'rxjs/operators';
import {CoreProviderConfig} from "../../../../core/core.config";
import {CoreService} from "../../../../core/core.service";
import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";

@Injectable()
export class DetailProvider {
    public onToggle: EventEmitter<boolean> = new EventEmitter();
    lastDetailId: number = null;
    _config: DetailConfig;
    moduleContext: any;
    goldenConfig = <GoldenConfig>{
        moduleContext: this,
        appSettings: null,
        providerType: null,
        options: {
            file: null,
            groups: null,
            friendlyNames: null,
            typeDetailsLocal: null,
            typeDetails: null,
            tabs: null,
            params: null,
            layoutConfig: null,
        },
    };
    inducingComponent: string;
    r_params: any;
    tabsData = [];
    file: Object = {};
    _accordions: any = [];
    userFriendlyNames: Object = {};
    params = {
        addPlayer: false,
        addMedia: false,
        addImage: false,
        showAllProperties: false,
        isSmoothStreaming: false,
        addViewer: false,
        mediaType: ''
    };
    timecodeFormatString: string = 'Pal';
    timecodeChangeUpdateInited: boolean = false;
    playerReadyInited: boolean = false;
    detailInfoForUpdate = null;
    private _service: any;


    @ViewChild('detailVideo', {static: false}) public detailVideo;
    @ViewChild('accordionsBlock', {static: false}) public accordionsBlock;

    constructor(public route: ActivatedRoute,
                public location: Location,
                public storage: SessionStorageService,
                public router: Router,
                public translate: TranslateService,
                public injector: Injector,
                protected notificationService: NotificationService) {
    }
    // config
    get config(): any {
        return this._config;
    }

    set config(_config: any) {
        this._config = _config;
    }

    // service
    get service(): any {
        return this.config.options.service;
    }

    set service(_service: any) {
        this._service = _service;
    }

    isEmptyOverlay(): boolean {
        return this.detailInfoForUpdate && this.detailInfoForUpdate.ID ? false : true;
    }

    getEmptyOverlayText(): string {
        return this.translate.instant('details_item.select_item');
    }

    init(router): Observable<Subscription> {
        let self = this;
        this.r_params = router.params;
        return Observable.create((observer) => {
            if (this.config.options.needApi) {
                this.service.getDetails(
                    this.getDetailId(),
                    this.config.options.appSettings.getSubtypes(),
                    this.config.options.typeDetails,
                    this.config.options.detailsviewType
                ).pipe(
                    takeUntil(this.config.moduleContext.destroyed$)
                ).subscribe(
                        (resp: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                            let bufArr = resp[1].TabsData.concat(this.config.options.tabsData);
                            debugger
                            self.tabsData = bufArr.map((val, idx)=>{
                                return {
                                    FriendlyName: null,
                                    Priority: 0,
                                    Type: val
                                };
                            });
                            self.tabsData.forEach(function (el, ind) {
                                el.id = ind;
                                if (ind === 0) {
                                    el.active = true;
                                }
                                el.hide = !self.config.options.appSettings.checkTabExist(el.Type);
                                el.title = el.Type;
                            });
                            self.file = resp[0];
                            if (!self.file || !self.checkObjectExistance(self.file)) { // not found
                                self.config.moduleContext._isError({status: 404});
                                console.error('Failed', 'Item does not exist');
                                observer.complete();
                            } else {
                                Cookie.set('id', self.file['ID'], 1, '/');
                                // todo
                                this.config.options.columnData = resp[1].Groups;
                                observer.next({file: self.file, tabs: self.tabsData});
                            }
                        },
                        (error) => {
                            self.config.moduleContext._isError(error);
                            console.error('Failed', error);
                            observer.error();
                        }, () => {
                            observer.complete();
                        }
                    );
            } else {
                this.config.options.file = this.config.options.data.detailInfo;
                Cookie.set('id', this.config.options.file['ID'], 1, '/');
                this.getColumnData();

                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                        observer.next({file: this.config.options.file, tabs: []});
                        observer.complete();
                    // });
            }
        });
    }

    commonDetailInit(firstInit, ready?: EventEmitter<any>) {
        let self = this;
        //this.config.componentContext = this;
        this.config.options.typeDetailsLocal = this.config.options.typeDetailsLocal || this.config.options.typeDetails.replace('-', '_');

        if (!!this.config.options.data.detailInfo || this.config.options.needApi) {
            let di = this.config.options.data.detailInfo;
            this.init(this.config.moduleContext.router).subscribe(
                (resp) => {
                    this.config.options.file = resp['file'];
                    console.log(resp);
                    this.config.options.subtitles = null;
                    // if (di && di.ID !== this.lastDetailId) {

                    // }
                    let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
                    if (this.config.options.file['MEDIA_TYPE'] != undefined && this.config.options.file['MEDIA_TYPE'] == mediaSubtypes.Subtile) {
                        this.service.getPacSubtitles(this.config.options.file.ID).pipe(
                            takeUntil(this.config.moduleContext.destroyed$)
                        ).subscribe((res: Array<MediaDetailPacSubtitlesResponse>) => {
                                    this.config.options.pacsubtitles = res;
                                    let config = this.config;
                                    let moduleContext = this.config.moduleContext;
                                    let golden = this.config.moduleContext.golden;
                                    golden && golden.setPacSubtitles(this.config.options.pacsubtitles);
                                    moduleContext.cd.markForCheck();
                                },
                                (error) => {
                                    let message = this.translate.instant('details_item.subtitles_not_found');
                                    this.notificationService.notifyShow(2, message, false);
                                });
                    }
                    if (this.config.options.file['MEDIA_TYPE'] == mediaSubtypes.Media || this.config.options.file['MEDIA_TYPE'] == mediaSubtypes.Audio) {
                        this.service.getSubtitles(this.config.options.file.ID).pipe(
                            takeUntil(this.config.moduleContext.destroyed$)
                        ).subscribe((res: Array<MediaDetailMediaCaptionsResponse>) => {
                                    this.config.options.subtitles = res;
                                    let config = this.config;
                                    let moduleContext = this.config.moduleContext;
                                    let golden = this.config.moduleContext.golden;
                                    (golden && golden.subtitlesGrid) && golden.setSubtitles(
                                        this.config.options.subtitles
                                    );
                                    moduleContext.cd.markForCheck();
                                },
                                (error) => {
                                    let message = this.translate.instant('details_item.subtitles_not_found');
                                    this.notificationService.notifyShow(2, message, false);
                                });
                    }
                    this.config.options.tabsData = $.extend(
                        true,
                        this.config.options.tabsData,
                        resp['tabs']
                    );
                    this.setVideoBlock();

                    // get thumb url
                    this.config.options.file = this.config.componentContext.detailThumbProvider.buildURL(
                        this.config.options.file,
                        this.config.options.appSettings
                    );
                    this.goldenConfig = $.extend(true, {},this.moduleContext ? this.moduleContext.defaultGoldenConfig : {}, {
                        moduleContext: this,
                        appSettings: this.config.options.appSettings,
                        providerType: this.config.providerType,
                        options: {
                            file: this.config.options.file || {},
                            columnData: this.config.options.columnData,
                            lookup: this.config.options.friendlyNamesForDetail,
                            typeDetailsLocal: this.config.options.typeDetailsLocal,
                            typeDetails: this.config.options.typeDetails,
                            tabs: this.config.options.tabsData,
                            params: this.config.options.mediaParams,
                            layoutConfig: this.config.layoutConfig
                        },
                    });
                    this.config.moduleContext.cd.markForCheck();
                    if (!firstInit) {
                        this.config.moduleContext.golden && this.config.moduleContext.golden.changeLayout.emit(this.goldenConfig.options.file);
                    }
                    if (!!ready) {
                        ready.emit(resp['file']);
                    }
                },
                (error) => {
                    console.error('Failed', error);
                }
            );
        }
    }

    prepareVideoBlock(file?: any) {
        this.config.options.mediaParams.mediaType = '';
        this.config.options.mediaParams.addMedia = false;
        return file['MEDIA_TYPE'];
    }

    calcTotalDuration(tcf) {
        let summ = 0;
        let timecodeFormat = TimeCodeFormat[tcf];
        let faults = this.config.file['Segments'];
        faults.forEach(el => {
            summ += TMDTimecode.fromString(el.DURATION_text, timecodeFormat).toFrames();
        });
        return TMDTimecode.fromFrames(summ, timecodeFormat).toString();
    }

    /**
     *Set video block visible
     *
     */
    setVideoBlock(_file?: any) {
        let file = _file||this.config.options.file;
        const mType = this.prepareVideoBlock(file)
        const mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();

        if (this.checkObjectExistance(mediaSubtypes) || (!!file.IsLive)) {
            if ((typeof(file['PROXY_URL']) == 'string' && file['PROXY_URL'].match(/(?:http)|(?:https)/g)) || (file.IsLive ? true : false) || (file.UsePresignedUrl ? true : false)) {
                this.config.options.mediaParams.addMedia = true;
                if (mType == mediaSubtypes.Media || mType == mediaSubtypes.Audio || (file.IsLive ? true : false)) {
                    this.config.options.mediaParams.mediaType = 'htmlPlayer';
                }
                else if (mType == mediaSubtypes.Image) {
                    let fileExtension = file.PROXY_URL.split('/').pop().split('?')[0].match(/\.[0-9A-Za-z]+$/g);
                    if (fileExtension && fileExtension[0].toLocaleLowerCase() == '.tif' ||
                        fileExtension && fileExtension[0].toLocaleLowerCase() == '.tiff') {
                        this.config.options.mediaParams.mediaType = 'tifViewer';
                    }
                    else if (fileExtension && fileExtension[0].toLocaleLowerCase() === '.tga') {
                        this.config.options.mediaParams.mediaType = 'tgaViewer';
                    }
                    else {
                        this.config.options.mediaParams.mediaType = 'image';
                    }
                }
                else if (mediaSubtypes.Doc.filter(el => {
                    return el === mType;
                }).length > 0) {
                    let fileExtension = file['PROXY_URL'].split('/').pop().split('?')[0].match(/\.[0-9A-Za-z]+$/g);
                    switch (fileExtension[0].toLocaleLowerCase()) {
                        case '.tif': {
                            this.config.options.mediaParams.mediaType = 'tifViewer';
                            break;
                        }
                        case '.tiff': {
                            this.config.options.mediaParams.mediaType = 'tifViewer';
                            break;
                        }
                        case '.tga': {
                            this.config.options.mediaParams.mediaType = 'tgaViewer';
                            break;
                        }
                        case '.docx': {
                            this.config.options.mediaParams.mediaType = 'docxViewer';
                            break;
                        }
                        case '.pdf': {
                            this.config.options.mediaParams.mediaType = 'pdfViewer';
                            break;
                        }
                        case '.xml': {
                            this.config.options.mediaParams.mediaType = 'xmlViewer';
                            break;
                        }
                        case '.json': {
                            this.config.options.mediaParams.mediaType = 'jsonViewer';
                            break;
                        }
                        case '.swf': {
                            this.config.options.mediaParams.mediaType = 'flashPlayerViewer';
                            break;
                        }
                        default: {
                            this.config.options.mediaParams.mediaType = 'downloadFileViewer';
                            break;
                        }
                    }
                }else if (mType == mediaSubtypes.Subtile) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'subtitle';
                }
            }
            else { // if media block must to say 'not available'
                if (mType == mediaSubtypes.Media || mType == mediaSubtypes.Audio || mType == mediaSubtypes.Image || mediaSubtypes.Doc.filter(el => {
                    return el === mType;
                }).length > 0) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'defaultViewer';
                }
                else if (mType == mediaSubtypes.Subtile) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'subtitle';
                }
            }
            if (!file || Object.keys(file).length === 0) {
                this.config.options.mediaParams.addMedia = true;
                this.config.options.mediaParams.mediaType = 'defaultViewer';
            }
            return this.config.options.mediaParams;
        }
    };

    /**
     * Calling on Back button clicking. Go back to Media page
     */
    clickBack() {
        this.location.back();
    };

    getDetailId(): any {
        return decodeURIComponent(this.route.params['_value'].id).split(',')[0];
    };

    /**
     * Refresh video player
     */
    refreshVideo() {
        return this.detailVideo && this.detailVideo.refresh(this.config.options.file['PROXY_URL']);
    };

    /**
     * Get friendly names from storage (if not -> load&save)
     */
    getColumnsFriendlyNames() {
        this.service.getLookups(this.config.options.friendlyNamesForDetail).subscribe(
            (resp) => {
                this.config.options.userFriendlyNames = resp;
                this.config.moduleContext.cd.markForCheck();
            }
        );
    };

    /*
     * Check file properties
     */
    checkDetailExistance(file): boolean {
        if (file['ID'] != undefined) {
            return true;
        }
        return false;
    };

    /*
     * Check object properties
     */
    checkObjectExistance(obj): boolean {
        if (Object.keys(obj).length) {
            return true;
        }
        return false;
    };

    /*
     * Load detail view from REST or from session
     */
    getColumnData(): any {
        if (this.config.options.detailsviewType) {
            let self = this;
            let view_id = this.config.options.appSettings.getSubtype(this.config.options.file['MEDIA_TYPE']) || 0;
            this.service.getDetailsView(view_id, this.config.options.detailsviewType).subscribe(
                (resp: MediaDetailDetailsViewResponse) => {
                    self.config.options.columnData = resp.Groups;
                    self.config.moduleContext.accordion.refresh(this.config.options.file, self.config.options.columnData, resp.Groups);
                });

        }
    };

    save(){}
    // deep copy object
    _deepCopy(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this._deepCopy(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = Object.create(obj);
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this._deepCopy(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type is not supported.');
    }

    getIsReady(): boolean{
        return (this.config) ? this.config.moduleContext.isReady : false;
    }

    updateAndSaveMediaItems(data?): Observable<Subscription> {
        return new Observable((observer) => {
            observer.complete();
        });
    }
}
