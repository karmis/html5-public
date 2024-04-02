import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SplashProvider } from '../../../../providers/design/splash.provider';
import { DetailConfig } from '../../../../modules/search/detail/detail.config';
import { DetailService } from '../../../../modules/search/detail/services/detail.service';
import { NotificationService } from '../../../../modules/notification/services/notification.service';
import { LocatorsProvider } from '../../../../modules/controls/locators/providers/locators.provider';
import { MediaLoggerService } from '../../../media-logger/services/media.logger.service';
import { TimecodeProvider } from '../../../../modules/controls/html.player/providers/timecode.provider';
import { TaxonomyService } from '../../../../modules/search/taxonomy/services/service';
import { AudioSynchProvider } from '../../../../modules/controls/html.player/providers/audio.synch.provider';
import { MediaAppSettings } from '../../../media/constants/constants';
import { MediaLoggerTaskProvider } from './providers/media.logger.task.provider';
import { GLTaskLoggerComponent } from './gl.component';
import { SimpleListComponent } from '../../../../modules/controls/simple.items.list/simple.items.list';
import { TranslateService } from '@ngx-translate/core';
import { JobStatuses } from '../../../workflow/constants/job.statuses';
import { Observable, Subject, Subscription } from 'rxjs';
import { TasksControlButtonsComponent } from '../../../../modules/search/tasks-control-buttons/tcb';
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../../modules/imfx-modal/imfx-modal';
import { TcbProvider } from '../../../../modules/search/tasks-control-buttons/providers/tcb.provider';
import { MediaLoggerProvider } from '../../../media-logger/providers/media.logger.provider';
import { LocatorsService } from '../../../../modules/controls/locators/services/locators.service';
import { IMFXRouteReuseStrategy } from '../../../../strategies/route.reuse.strategy';
import { GoldenProvider } from '../../../../modules/search/detail/providers/gl.provider';
import { WorkflowAssessmentHistoryModalComponent } from '../assessment/comps/history.modal/workflow.assessment.history.component';
import { lazyModules } from "../../../../app.routes";
import { MediaLoggerTaskService } from "./services/media.logger.task.service"
import { MLComponent } from '../../../../modules/abstractions/media.logger.component';


@Component({
    selector: 'media-logger-task',
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
        MediaLoggerService,
        MediaLoggerTaskProvider,
        {provide: TcbProvider, useClass: MediaLoggerTaskProvider},
        DetailService,
        {provide: DetailService, useClass: MediaLoggerTaskService},
        MediaLoggerTaskService,
        TimecodeProvider,
        TaxonomyService,
        LocatorsProvider,
        AudioSynchProvider,
        SimpleListComponent,
        MediaLoggerProvider,
        LocatorsService,
        GoldenProvider
    ],
    entryComponents: [
        GLTaskLoggerComponent
    ]
})

export class MediaLoggerTaskComponent extends MLComponent {
    @ViewChild('tasksControlButtons', {static: false}) tasksControlButtons: TasksControlButtonsComponent;
    @ViewChild('glTaskLogger', {static: false}) glTaskLogger: ElementRef;
    reloadTaskStatus: Subject<any> = new Subject();
    getValidation: Subject<any> = new Subject();
    onSaveLogger: Subject<any> = new Subject();
    private text: string = '';
    private error: boolean = false;
    private isErrorMoreInfo: Boolean = false;
    private errorMoreInfoText: string = '';
    private config = <DetailConfig>{
        componentContext: <any>null,
        options: {
            _accordions: [],
            tabsData: [],
            file: {},
            userFriendlyNames: {},
            mediaParams: {
                addPlayer: false,
                addMedia: false,
                addImage: false,
                showAllProperties: false,
                isSmoothStreaming: false,
                mediaType: ''
            },
            typeDetailsLocal: 'media_logger',
            providerDetailData: <any>null,
            provider: <MediaLoggerTaskProvider>null,
            service: <DetailService>null,
            data: <any>null,
            detailCtx: this,
            typeDetails: "task/logger",
            detailsviewType: "MediaDetails",
            friendlyNamesForDetail: "FriendlyNames.TM_MIS",
            showGolden: false,
            defaultThumb: './assets/img/default-thumb.png',
            clipBtns: true,
            disabledClipBtns: false
        },
        moduleContext: this,
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
            typeDetailsLocal: 'media_logger',
            typeDetails: <string>null,
            tabs: [],
            params: <any>null,
            series: <any>null,
            titleForStorage: 'taskMediaLogger'
        }
    };

    private goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);
    private isSaveButtonDisabled: boolean = true;
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
    private destroyed$: Subject<any> = new Subject();

    constructor(public route: ActivatedRoute,
                protected appSettings: MediaAppSettings,
                private mediaLoggerService: DetailService,
                private cd: ChangeDetectorRef,
                public detailProvider: MediaLoggerTaskProvider,
                private router: Router,
                private translate: TranslateService,
                private injector: Injector,
                private splashProvider: SplashProvider,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                @Inject(LocatorsProvider) public locatorsProvider: LocatorsProvider) {
        super();
        // detail provider
        this.config.options.provider = this.detailProvider;
        this.config.options.provider.moduleContext = this;
        this.config.options.service = this.mediaLoggerService;
        this.config.options.appSettings = this.appSettings;
        this.goldenConfig.providerType = this.config.providerType;
        (<any>this.config.options.provider).setTaskStatus.subscribe((res: any) => {
            this.taskStatus = res.taskStatus;
            this.taskId = res.taskId;
            this.statusText = res.statusText;
            this.isSaveButtonDisabled = this.taskStatus !== JobStatuses.INPROG;
            this.taskLockedBy = res.lockedBy;
            this.reloadTaskStatus.next(res);
        });
    }

    ngOnInit() {
        super.ngOnInit(this);
    }

    ngAfterViewInit() {
        this.tasksControlButtons.onSavedStatus.subscribe((res: any) => {
            (<any>this.config.options.provider).taskFile.TSK_STATUS = res.status;
            (<any>this.config.options.provider).taskFile.LOCKED_BY = res.lockedBy;
            this.isSaveButtonDisabled = res.status !== JobStatuses.INPROG;
            (<any>this.glTaskLogger).setReadOnlyMode();
        });
    }

    ngOnDestroy() {
        if (this.parametersObservable != null) {
            this.parametersObservable.unsubscribe();
        }

        this.destroyed$.next();
        this.destroyed$.complete();
    }

    commonDetailInit(firstInit) {
        this.config.options.provider.commonDetailInit(firstInit);
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    /**
     * Calling on Back button clicking. Go back to Media page
     */
    clickBack() {
        this.config.options.provider.clickBack();
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
        this.config.options.provider.updateAndSaveMediaItems({isCompletedStatus: this.taskStatus === JobStatuses.COMPLETED}).subscribe(data => {
        });
    }

    /**
     * Calling on Reload button clicking.
     */
    reload() {
        this.locatorsProvider.onReloadMediaTagging.emit();
    }

    /**
     * Calling for validate Save button.
     */
    isValid(): boolean {
        return this.locatorsProvider.isSaveValid();
    }

    beforeChangeStatus(): Observable<Subscription> {
        return new Observable((observer: any) => {
            (this.config.options.provider as MediaLoggerTaskProvider).updateAndSaveMediaItems({isCompletedStatus: this.taskStatus === JobStatuses.COMPLETED}).subscribe(result => {
                if ((<any>result) === false) {
                    observer.next(false);
                } else {
                    observer.next(true);
                }
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
            // (<any>this.glTaskLogger).saveMediaTagging().subscribe( result => {
            //     if (result === false) {
            //         observer.next(false);
            //     } else {
            //         observer.next(true);
            //     }
            // }, (err) => {
            //     observer.error(err);
            // }, () => {
            //     observer.complete();
            // });
        });
    }

    setDataChanged(res) {
        this.dataChanged = res;
    }

    setSaveButtonEnabled() {
        this.locatorsProvider.saveValid = true;
    }

    /**
     * Check api errors
     */
    _isError(err) {
        this.isErrorMoreInfo = false;
        if (err.status == 500) {
            // server error
            this.text = this.translate.instant('simple_assessment.server_not_work');
        } else if (err.status == 400 || err.status == 404) {
            // element not found
            this.text = err.error ? err.error.Error : this.translate.instant('details_item.media_item_not_found');
        } else if (err.status == 0) {
            // network error
            this.text = this.translate.instant('details_item.check_network');
        }
        if (err.error && err.error.Message && err.error.Message !== '') {
            this.isErrorMoreInfo = true;
            this.errorMoreInfoText = err.error.Message;
        }
        this.splashProvider.onHideSpinner.emit();
        this.error = true;
        this.cd.markForCheck();
        return true;
    }

    /**
     * Check file properties
     */
    private checkDetailExistance(file) {
        return this.config.options.provider.checkDetailExistance(file);
    }

}
