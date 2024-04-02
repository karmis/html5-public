import { EventEmitter, Inject, Injector, Output } from "@angular/core";
import {DetailProvider} from "../../../../../modules/search/detail/providers/detail.provider";
import { ActivatedRoute, Router } from "@angular/router";
import {SessionStorageService} from "ngx-webstorage";
import {Location} from "@angular/common";
import { TranslateService } from '@ngx-translate/core';
import {Subject, Observable, Subscription} from "rxjs";
import {DetailConfig} from "../../../../../modules/search/detail/detail.config";
import {MediaDetailResponse} from "../../../../../models/media/detail/media.detail.response";
import {MediaDetailDetailsViewResponse} from "../../../../../models/media/detail/detailsview/media.detail.detailsview.response";
import {NotificationService} from "../../../../../modules/notification/services/notification.service";
import {ConfigService} from "../../../../../services/config/config.service";

export class ClipEditorTaskProvider extends DetailProvider  {
    saveAssessment: Subject<any> = new Subject();
    commonUpdateDetailSubject: Subject<void> = new Subject();
    @Output() onSaveAssessment: EventEmitter<any> = new EventEmitter<any>();
    @Output() afterSavedAssessment: EventEmitter<any> = new EventEmitter<any>();
    @Output() setTaskStatus: EventEmitter<any> = new EventEmitter<any>();
    @Output() onGetMediaTaggingForSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSavedMediaTagging: EventEmitter<any> = new EventEmitter<any>();
    config: DetailConfig;
    taskFile: any;
    jobFile: any;
    jobFileColumnData: any;
    itemsMediaList: Array<any>;
    itemsMediaSeries: Array<any>;
    series: Array<any>;
    private defaultGoldenConfig = {
        componentContext: this,
        appSettings: <any>null,
        options: {
            file: {},
            groups: [],
            friendlyNames: {},
            typeDetailsLocal: 'rce',
            typeDetails: <string>null,
            tabs: [],
            params: <any>null,
            series: [],
            titleForStorage: 'taskClipEditor'
        }
    };
    private dataForSave: any = {};

    public goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);

    private defaultThumbnail = null;
    constructor(@Inject(ActivatedRoute) public route: ActivatedRoute,
                @Inject(Location) public location: Location,
                @Inject(SessionStorageService) public storage: SessionStorageService,
                @Inject(Router)public router: Router,
                @Inject(TranslateService)public translate: TranslateService,
                @Inject(Injector)public injector: Injector,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        super(route, location, storage, router, translate, injector, notificationRef);
        this.prapareDefaultThumbnailBase64();
        this.commonUpdateDetailSubject.subscribe(() => {
            this.commonUpdateDetail();
        })
    }

    commonUpdateDetail() {
        this.config.options.service.getDetails(
            this.getDetailId(),
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job').subscribe(
            (res: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                this.taskFile = (<any>res[0]).Task;
                this.setTaskStatus.emit({
                    taskStatus: this.taskFile.TSK_STATUS,
                    taskId: this.taskFile.ID,
                    statusText: this.taskFile.TSK_STATUS_text,
                    lockedBy: this.taskFile.LOCKED_BY
                });
                this.moduleContext.cd.markForCheck();
            })

    }

    public prapareDefaultThumbnailBase64() {
        var canvas = document.createElement("canvas");
        canvas.width = 301;
        canvas.height = 170;
        var ctx = canvas.getContext("2d");

        var image = new Image();
        image.onload = () => {
            ctx.drawImage(image, 0,0, image.width, image.height, 0, 0, image.width, image.height);
            this.defaultThumbnail = canvas.toDataURL("image/png");
        };
        image.src = './assets/img/default-thumb.png';
    }

    commonDetailInit() {
        // request for init cache
        // this.moduleContext.config.options.allRequetsReady = 0;

        this.itemsMediaList = [];
        this.series = [];
        this.config.options.service.getDetails(
            this.getDetailId(),
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job').subscribe(
            (res: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                this.taskFile = (<any>res[0]).Task;
                this.jobFile = (<any>res[0]).Job;
                this.jobFileColumnData = res[1].Groups;
                this.dataForSave = res[0];

                this.setTaskStatus.emit({
                    taskStatus: this.taskFile.TSK_STATUS,
                    taskId: this.taskFile.ID,
                    statusText: this.taskFile.TSK_STATUS_text,
                    lockedBy: this.taskFile.LOCKED_BY
                });

                let clips = this.setClips(res[0]);
                this.config.options.service.getDetails(
                    (<any>res[0]).Media[0].ID,
                    this.config.options.appSettings.getSubtypes(),
                    'media-details',
                    this.config.options.detailsviewType).subscribe(
                    (resp:(MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                        this.config.options.file = resp[0];
                        this.config.componentContext.file = resp[0];
                        this.itemsMediaList.unshift(this.config.options.file);
                        this.setThumb(this.config.options.file);

                        this.config.options.provider.setVideoBlock();

                        for (let i = 1; i < (<any>res[0]).Media.length; i++) {
                            this.config.options.service.getDetail((<any>res[0]).Media[i].ID, 'media-details').subscribe(
                                (responce) => {
                                    this.itemsMediaList.push(responce);
                                });
                        }
                        this.moduleContext.goldenConfig = $.extend(true, {}, this.config.componentContext.defaultGoldenConfig, {
                            componentContext: <any>null,
                            moduleContext: this,
                            appSettings: this.config.options.appSettings,
                            options: {
                                file: this.config.options.file || {},
                                jobFile: this.jobFile,
                                jobFileColumnData: this.jobFileColumnData,
                                columnData: resp[1].Groups,
                                lookup: this.config.options.friendlyNamesForDetail,
                                typeDetailsLocal: this.config.options.typeDetailsLocal,
                                typeDetails: this.config.options.typeDetails,
                                tabs: this.config.options.tabsData,
                                params: this.config.options.mediaParams,
                                layoutConfig: this.config.layoutConfig,
                                titleForStorage: 'taskClipEditor',
                                series: clips
                            },
                        });
                        this.moduleContext.glClipEditor && this.moduleContext.glClipEditor.changeLayout.emit(this.moduleContext.goldenConfig.options.file);
                        this.moduleContext.cd.markForCheck();
                        this.moduleContext.cd.detectChanges();
                    }
                );
            });
        this.getColumnsFriendlyNames();
    }

    setThumb(file) {
        if (Object.keys(file).length === 0) { return; }
        if (file.THUMBID === -1) {
            file.THUMBURL = this.config.options.defaultThumb;
        } else {
            file.THUMBURL = ConfigService.getAppApiUrl() + '/getfile.aspx?id=' + file.THUMBID;
        }
    };

    /**
     * get columns friendly names from rest or storage
     */
    getColumnsFriendlyNames(): any {
        this.config.options.service.getLookups(this.config.options.friendlyNamesForDetail).subscribe(
            (resp) => {
                this.config.options.userFriendlyNames = resp;
                this.setColumnsFriendlyNames(resp);
            }
        );
    };

    setColumnsFriendlyNames(names): any {
        this.goldenConfig.options.friendlyNames = names;
        // this.moduleContext.cd.detectChanges();
    };

    setClips(data) {
        let clips = [];
        if(data.Makes.length > 0) {
            data.Makes.forEach(el => {
                if(el.Clips.length > 0) {
                    el.Clips.forEach(clip => {
                        clips.push({
                                startTimecode: clip.InTimeCodeWithOffsetString,
                                endTimecode: clip.OutTimeCodeWithOffsetString,
                                thumbnail: clip.Thumbnail || this.defaultThumbnail,
                                mediaId: clip.MediaId,
                                comment: clip.Notes,
                                file: data.Media.filter(elem => { return elem.ID == clip.MediaId; })[0]
                            })
                    });
                }
            });
        }
        return clips;
    }
    getDataForSave() {
        return this.dataForSave;
    }
}
