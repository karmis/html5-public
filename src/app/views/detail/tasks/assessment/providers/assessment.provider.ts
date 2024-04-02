import { EventEmitter, Inject, Injector, Output } from "@angular/core";
import { DetailConfig } from "../../../../../modules/search/detail/detail.config";
import { DetailProvider } from "../../../../../modules/search/detail/providers/detail.provider";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionStorageService } from "ngx-webstorage";
import { MediaDetailResponse } from "../../../../../models/media/detail/media.detail.response";
import { MediaDetailDetailsViewResponse } from "../../../../../models/media/detail/detailsview/media.detail.detailsview.response";
import { ConfigService } from "../../../../../services/config/config.service";
import { Location } from '@angular/common';
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { MediaDetailMediaCaptionsResponse } from "../../../../../models/media/detail/caption/media.detail.media.captions.response";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../modules/notification/services/notification.service";
import { ValidFields } from "../constants/valid.fields";
import { IMFXHtmlPlayerComponent } from '../../../../../modules/controls/html.player/imfx.html.player';
import {JobStatuses} from "../../../../tasks/constants/job.statuses";
import { SimpleGoldenComponent } from '../../../../../modules/abstractions/simple.golden.component';

export class AssessmentProvider extends DetailProvider {
    saveAssessment: Subject<any> = new Subject();
    @Output() onGetMediaTaggingForSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSavedMediaTagging: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onErrorSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() afterSavedAssessment: EventEmitter<any> = new EventEmitter<any>();
    @Output() setTaskStatus: EventEmitter<any> = new EventEmitter<any>();
    config: DetailConfig;
    mediaItems: Array<any>;
    jobFile: any;
    taskFile: any;
    UserTaskNotes: any;
    customMediaStatusLookups: any;
    jobFriendlyNames: any;
    jobGroups: Array<any>;
    friendlyNamesForJobDetail = 'FriendlyNames.TM_MJOB';
    selectedMediaItem: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    commonUpdateDetailSubject: Subject<void> = new Subject();
    mediaListUpdateInterval = null;
    moduleContext: SimpleGoldenComponent;
    qcReport: any[] = [];
    constructor(@Inject(ActivatedRoute) public route: ActivatedRoute,
                @Inject(Location) public location: Location,
                @Inject(SessionStorageService) public storage: SessionStorageService,
                @Inject(TranslateService) public translate: TranslateService,
                @Inject(Router) public router: Router,
                public injector: Injector,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        super(route, location, storage, router, translate, injector, notificationRef);

        this.commonUpdateDetailSubject.subscribe(() => {
            this.commonUpdateDetail();
        });
    }

    commonDetailInit() {
        this.moduleContext.config.options.showGolden = false;
        // load job and media items
        let service = this.config.options.service;
        (<any>service).getAssessDetailsAsync(
            this.getDetailId(),
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job',
        ).subscribe(
            (resp: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                debugger
                // (<any>service).getVideoInfo(resp[0]['Medias'][0].ID, {
                //     smudge: true,
                //     scene: true,
                //     waveform: false,
                //     audiovolume: true
                // }).subscribe();
                this.config.options.file = resp[0]['Medias'][0] || {};
                this.jobFile = resp[0]['Job'];
                this.taskFile = resp[0]['Task'];
                this.mediaItems = resp[0]['Medias'];
                this.qcReport = resp[0]['AssistedQcReports']||[];
                if (!this.mediaItems || this.mediaItems.length == 0) { // if media items not found
                    this.moduleContext._isError({status: 404})
                    return;
                }
                this.UserTaskNotes = resp[0]['UserTaskNotes'];
                this.customMediaStatusLookups = resp[0]['CustomMediaStatusLookups'];
                this.setTaskStatus.emit({
                    taskStatus: this.taskFile.TSK_STATUS,
                    taskId: this.taskFile.ID,
                    statusText: this.taskFile.TSK_STATUS_text,
                    lockedBy: this.taskFile.LOCKED_BY
                });
                this.setThumb(this.config.options.file);

                // this.moduleContext.videoInfo = resp[1];
                // load media details view for friendly names
                service.getDetailsViewAndVideoInfo(
                    this.config.options.appSettings.getSubtypes(),
                    this.config.options.detailsviewType, this.config.options.file.ID, {
                        smudge: true,
                        scene: true,
                        waveform: false,
                        audiovolume: true
                    }).subscribe(
                    (res) => {
                        this.moduleContext.videoInfo = res[1];
                        this.config.options.provider.setVideoBlock();
                        this.moduleContext.goldenConfig = $.extend(true, {}, this.moduleContext.defaultGoldenConfig, {
                            componentContext: <any>null,
                            moduleContext: this,
                            appSettings: this.config.options.appSettings,
                            providerType: this.config.providerType,
                            options: {
                                file: this.config.options.file || {},
                                columnData: (<any>res[0]).Groups,
                                lookup: this.config.options.friendlyNamesForDetail,
                                typeDetailsLocal: this.config.options.typeDetailsLocal,
                                typeDetails: this.config.options.typeDetails,
                                tabs: this.config.options.tabsData,
                                params: this.config.options.mediaParams,
                                layoutConfig: this.config.layoutConfig,
                                titleForStorage: 'assessment',
                                series: [],
                                jobColumnData: resp[1].Groups,
                                jobLookup: this.friendlyNamesForJobDetail,
                                firstLoadReadOnly: this.moduleContext.isSaveButtonDisabled // readOnly = true, if locked user != current user
                            },
                        });
                        this.moduleContext.config.options.showGolden = true;
                        if (this.taskFile &&
                            this.taskFile.TechReport &&
                            this.taskFile.TechReport.GangedSettings &&
                            this.taskFile.TechReport.GangedSettings.GangedMediaError &&
                            this.taskFile.TechReport.GangedSettings.GangedMediaError.length > 0) {
                            //this.moduleContext.setControlButtonsReadOnly(); Uncomment for disabling color buttons
                            this.notificationRef.notifyShow(2, this.taskFile.TechReport.GangedSettings.GangedMediaError);
                        }
                        this.moduleContext.cd.markForCheck();
                    }
                );
                this.initializeMediaListRefreshTimer();
                this.moduleContext.cd.markForCheck();
            },
            (error) => {
                this.moduleContext._isError(error);
            }
        );
        this.getColumnsFriendlyNames();
    }

    initializeMediaListRefreshTimer() {
        if(this.taskFile &&
            this.taskFile.TSK_STATUS == JobStatuses.INPROG &&
            this.taskFile.TechReport &&
            this.taskFile.TechReport.Settings &&
            this.taskFile.TechReport.Settings.General &&
            this.taskFile.TechReport.Settings.General.AppendableMediaList) {
            this.mediaListUpdateInterval = setInterval(()=>{
                this.service.refreshMediaItems(this.taskFile.ID, this.mediaItems.map((m)=>m.ID)).subscribe((res)=>{
                    if(this.taskFile.TSK_STATUS != JobStatuses.INPROG)
                        clearInterval(this.mediaListUpdateInterval);
                    if (!(res && res.length > 0)) return;

                    res.forEach((newItem) => {
                        this.moduleContext.glComponent.mediaListComponent.emit('addItem', newItem);
                    });
                });
            }, 5000);
        }
    }

    commonUpdateDetail() {
        // load job and media items
        let service = this.config.options.service;
        (<any>service).getAssessDetailsAsync(
            this.getDetailId(),
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job',
        ).subscribe(
            (resp: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                this.taskFile = resp[0]['Task'];
                this.setTaskStatus.emit({
                    taskStatus: this.taskFile.TSK_STATUS,
                    taskId: this.taskFile.ID,
                    statusText: this.taskFile.TSK_STATUS_text,
                    lockedBy: this.taskFile.LOCKED_BY
                });
                this.moduleContext.cd.markForCheck();
            },
            (error) => {
                this.moduleContext._isError(error);
            }
        );
    }

    setThumb(file) {
        if (Object.keys(file).length === 0) {
            return;
        }
        if (file.THUMBID === -1) {
            file.THUMBURL = this.config.options.defaultThumb;
        } else {
            file.THUMBURL = ConfigService.getAppApiUrl() + '/getfile.aspx?id=' + file.THUMBID;
        }
    };

    /**
     * Calling on Save button clicking.
     */
    getMediaTaggingForSave(): any {
        // this.locatorsProvider.onGetMediaTaggingForSave.emit();
    }

    loadTagging(guid): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.config.options.service.getDetailMediaTagging(guid).subscribe(resp => {
                observer.next(resp);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    loadSubtitles(id): Observable<Array<MediaDetailMediaCaptionsResponse>> {
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        if (this.config.options.file['MEDIA_TYPE'] == mediaSubtypes.Media || this.config.options.file['MEDIA_TYPE'] == mediaSubtypes.Audio) {
            return new Observable((observer: any) => {
                this.config.options.service.getSubtitles(id)
                    .subscribe((res: Array<MediaDetailMediaCaptionsResponse>) => {
                            observer.next(res);
                        },
                        (error) => {
                            observer.error(error);
                            let message = this.translate.instant('details_item.subtitles_not_found');
                            this.notificationRef.notifyShow(2, message, false);
                        }, () => {
                            observer.complete();
                        });
            });
        } else {
            return new Observable((observer: any) => {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next([]);
                observer.complete();
                // });
            });
        }
    };

    updateAndSaveMediaItems(data): Observable<Subscription> {
        return new Observable((observer: any) => {
            if (data == false || data.valid == false) {
                observer.next(false);
                observer.complete();
            } else if (!data.valid && data.save && data.isCompleted) {
                this.moduleContext.onErrorSave.next();
                let message = this.translate.instant('simple_assessment.invalid_save');
                this.notificationRef.notifyShow(2, message);
                observer.next(false);
                observer.complete();
            } else {
                for (let i in this.mediaItems) {
                    if (this.mediaItems[i].ID === data.mediaItem.ID) {
                        this.mediaItems[i] = data.mediaItem;
                    }
                }
                if (data.save) {
                    let isValid = true;
                    if (data.isCompleted) {
                        this.mediaItems.forEach(mediaItem => {
                            if (!(mediaItem.IsGanged && !mediaItem.IsGangedMain)) {
                                isValid = this.getValidation(mediaItem, ValidFields);
                            }
                        });
                    }
                    if (isValid) {
                        this.moduleContext.onSave.next(); // say golden save locators
                        this.moduleContext.dataChanged = false;
                        this.save().subscribe((res: any) => {
                            observer.next(res);
                        }, (err) => {
                            let message = this.translate.instant('simple_assessment.invalid_save');
                            this.notificationRef.notifyShow(2, message);
                            observer.next(false);
                            observer.complete();
                        }, () => {
                            observer.complete();
                        });
                    } else {
                        this.moduleContext.onErrorSave.next();
                        let message = this.translate.instant('simple_assessment.invalid_save');
                        this.notificationRef.notifyShow(2, message);
                        observer.next(false);
                        observer.complete();
                    }
                } else {
                    observer.next(false);
                    observer.complete();
                }
            }
        });
    }

    public getValidation(mediaItem, validFields) {
        let isValid = true;
        for (let prop in validFields) {
            if (typeof validFields[prop] === 'object') {
                if (typeof this[validFields[prop].funcName] === 'function') {
                    //custom validation
                    isValid = this[validFields[prop].funcName](mediaItem[prop]);
                } else {
                    if (Array.isArray(mediaItem[prop])) {
                        for (let e in mediaItem[prop]) {
                            for (let j in validFields[prop]) {
                                isValid = isValid && (mediaItem[prop][e][validFields[prop][j]] !== undefined && mediaItem[prop][e][validFields[prop][j]] !== null);
                            }
                        }
                    }
                }
            } else {
                isValid = isValid && mediaItem[prop] !== null;
            }

            if (!isValid) {
                break;
            }
        }
        return isValid;
    }

    checkValidCustomStatuses(csArr) {
        let cmss = this.taskFile.TechReport.CustomMediaStatusSettings
            , mandarotyArr = (Array.isArray(cmss)) ? cmss.filter(el => el.Mandatory) : []
            , i;

        if (mandarotyArr.length === 0) {
            return true;
        }
        if (!csArr) {
            return false;
        }
        for (i = 0; i < mandarotyArr.length; i++) {
            let res = csArr.find(el => {
                return (el.TypeId === mandarotyArr[i].MediaStatusId)
                    && (!!el.Values.length)
            });
            if (!res) {
                return false;
            }
        }

        return true;
    }

    save(): Observable<Subscription> {
        return new Observable((observer: any) => {
            if (this.moduleContext.glComponent.playerComponents.compRef.instance.clipsProvider) {
                const newSomEom = (this.moduleContext.glComponent.playerComponents.compRef.instance as IMFXHtmlPlayerComponent).clipsProvider.newSomEom;
                this.mediaItems[0].SOM = newSomEom.som.frames;
                this.mediaItems[0].EOM = newSomEom.eom.frames;
            }
            let saveObj = {
                Job: this.jobFile,
                Medias: this.mediaItems,
                Task: this.taskFile,
                UserTaskNotes: this.UserTaskNotes
            };
            this.config.options.service.save(this.getDetailId(), saveObj).subscribe((res: any) => {
                this.afterSavedAssessment.emit(res);
                observer.next(res);
                let message = this.translate.instant('simple_assessment.success_save');
                this.notificationRef.notifyShow(1, message);
            }, (err) => {
                observer.error(err);
                let message = this.translate.instant('simple_assessment.error_save');
                this.notificationRef.notifyShow(2, message);
            }, () => {
                observer.complete();
            });
        });
    }
}
