import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ConfigService } from '../../../../services/config/config.service';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { Location } from '@angular/common';
import { SplashProvider } from '../../../../providers/design/splash.provider';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from "rxjs";
import { IMFXRouteReuseStrategy } from '../../../../strategies/route.reuse.strategy';
import { GoldenProvider } from "../../../../modules/search/detail/providers/gl.provider";
import { DetailService } from "../../../../modules/search/detail/services/detail.service";
import { DetailConfig } from "../../../../modules/search/detail/detail.config";
import {
    MediaDetailDetailsViewResponse
} from "../../../../models/media/detail/detailsview/media.detail.detailsview.response";
import { MediaAppSettings } from "../../../media/constants/constants";
import { OutgestDetailProvider } from "./providers/outgest.detail.provider";
import { OutgestDetailService } from "./services/outgest.detail.service";
import { LocalStorageService } from "ngx-webstorage";
import { WorkflowService } from "../../../../services/workflow/workflow.service";
import { TasksControlButtonsComponent } from "../../../../modules/search/tasks-control-buttons/tcb";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { LayoutType } from "../../../../modules/controls/layout.manager/models/layout.manager.model";
import { JobStatuses } from "../../../workflow/constants/job.statuses";
import { DetailsSharedComponent } from '../shared/details.shared.component';

@Component({
    moduleId: 'outgest-details',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../modules/search/detail/styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        WorkflowService,
        DetailService,
        MediaAppSettings,
        GoldenProvider,
        OutgestDetailProvider,
        OutgestDetailService,
        {provide: DetailService, useClass: OutgestDetailService},
    ],
})
export class OutgestDetailComponent extends DetailsSharedComponent {
    @ViewChild('glOutgest', {static: false}) glOutgest: ElementRef;
    @ViewChild('tasksControlButtons', {static: false}) tasksControlButtons: TasksControlButtonsComponent;
    reloadTaskStatus: Subject<any> = new Subject();
    friendlyNamesForJobDetail = 'FriendlyNames.TM_MJOB';
    customMediaStatusLookups: any;
    playbackDeviceGroupId: null;
    public checkId: any;
    commonUpdateDetailSubject: Subject<void> = new Subject<void>();
    @ViewChild('outgestEl', {static: false}) private outgestEl: any;
    private config = <DetailConfig>{
        componentContext: <any>null,
        options: {
            _accordions: [],
            tabsData: [],
            file: {},
            userFriendlyNames: {},
            mediaParams: {
                addPlayer: false,
                addMedia: true,
                addImage: false,
                showAllProperties: false,
                isSmoothStreaming: false,
                mediaType: ''
            },
            typeDetailsLocal: 'outgest',
            providerDetailData: <any>null,
            provider: <OutgestDetailProvider>null,
            service: <DetailService>null,
            data: <any>null,
            detailCtx: this,
            typeDetails: 'media-details',
            detailsviewType: 'MediaDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            showGolden: false,
            defaultThumb: './assets/img/default-thumb.png',
            clipBtns: false,
            disabledClipBtns: true
        },
        moduleContext: this,
        providerType: GoldenProvider
    };
    private defaultGoldenConfig = {
        componentContext: this,
        appSettings: <any>null,
        providerType: <GoldenProvider>null,
        options: {
            file: {},
            groups: [],
            friendlyNames: {},
            typeDetailsLocal: 'outgest',
            typeDetails: <string>null,
            tabs: [],
            params: <any>null,
            series: <any>null,
            titleForStorage: 'outgest',
            useMediaItems: true //toDo hardcode for px-3562
        }
    };
    private goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);
    private details: any;
    itemsMediaList: Array<any>;
    private taskCallback: any = {
        btnComp: {
            callback: this.beforeChangeTaskStatus,
            context: this
        }
    };
    private layoutType: LayoutType;

    constructor(public cdr: ChangeDetectorRef,
                public workflowService: WorkflowService,
                public detailService: OutgestDetailService,
                public splashProvider: SplashProvider,
                public route: ActivatedRoute,
                public router: Router,
                public location: Location,
                public injector: Injector,
                public translate: TranslateService,
                public appSettings: MediaAppSettings,
                public detailProvider: OutgestDetailProvider,
                public localStorage: LocalStorageService,
                @Inject(NotificationService) public notificationRef: NotificationService) {
        super(cdr,
            workflowService,
            detailService,
            splashProvider,
            route,
            router,
            location,
            injector,
            translate,
            appSettings,
            detailProvider,
            localStorage,
            notificationRef);

        this.config.options.provider = this.detailProvider;
        this.config.options.service = this.detailService;
        this.config.options.appSettings = this.appSettings;

        this.commonUpdateDetailSubject.subscribe(() => {
            this.commonUpdateDetail();
        })
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    clickBack() {
        this.location.back();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.parametersObservable != null) {
            this.parametersObservable.unsubscribe();
        }
        if (this.routerChangeSubscriver != null) {
            this.routerChangeSubscriver.unsubscribe();
        }
    }

    ngAfterViewInit() {
        let self = this;
        if (!self.checkId) {
            if (this.parametersObservable != null) {
                this.parametersObservable.unsubscribe();
            }
            this.config.options.provider.config = this.config;
            if (this.parametersObservable == null) {
                this.parametersObservable = this.route.params.subscribe(params => {
                    if (params['id']) {
                        self.checkId = params['id'];
                    }
                });
            }
            if (this.routerChangeSubscriver != null) {
                this.routerChangeSubscriver.unsubscribe();
            }
            this.routerChangeSubscriver = this.router.events.subscribe(event => {
                if (event instanceof RoutesRecognized && event.url.indexOf('/outgest/') > -1) {
                    let first = event.state.root.firstChild.firstChild;
                    let id = first && event.state.root.firstChild.firstChild.params['id'];
                    if (id != self.checkId) {
                        self.checkId = id;
                        new Promise((resolve, reject) => {
                            resolve();
                        }).then(
                            () => {
                                self.commonInit();
                            },
                            (err) => {
                                console.log(err);
                            }
                        );
                    }
                }
            });
        }
        this.commonInit();
        this.tasksControlButtons.onSavedStatus.subscribe((res: any) => {
            this.savingModel.Task.TSK_STATUS = res.status;
            this.savingModel.Task.LOCKED_BY = res.lockedBy;
            let data = this.localStorage.retrieve('permissions');
            this.isSaveButtonDisabled = (res.status !== JobStatuses.INPROG) || (res.lockedBy !== data.FullName);
            (<any>this.glOutgest).setReadOnlyMode();
        });
    }

    commonInit() {
        this.config.options.showGolden = false;
        this.config.options.provider.config = this.config;
        this.itemsMediaList = [];
        // this.workflowService.getWorkflowDetails(this.route.snapshot.params['id']).subscribe((res: any) => {
        this.config.options.service.getDetails(this.route.snapshot.params['id'],
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job').subscribe((resp: any) => {

            this.itemsMediaList = resp[0].Medias;
            this.playbackDeviceGroupId = resp[0].PlaybackDeviceGroupId;

            this.savingModel = [resp[0]].map(el => {
                return {
                    Job: el.Job,
                    Task: el.Task,
                    Medias: el.Medias,
                    UserTaskNotes: el.UserTaskNotes
                };
            })[0];
            this.layoutType = LayoutType.Outgest;
            this.customMediaStatusLookups = resp[0]['CustomMediaStatusLookups'];
            this.taskStatus = this.savingModel.Task.TSK_STATUS;

            this.config.options.file = resp[0]['Medias'][0] || {};

            this.taskId = this.savingModel.Task.ID;
            super.setStatuses();


            // this.setThumb(this.config.options.file);

            // load media details view for friendly names
            const viewId = this.config.options.appSettings.getSubtype(this.config.options.file['MEDIA_TYPE']) || 0;
            this.config.options.service.getDetailsView(
                viewId,
                this.config.options.detailsviewType).subscribe(
                (res: (MediaDetailDetailsViewResponse)) => {

                    // this.config.options.provider.setVideoBlock(this.config.options.file);

                    this.goldenConfig = $.extend(true, this.goldenConfig, {
                        componentContext: <any>null,
                        moduleContext: this,
                        appSettings: this.config.options.appSettings,
                        providerType: this.config.providerType,
                        options: {
                            file: this.config.options.file || {},
                            columnData: res.Groups,
                            lookup: this.config.options.friendlyNamesForDetail,
                            typeDetailsLocal: this.config.options.typeDetailsLocal,
                            typeDetails: this.config.options.typeDetails,
                            tabs: this.config.options.tabsData,
                            params: this.config.options.mediaParams,
                            layoutConfig: this.config.layoutConfig,
                            titleForStorage: 'outgest',
                            series: [],
                            jobColumnData: resp[1].Groups,
                            jobLookup: this.friendlyNamesForJobDetail,
                            // firstLoadReadOnly: this.moduleContext.isSaveButtonDisabled // readOnly = true, if locked user != current user
                        }
                    });
                    this.config.options.showGolden = true;
                    this.cdr.markForCheck();
                }
            );
            this.cdr.markForCheck();
        }, (error) => {
            this._isError(error);
        });
    };

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

    onSave() {
        this.save().subscribe((res: any) => {
            this.isSaveButtonDisabled = res;
        });
    }

    save() {
        return new Observable((observer: any) => {

            //todo remove temporary
            // let message = this.translate.instant('component_qc.error_save');
            // this.notificationRef.notifyShow(2, message);
            // observer.next(false);
            // observer.complete();
            this.savingModel.Medias.forEach(el => {
                if (el.ACCEPTANCE_LTTR_ID == 0) {
                    el.IsAccepted = null;
                } else if (el.ACCEPTANCE_LTTR_ID == -1) {
                    el.IsAccepted = false;
                } else if (el.ACCEPTANCE_LTTR_ID == 1) {
                    el.IsAccepted = true;
                }
                // el.Notes = this.subtitles.filter(elem => {
                //     return elem.mediaId == el.MediaItem.ID;
                // })[0].notes;
            });
            this.detailService.saveOutgest(this.savingModel).subscribe((res: any) => {
                this.notificationRef.notifyShow(1, this.translate.instant('component_qc.success_save'));
                observer.next(true);
            }, (err) => {
                this.notificationRef.notifyShow(2, this.translate.instant('component_qc.error_save'));
                observer.next(false);
                observer.complete();
            }, () => {
                observer.complete();
            });
        });
    }

    isValidAcceptance() {
        return true;
    }

    isValidCommonCustomStatuses() {
        let validFlag = true;
        let techRep = this.savingModel.Task.TechReport || null;
        let cmss = techRep && techRep.CustomMediaStatusSettings || null;
        let mandatoryCmss = (Array.isArray(cmss))
            ? cmss.filter(el => el.Mandatory)
            : [];

        if (mandatoryCmss.length === 0) {
            return true;
        }

        return validFlag;
    }

    setDataChanged(res) {
        this.isSaveButtonDisabled = !res;
    }

    getTaskSubtype() {
        return (this.savingModel.Task && this.savingModel.Task.TechReport && this.savingModel.Task.TechReport.SubType) || null;
    }

    commonUpdateDetail() {
        this.config.options.service.getDetails(this.route.snapshot.params['id'],
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job').subscribe((resp: any) => {

            this.savingModel = [resp[0]].map(el => {
                return {
                    Job: el.Job,
                    Task: el.Task,
                    Medias: el.Medias,
                    UserTaskNotes: el.UserTaskNotes
                };
            })[0];
            super.commonUpdateDetail();
        })
    }
}
