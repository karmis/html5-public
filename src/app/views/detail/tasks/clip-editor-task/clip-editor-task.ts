import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DetailConfig} from '../../../../modules/search/detail/detail.config';
import {DetailService} from '../../../../modules/search/detail/services/detail.service';
import {NotificationService} from '../../../../modules/notification/services/notification.service';
import {LocatorsProvider} from '../../../../modules/controls/locators/providers/locators.provider';
import {TimecodeProvider} from '../../../../modules/controls/html.player/providers/timecode.provider';
import {TaxonomyService} from '../../../../modules/search/taxonomy/services/service';
import {AudioSynchProvider} from '../../../../modules/controls/html.player/providers/audio.synch.provider';
import {MediaAppSettings} from '../../../media/constants/constants';
import {GLTaskClipEditorComponent} from './gl.component';
import {SimpleListComponent} from '../../../../modules/controls/simple.items.list/simple.items.list';
import {TranslateService} from '@ngx-translate/core';
import {JobStatuses} from '../../../workflow/constants/job.statuses';
import {Observable, Subject, Subscription} from 'rxjs';
import {TasksControlButtonsComponent} from '../../../../modules/search/tasks-control-buttons/tcb';
import {IMFXModalProvider} from '../../../../modules/imfx-modal/proivders/provider';
import {IMFXModalComponent} from '../../../../modules/imfx-modal/imfx-modal';
import {WorkflowAssessmentHistoryModalComponent} from '../assessment/comps/history.modal/workflow.assessment.history.component';
import {MediaLoggerProvider} from '../../../media-logger/providers/media.logger.provider';
import {LocatorsService} from '../../../../modules/controls/locators/services/locators.service';
import {IMFXRouteReuseStrategy} from '../../../../strategies/route.reuse.strategy';
import {GoldenProvider} from '../../../../modules/search/detail/providers/gl.provider';
import {ClipEditorTaskProvider} from "./providers/clip.editor.task.provider";
import {ClipsStorageProvider} from "../../../clip-editor/providers/clips.storage.provider";
import {DetailProvider} from "../../../../modules/search/detail/providers/detail.provider";
import {CETaskService} from './service/clip.editor.task.service';
import {LocalStorageService} from "ngx-webstorage";
import {ModalPreviewPlayerComponent} from "../../../../modules/modal.preview.player/modal.preview.player";
import {SegmentetClipsProvider} from "../../../clip-editor/providers/segmented.clips.provider";
import {TaskClipsProvider} from './providers/task.clips.provider';
import {lazyModules} from "../../../../app.routes";
import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {RCEArraySource, RCESource} from "../../../clip-editor/rce.component";

@Component({
    selector: 'clip-editor-task',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../modules/search/detail/styles/index.scss',
        '../assessment/styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MediaAppSettings,
        DetailService,
        {provide: DetailService, useClass: CETaskService},
        TimecodeProvider,
        TaxonomyService,
        LocatorsProvider,
        AudioSynchProvider,
        SimpleListComponent,
        MediaLoggerProvider,
        LocatorsService,
        GoldenProvider,
        {provide: DetailProvider, useClass: ClipEditorTaskProvider},
        ClipEditorTaskProvider,
        ClipsStorageProvider,
        SegmentetClipsProvider,
        TaskClipsProvider,
        {provide: SegmentetClipsProvider, useClass: TaskClipsProvider}
    ],
    entryComponents: [
        GLTaskClipEditorComponent
    ]
})

export class ClipEditorTaskComponent {
    @ViewChild('tasksControlButtons', {static: false}) tasksControlButtons: TasksControlButtonsComponent;
    @ViewChild('glClipEditor', {static: false}) glClipEditor: GLTaskClipEditorComponent;
    reloadTaskStatus: Subject<any> = new Subject();
    onSaveClips: Subject<any> = new Subject();
    public jobFile: any = {};
    public jobFileColumnData: any;
    public itemsMediaList: Array<any> = [];
    private checkId: any;
    private parametersObservable: any;

    private config = <DetailConfig>{
        componentContext: this,
        options: {
            file: {},
            provider: null,
            needApi: true,
            typeDetails: 'task/clip-editor',
            showInDetailPage: false,
            detailsviewType: 'MediaDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            mediaParams: {
                addPlayer: false,
                addMedia: false,
                addImage: false,
                showAllProperties: false,
                isSmoothStreaming: false,
                mediaType: ''
            }
        },
        providerType: GoldenProvider
    };
    private defaultGoldenConfig = {
        componentContext: this,
        appSettings: <any>null,
        providerType: GoldenProvider,
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
    public goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);
    private taskStatus: number = 0;
    private taskId: number = 0;
    private statusText: string = '';
    private dataChanged: boolean = false;
    private taskLockedBy: string = null;
    private taskCallback: any = {
        btnComp: {
            callback: this.beforeChangeStatus,
            context: this
        }
    };
    private isPopout: boolean = false;
    private isSaveButtonDisabled: boolean = true;
    private isLoading = true;
    constructor(public route: ActivatedRoute,
                protected appSettings: MediaAppSettings,
                private service: DetailService,
                private cd: ChangeDetectorRef,
                private router: Router,
                private translate: TranslateService,
                private injector: Injector,
                private clipEditorTaskProvider: DetailProvider,
                private localStorage: LocalStorageService,
                private segmentetClipsProvider: SegmentetClipsProvider,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                @Inject(LocatorsProvider) public locatorsProvider: LocatorsProvider) {
        this.provider = clipEditorTaskProvider;
        this.provider.moduleContext = this;
        this.config.options.service = this.service;
        this.config.options.appSettings = this.appSettings;
        this.goldenConfig.providerType = this.config.providerType;
        (<any>this.provider).setTaskStatus.subscribe((res: any) => {
            this.taskStatus = res.taskStatus;
            this.taskId = res.taskId;
            this.statusText = res.statusText;
            this.taskLockedBy = res.lockedBy;
            let data = this.localStorage.retrieve('permissions');
            this.isSaveButtonDisabled = (this.taskStatus !== JobStatuses.INPROG) || (res.lockedBy && (res.lockedBy !== data.FullName));
            this.reloadTaskStatus.next(res);
        });
    }

    get provider(): any {
        return this.config.options.provider;
    }

    set provider(_provider) {
        this.config.options.provider = _provider;
    }

    ngOnInit() {
        this.isLoading = true;
        location.hash = decodeURIComponent(location.hash);
        let matches = location.hash.match(new RegExp('gl-window' + '=([^&]*)'));
        if (!matches) {
            let self = this;
            if (this.parametersObservable != null) {
                this.parametersObservable.unsubscribe();
            }
            this.provider.config = this.config;
            if (this.parametersObservable == null) {
                this.parametersObservable = this.route.params.subscribe(params => {
                    let id = +params['id'];
                    // let isFirstInit = !this.checkId;
                    if (id && id != this.checkId) {
                        this.checkId = id;
                        this.commonDetailInit(null);
                    }
                });
            }
        } else {
            this.isPopout = true;
            this.cd.detectChanges();
        }

        let route = this.injector.get(ActivatedRoute);
        // ngInit --x
        route.parent && route.parent.url.subscribe((data) => {
            if (!this.isLoading) {
                $('.loadingoverlay').remove();
            }
        }, error => console.error(error));
    };

    ngAfterViewInit() {
        this.tasksControlButtons.onSavedStatus.subscribe((res: any) => {
            (<any>this.provider).taskFile.TSK_STATUS = res.status;
            (<any>this.provider).taskFile.LOCKED_BY = res.lockedBy;
            let data = this.localStorage.retrieve('permissions');
            this.isSaveButtonDisabled = (res.status !== JobStatuses.INPROG) || (res.lockedBy !== data.FullName);
            (<any>this.glClipEditor).setReadOnlyMode();
        });
        this.isLoading = false;
    }

    ngOnDestroy() {
        if (this.parametersObservable != null) {
            this.parametersObservable.unsubscribe();
        }
    }

    commonDetailInit(firstInit) {
        this.provider.commonDetailInit(firstInit);
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    /**
     * Calling on Back button clicking. Go back to Media page
     */
    clickBack() {
        this.provider.clickBack();
    }

    history() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.workflow_assessment_history,
            WorkflowAssessmentHistoryModalComponent, {
                title: 'simple_assessment.history_modal_title',
                size: 'xl',
                class: 'imfx-modal stretch-modal',
                position: 'center',
                ignoreBackdropClick: false,
                backdrop: true
            });

        modal.load().then((comp: ComponentRef<WorkflowAssessmentHistoryModalComponent>) => {
            const WAHMcomp: WorkflowAssessmentHistoryModalComponent = comp.instance;
            WAHMcomp.showModal(this.taskId);
        });
    }

    /**
     * Calling on Save button clicking.
     */
    save() {
        let clips = this.glClipEditor.getTimelineItems();
        this.saveClips(clips).subscribe((result: boolean) => {
        });
    }

    beforeChangeStatus(status): Observable<Subscription> {
        return new Observable((observer: any) => {
            let clips = this.glClipEditor.getTimelineItems();
            this.saveClips(clips).subscribe((result: boolean) => {
                observer.next(result);
                observer.complete();
            }, (err) => {
                observer.error(false);
            }, () => {
                observer.complete();
            });
        });
    }

    saveClips(clips): Observable<boolean> {
        return new Observable((observer: any) => {
            let dataForSave = this.provider.getDataForSave();
            if (dataForSave.Makes.length == 0) {
                dataForSave.Makes.push({Clips: []});
            }
            dataForSave.Makes[0].Clips = this.glClipEditor.getTimelineItems().map(el => {
                return {
                    InTimeCodeWithOffsetString: el.in,
                    OutTimeCodeWithOffsetString: el.out,
                    Notes: el.comment,
                    // Thumbnail: el.thumbnail,
                    MediaId: el.mediaId,
                    Id: 0
                }
            });
            this.provider.service.saveTask(dataForSave.Task.ID, dataForSave).subscribe((res: any) => {
                if (res && res.ErrorCode && res.Result == false) {
                    this.notificationRef.notifyShow(2, this.translate.instant(res.Error));
                    observer.next(false);
                } else {
                    let message = this.translate.instant('rce.success_save');
                    this.notificationRef.notifyShow(1, message);
                    observer.next(true);
                }
                observer.complete();
            });

        });
    }

    getClips(): Array<any> {
        // debugger
        return this.segmentetClipsProvider.getClips(this.glClipEditor.getTimelineItems());
    }

    /**
     * Check file properties
     */
    private checkDetailExistance(file) {
        return this.provider.checkDetailExistance(file);
    };

    private openPreview() {
        if (!(this.glClipEditor && this.glClipEditor.timelineComponent && this.glClipEditor.timelineComponent.compRef)) {
            this.notificationRef.notifyShow(2, 'rce.no_timline_text');
            return;
        }

        let src = [this.config.options.file].map(el => {
            let source: RCESource = {
                id: el.ID,
                restricted: el.MEDIA_STATUS === 1,
                src: el.PROXY_URL,
                seconds: this.glClipEditor.playerComponents.compRef.instance.player.duration(),
                percent: 1,
                live: el.IsLive,
                som: TMDTimecode.fromString(el.SOM_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                som_string: el.SOM_text
            };

            return source;
        });

        const modalProvider = this.injector.get(IMFXModalProvider);
        const previewModal = modalProvider.showByPath(lazyModules.preview_player_comp, ModalPreviewPlayerComponent, {
            size: 'md',
            title: 'rce.timeline_preview',
            position: 'center',
            footer: false
        }, {
            file: this.config.options.file,
            src: src,
            clips: this.getClips(),
            type: 'Media'
        });
        previewModal.load().then(() => {
            previewModal.modalEvents.subscribe((res: any) => {
                previewModal.contentView.instance.playerWrapper.cleanPlayers();
            });
        });
    }
}
