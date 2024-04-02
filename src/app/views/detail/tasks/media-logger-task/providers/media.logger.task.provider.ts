import { EventEmitter, Inject, Injector, Output } from '@angular/core';
import { ConfigService } from '../../../../../services/config/config.service';
import { DetailConfig } from '../../../../../modules/search/detail/detail.config';
import { TaxonomyService } from '../../../../../modules/search/taxonomy/services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from "ngx-webstorage";
import { Location } from '@angular/common';
import { MediaDetailResponse } from '../../../../../models/media/detail/media.detail.response';
import { MediaDetailDetailsViewResponse } from '../../../../../models/media/detail/detailsview/media.detail.detailsview.response';
import { TranslateService } from '@ngx-translate/core';
import { MediaLoggerProvider } from '../../../../media-logger/providers/media.logger.provider';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { NotificationService } from '../../../../../modules/notification/services/notification.service';
import { ValidFields } from "../constants/valid.fields";
import { takeUntil } from "rxjs/operators";
import { DetailService } from '../../../../../modules/search/detail/services/detail.service';

export class MediaLoggerTaskProvider extends MediaLoggerProvider {
    saveAssessment: Subject<any> = new Subject();
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
    customMediaStatusLookups: any;
    taxonomySettings: any
    commonUpdateDetailSubject: Subject<void> = new Subject();

    constructor(@Inject(TaxonomyService) public taxonomyService: TaxonomyService,
                @Inject(ActivatedRoute) public route: ActivatedRoute,
                @Inject(Location) public location: Location,
                @Inject(SessionStorageService) public storage: SessionStorageService,
                @Inject(Router) public router: Router,
                @Inject(TranslateService) public translate: TranslateService,
                @Inject(Injector) public injector: Injector,
                protected notificationService: NotificationService) {
        super(taxonomyService, route, location, storage, router, translate, injector, notificationService);

        this.commonUpdateDetailSubject.subscribe(() => {
            this.commonUpdateDetail();
        })
    }

    commonDetailInit() {
        // request for init cache
        this.taxonomyService.getTaxonomy().subscribe();
        this.moduleContext.config.options.allRequetsReady = 0;

        this.itemsMediaList = [];
        this.series = [];
        this.config.options.service.getDetails(
            this.getDetailId(),
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job'
        ).pipe(
            takeUntil(this.moduleContext.destroyed$)
        ).subscribe(
            (res: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                this.taskFile = (<any>res[0]).Task;
                this.jobFile = (<any>res[0]).Job;
                this.jobFileColumnData = res[1].Groups;
                this.customMediaStatusLookups = (<any>res[0]).CustomMediaStatusLookups;
                this.taxonomySettings = (res[0] as any).Task.TechReport.Settings.General.TaxonomySettings;
                this.setTaskStatus.emit({
                    taskStatus: this.taskFile.TSK_STATUS,
                    taskId: this.taskFile.ID,
                    statusText: this.taskFile.TSK_STATUS_text,
                    lockedBy: this.taskFile.LOCKED_BY
                });
                this.config.options.service.getDetails(
                    (<any>res[0]).MediaIds[0],
                    this.config.options.appSettings.getSubtypes(),
                    'media-details',
                    this.config.options.detailsviewType).subscribe(
                    (resp: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                        this.config.options.file = resp[0];
                        // this.itemsMediaList.unshift(this.config.options.file);
                        this.setThumb(this.config.options.file);

                        this.config.options.provider.setVideoBlock();

                        for (let i = 1; i < (<any>res[0]).MediaIds.length; i++) {
                            this.config.options.service.getDetail((<any>res[0]).MediaIds[i], 'media-details').subscribe(
                                (responce) => {
                                    this.itemsMediaList.push(responce);
                                });
                        }
                        this.moduleContext.goldenConfig = $.extend(true, {}, this.moduleContext.defaultGoldenConfig, {
                            componentContext: <any>null,
                            moduleContext: this,
                            appSettings: this.config.options.appSettings,
                            options: {
                                file: this.config.options.file || {},
                                columnData: resp[1].Groups,
                                lookup: this.config.options.friendlyNamesForDetail,
                                typeDetailsLocal: this.config.options.typeDetailsLocal,
                                typeDetails: this.config.options.typeDetails,
                                tabs: this.config.options.tabsData,
                                params: this.config.options.mediaParams,
                                layoutConfig: this.config.layoutConfig,
                                titleForStorage: 'taskMediaLogger',
                                series: []
                            },
                        });


                        this.moduleContext.glTaskLogger && this.moduleContext.glTaskLogger.changeLayout.emit(this.moduleContext.goldenConfig.options.file);
                        this.moduleContext.cd.markForCheck();
                        this.moduleContext.cd.detectChanges();

                        //use glTaskLogger.config by the reason non-immutable
                        this.itemsMediaList.unshift(this.moduleContext.glTaskLogger.config.options.file);
                        console.log('Done');
                    },
                    (error) => {
                        this.moduleContext._isError(error);
                        console.error('Failed', error);
                    }
                );
            });
        this.getColumnsFriendlyNames();
    }

    commonUpdateDetail() {
        // load job and media items
        let service = this.config.options.service;
        (<DetailService>service).getAssessDetailsAsync(
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
        this.moduleContext.goldenConfig.options.friendlyNames = names;
        this.moduleContext.cd.detectChanges();
    };

    /**
     * updateAndSaveMediaItems - base method from DetailService
     * @param data
     */
    updateAndSaveMediaItems(data): Observable<Subscription> {
        return new Observable((observer: any) => {
            let isValid = true;
            if (data.isCompletedStatus) {
                this.itemsMediaList.forEach(mediaItem => {
                    isValid = isValid && this.getValidation(mediaItem, ValidFields);
                });
            }

            if (isValid) {
                this.moduleContext.onSaveLogger.next(); // say golden save locators
                this.moduleContext.dataChanged = false;
                this.save().subscribe((res: any) => {
                    observer.next(res);
                }, (err) => {
                    let message = this.translate.instant('media_logger.invalid_save');
                    this.notificationRef.notifyShow(2, message);
                    observer.next(false);
                    observer.complete();
                }, () => {
                    observer.complete();
                });
            } else {
                // this.moduleContext.onErrorSaveAssessment.next();
                let message = this.translate.instant('media_logger.invalid_save');
                this.notificationRef.notifyShow(2, message);
                observer.next(false);
                observer.complete();
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
            let requests = {};
            this.itemsMediaList.forEach((mediaItem, key) => {
                let req = this.config.options.service.save(this.getDetailId(), mediaItem);
                requests[key] = req;
            });

            let c: Observable<any> = forkJoin(requests);
            c.subscribe((res: any) => {
                observer.next(true);
                let message = this.translate.instant('media_logger.success_save');
                this.notificationRef.notifyShow(1, message);
            }, (err) => {
                observer.error(err);
                let message = this.translate.instant('media_logger.error_save');
                this.notificationRef.notifyShow(2, message);
            }, () => {
                observer.complete();
            });
        });
    }
}
