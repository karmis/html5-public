import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
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
import { Subject } from "rxjs";
import { IMFXRouteReuseStrategy } from '../../../../strategies/route.reuse.strategy';
import { GoldenProvider } from "../../../../modules/search/detail/providers/gl.provider";
import { DetailService } from "../../../../modules/search/detail/services/detail.service";
import { DetailConfig } from "../../../../modules/search/detail/detail.config";
import {
    MediaDetailDetailsViewResponse
} from "../../../../models/media/detail/detailsview/media.detail.detailsview.response";
import { MediaAppSettings } from "../../../media/constants/constants";
import { ComponentQCProvider } from "./providers/component.qc.provider";
import { ComponentQCService } from "./services/component.qc.service";
import { LocalStorageService } from "ngx-webstorage";
import { WorkflowService } from "../../../../services/workflow/workflow.service";
import { TasksControlButtonsComponent } from "../../../../modules/search/tasks-control-buttons/tcb";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { LayoutType } from "../../../../modules/controls/layout.manager/models/layout.manager.model";
import { JobStatuses } from "../../../workflow/constants/job.statuses";
import { DetailsSharedComponent } from '../shared/details.shared.component';

@Component({
    moduleId: 'component-qc-details',
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
        ComponentQCProvider,
        ComponentQCService,
        {provide: DetailService, useClass: ComponentQCService},
    ],
})
export class ComponentQcDetailsComponent extends DetailsSharedComponent {
    @ViewChild('tasksControlButtons', {static: false}) tasksControlButtons: TasksControlButtonsComponent;
    friendlyNamesForJobDetail = 'FriendlyNames.TM_MJOB';
    customMediaStatusLookups: any;
    commonUpdateDetailSubject: Subject<void> = new Subject<void>();
    @ViewChild('componentqc', {static: false}) private componentqc: any;
    public config = <DetailConfig>{
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
            typeDetailsLocal: 'simple_assessment',
            providerDetailData: <any>null,
            provider: <ComponentQCProvider>null,
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
            typeDetailsLocal: 'simple_assessment',
            typeDetails: <string>null,
            tabs: [],
            params: <any>null,
            series: <any>null,
            titleForStorage: 'component_qc',
            useMediaItems: true //toDo hardcode for px-3562
        }
    };
    public goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);
    public details: any;
    public mediaItems: Array<any>;
    public taskCallback: any = {
        btnComp: {
            callback: this.beforeChangeTaskStatus,
            context: this
        }
    };
    public layoutType: LayoutType;

    constructor(public cdr: ChangeDetectorRef,
                public workflowService: WorkflowService,
                public detailService: ComponentQCService,
                public splashProvider: SplashProvider,
                public route: ActivatedRoute,
                public router: Router,
                public location: Location,
                public injector: Injector,
                public translate: TranslateService,
                public appSettings: MediaAppSettings,
                public detailProvider: ComponentQCProvider,
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

    ngAfterViewInit() {
        let self = this;
        if (!self.checkId) {
            super.ngAfterViewInit()
            this.config.options.provider.config = this.config;
            this.routerChangeSubscriver = this.router.events.subscribe(event => {
                if (event instanceof RoutesRecognized && event.url.indexOf('/component-qc/') > -1) {
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
            (<any>this.glComponent).setReadOnlyMode();
        });
    }

    commonInit() {
        this.config.options.showGolden = false;
        this.config.options.provider.config = this.config;
        // this.workflowService.getWorkflowDetails(this.route.snapshot.params['id']).subscribe((res: any) => {
        this.config.options.service.getDetails(this.route.snapshot.params['id'],
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            'Job').subscribe((resp: any) => {
            if (!Array.isArray(resp[0].ComponentsMedia) || resp[0].ComponentsMedia.length == 0) {
                this.error = true;
                this.isErrorMoreInfo = false;
                this.text = this.translate.instant('component_qc.missing_media');
                this.splashProvider.onHideSpinner.emit();
                if (!this.cdr['destroyed']) {
                    this.cdr.detectChanges();
                }
                return;
            }

            this.savingModel = [resp[0]].map(el => {
                return {
                    Job: el.Job,
                    Task: el.Task,
                    Media: el.Media,
                    ComponentsMedia: el.ComponentsMedia,
                    UserTaskNotes: el.UserTaskNotes
                };
            })[0];
            this.layoutType = this.getTaskSubtype() == 'componentsassess' ? LayoutType.ComponentQC : LayoutType.SubtitlesQC;
            this.config.options.file = resp[0]['Media'] || {};
            this.customMediaStatusLookups = resp[0]['CustomMediaStatusLookups'];
            this.taskStatus = this.savingModel.Task.TSK_STATUS;
            this.subtitles = resp[0].ComponentsMedia.map(function (el) {
                return {
                    mediaId: el.MediaItem.ID,
                    notes: el.Notes,
                    subtitles: Array.isArray(el.Subtitles)
                        ? el.Subtitles.map(function (elem) {
                            return {
                                In: elem.StartTc,
                                InMs: elem.Start,
                                Out: elem.EndTc,
                                OutMs: elem.End,
                                Text: elem.Text
                            };
                        })
                        : []
                };
            });
            this.mediaItems = resp[0].ComponentsMedia.map(function (el) {
                return el.MediaItem
            });
            this.taskId = this.savingModel.Task.ID;
            super.setStatuses();
            this.setThumb(this.config.options.file);
            // load media details view for friendly names
            const viewId = this.config.options.appSettings.getSubtype(this.config.options.file['MEDIA_TYPE']) || 0;
            this.config.options.service.getDetailsView(
                viewId,
                this.config.options.detailsviewType).subscribe(
                (res: (MediaDetailDetailsViewResponse)) => {
                    this.config.options.provider.setVideoBlock(this.config.options.file);
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
                            titleForStorage: this.getTaskSubtype() == 'componentsassess' ? 'component_qc' : 'subtitles_qc',
                            series: [],
                            jobColumnData: resp[1].Groups,
                            jobLookup: this.friendlyNamesForJobDetail,
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
                    Media: el.Media,
                    ComponentsMedia: el.ComponentsMedia,
                    UserTaskNotes: el.UserTaskNotes
                };
            })[0];
            super.commonUpdateDetail();
        })
    }
}
