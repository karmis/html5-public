import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DetailService } from '../../modules/search/detail/services/detail.service';
import { IMFXHtmlPlayerComponent } from '../../modules/controls/html.player/imfx.html.player';
import { TimelineConfig } from '../../modules/controls/imfx.pro.timeline.wrapper/timeline.config';
import { SegmentetClipsProvider } from './providers/segmented.clips.provider';
import { TimeCodeFormat, TMDTimecode } from '../../utils/tmd.timecode';
import { ClipEditorService } from '../../services/clip.editor/clip.editor.service';
import { DetailComponent } from '../../modules/search/detail/detail';
import { RaiseWorkflowWizzardProvider } from '../../modules/rw.wizard/providers/rw.wizard.provider';
import { DetailConfig } from '../../modules/search/detail/detail.config';
import { VersionAppSettings } from '../version/constants/constants';
import { SecurityService } from '../../services/security/security.service';
import { GLClipEditorComponent } from './gl.component';
// import {ModalConfig} from '../../modules/modal/modal.config';
import { MediaWizardComponent } from './comps/wizard/wizard';
import { MediaWizardProvider } from './comps/wizard/providers/wizard.provider';
import { MediaWizardService } from './comps/wizard/services/wizard.service';
import { LocatorsProvider } from '../../modules/controls/locators/providers/locators.provider';
import { ModalPreviewPlayerProvider } from '../../modules/modal.preview.player/providers/modal.preview.player.provider';
import { ModalPreviewPlayerComponent } from '../../modules/modal.preview.player/modal.preview.player';
import { LocatorsService } from '../../modules/controls/locators/services/locators.service';
import { DetailThumbProvider } from '../../modules/search/detail/providers/detail.thumb.provider';
import { NotificationService } from '../../modules/notification/services/notification.service';
import { ClipsStorageProvider } from './providers/clips.storage.provider';
import { AudioSynchProvider } from "../../modules/controls/html.player/providers/audio.synch.provider";
import { IMFXModalProvider } from "../../modules/imfx-modal/proivders/provider";
import { IMFXModalComponent } from "../../modules/imfx-modal/imfx-modal";
import { RaiseWorkflowWizzardComponent } from "../../modules/rw.wizard/rw.wizard";
import { IMFXRouteReuseStrategy } from '../../strategies/route.reuse.strategy';
import { GoldenProvider } from "../../modules/search/detail/providers/gl.provider";
import { Subject } from "rxjs/Rx";
import { ClipEditorDetailProvider } from "./providers/clip-editor.detail.provider";
import { forkJoin } from "rxjs";
import { lazyModules } from "../../app.routes";

export type RCESource = {
    id: any;
    src: string;
    seconds: number;
    restricted: boolean;
    percent?: number;
    som?: number;
    som_string?: string;
    live?: boolean;
    offsetStartAbsSec?: number;
    offsetEndAbsSec?: number;
    fileName?: string;
    chunkNumber?: number;
};

export type RCEArraySource = Array<RCESource>;
export type MediaClip = {
    start?: string;
    end?: string;
    mediaId?: any;
    file?: any;
};

@Component({
    moduleId: 'rce',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../modules/search/detail/styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailService,
        SegmentetClipsProvider,
        ClipsStorageProvider,
        VersionAppSettings,
        MediaWizardProvider,
        MediaWizardService,
        LocatorsProvider,
        LocatorsService,
        DetailThumbProvider,
        AudioSynchProvider,
        IMFXModalProvider,
        RaiseWorkflowWizzardProvider,
        GoldenProvider,
        ClipEditorDetailProvider
    ],
    entryComponents: [
        IMFXHtmlPlayerComponent,
        DetailComponent,
        ModalPreviewPlayerComponent,
    ]
})

export class RCEComponent implements AfterViewInit {
    @ViewChild('player', {static: false}) public player: IMFXHtmlPlayerComponent;
    @ViewChild('gl', {static: false}) public golden: GLClipEditorComponent;
    @ViewChild('wizardMediaModal', {static: false}) wizardMediaModal: any;

    public file;
    public defaultFile;
    public som;
    public src: string | RCEArraySource;
    public totalDuration: number;
    public timecodeFormatString: string;
    public itemsMediaList: Array<any> = [];
    // @ViewChild('gl') public golden;
    // @ViewChild('overlay') private overlay: any;
    @ViewChild('rceElement', {static: false}) private rceElement: any;
    private id;
    private itemDetails;
    private error: boolean = false;
    private isAudio: boolean = false;
    private text: string = '';
    private timelineConfig: TimelineConfig;

    private details: any;

    private clips = [];
    private isFileValid: boolean = true;

    private config = <DetailConfig>{
        componentContext: this,
        options: {
            file: {},
            provider: null,
            needApi: true,
            typeDetails: 'version-details',
            showInDetailPage: false,
            detailsviewType: 'VersionDetails',
            // friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            friendlyNamesForDetail: 'FriendlyNames.TM_PG_RL',
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
        moduleContext: this,
        providerType: GoldenProvider
    };

    private defaultGoldenConfig = {
        componentContext: this,
        appSettings: <any>null,
        options: {
            file: {},
            groups: [],
            friendlyNames: {},
            typeDetailsLocal: 'clip_editor',
            typeDetails: <string>null,
            tabs: [],
            params: <any>null,
            series: [],
            titleForStorage: 'clipEditor'
        }
    };

    private goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);

    private isPopout: boolean = false;

    private destroyed$: Subject<any> = new Subject();

    /**
     * Wizard
     * @type {ModalConfig}
     */
    // @ViewChild('wizardMediaModal') private wizardModal: ModalComponent;
    // private searchWizardModalConfig = <ModalConfig>{
    //   componentContext: this,
    //   options: {
    //     modal: {
    //       size: 'lg',
    //       title: 'media.wizard.title',
    //       isFooter: false,
    //       top: '47%',
    //       max_height: '700px'
    //     },
    //     content: {
    //       view: MediaWizardComponent,
    //       options: {
    //         provider: <MediaWizardProvider>null,
    //         service: <MediaWizardService>null
    //       }
    //     }
    //   }
    // };

    constructor(private cd: ChangeDetectorRef,
                private router: Router,
                private route: ActivatedRoute,
                public location: Location,
                private detailsService: DetailService,
                private securityService: SecurityService,
                private segmentetClipsProvider: SegmentetClipsProvider,
                public clipEditorService: ClipEditorService,
                private clipEditorDetailProvider: ClipEditorDetailProvider,
                private modalPreviewPlayerProvider: ModalPreviewPlayerProvider,
                protected appSettings: VersionAppSettings,
                protected searchWizardModalProvider: MediaWizardProvider,
                protected searchWizardModalService: MediaWizardService,
                protected locatorsProvider: LocatorsProvider,
                protected locatorsService: LocatorsService,
                public detailThumbProvider: DetailThumbProvider,
                private translate: TranslateService,
                protected notificationRef: NotificationService,
                private injector: Injector) {
        this.config.options.provider = clipEditorDetailProvider;
        this.config.options.provider.moduleContext = this;
        this.config.options.service = this.detailsService;
        this.config.options.appSettings = this.appSettings;
        this.config.options.typeDetails = this.clipEditorService.getClipEditorType()
            .toLowerCase() + '-details';
        this.config.options.detailsviewType = this.clipEditorService.getClipEditorType() + 'Details';
        if (this.config.options.detailsviewType === 'MediaDetails') {
            this.config.options.friendlyNamesForDetail = 'FriendlyNames.TM_MIS';
        }
        this.segmentetClipsProvider.componentRef = this;
        this.clipEditorService.setClipEditorType(this.clipEditorService.getClipEditorType().toLowerCase());

        // search wizard
        // this.searchWizardModalConfig.options.content.options.provider = this.searchWizardModalProvider;
        // this.searchWizardModalConfig.options
        //     .content.options.provider.clipEditorService = this.clipEditorService;
        // this.searchWizardModalConfig.options.content.options.service = this.searchWizardModalService;
    }

    ngAfterViewInit() {
        // this.searchWizardModalProvider.wizardModal = this.wizardModal;
        // this.overlay.hideWhole();
        // this.overlay.show(this.rceElement.nativeElement);
        // debugger
        let mediaIds: string[] = [];

        location.hash = decodeURIComponent(location.hash);
        let matches = location.hash.match(new RegExp('gl-window' + '=([^&]*)'));

        if (!matches) {
            this.route.params.subscribe(params => {
                mediaIds = decodeURIComponent(params['id']).split(',');
                this.id = +mediaIds[0];

                this.config.options.provider.config = this.config;
                this.config.options.typeDetails = this.clipEditorService.getClipEditorType()
                    .toLowerCase() + '-details';
                this.config.options.detailsviewType = this.clipEditorService
                    .getClipEditorType() + 'Details';
                if (this.clipEditorService.getClipEditorType() == "Media") {
                    let readyEvent = new EventEmitter<any>();
                    readyEvent.subscribe((data) => {
                        let res = [data];
                        if (res == null || res != null && res.length == 0) {
                            this.translate.get("clip-editor.load_error." + this.clipEditorService
                                .getClipEditorType()).subscribe((trans) => {
                                this.notificationRef.notifyShow(2, trans);
                                this.router.navigate([this.clipEditorService.getClipEditorType().toLowerCase()]);
                            });
                        }
                        this.isAudio = this.clipEditorService.isAudio();
                        // this.overlay.hideWhole();
                        this.fillOwnerData(res);
                        // for some id
                        if (mediaIds.length > 1) {
                            const req = [];
                            mediaIds.forEach((id, index) => {
                                if (index !== 0)
                                    req.push(this.detailsService.getDetail(id, this.config.options.typeDetails));

                            });
                            forkJoin(req).subscribe(media => {
                                if (this.golden && this.golden.mediaListComponent) {
                                    this.golden.mediaListComponent.emit(
                                        'setItems',
                                        [...res, ...media]
                                    );
                                } else {
                                    setTimeout(() => {
                                        this.golden.mediaListComponent.emit(
                                            'setItems',
                                            [...res, ...media]
                                        );
                                    }, 500);
                                }
                            });
                        } else {
                            if (this.golden && this.golden.mediaListComponent) {
                                this.golden.mediaListComponent.emit(
                                    'setItems',
                                    res
                                );
                            } else {
                                setTimeout(() => {
                                    if (!this.golden.mediaListComponent) {
                                        return;
                                    }
                                    this.golden.mediaListComponent.emit(
                                        'setItems',
                                        res
                                    );
                                }, 500);
                            }
                        }
                        //console.log(this.clipEditorService, 'this.clipEditorService');
                        const addItems = () => {
                            this.clipEditorService.onAddToMediaList.subscribe((data) => {
                                this.golden.mediaListComponent.emit(
                                    'addItem',
                                    data
                                );
                            });
                        };
                        if (this.clipEditorService) {
                            addItems();
                        } else {
                            setTimeout(() => {
                                addItems();
                            }, 500);
                        }

                    });
                    this.config.options.provider.commonDetailInit(null, readyEvent);
                    // this.itemsMediaList = this.clipEditorService.getSelectedRows();
                } else {
                    this.config.options.provider.commonDetailInit(null);
                    this.itemsMediaList = this.clipEditorService.getSelectedRows(); // only for version CE
                    this.cd.detectChanges();
                }
            });
            if (this.clipEditorService
                .getClipEditorType() == "Version") {
                let res = this.clipEditorService.getSelectedRows();
                if (res == null || res != null && res.length == 0) {
                    this.translate.get("rce.load_error." + this.clipEditorService
                        .getClipEditorType()).subscribe((trans) => {
                        this.notificationRef.notifyShow(2, trans);
                        this.router.navigate([this.clipEditorService.getClipEditorType().toLowerCase()]);
                    });
                }
                this.isAudio = this.clipEditorService.isAudio();
                // this.overlay.hideWhole();
                this.fillOwnerData(res);
                this.clipEditorService.onAddToMediaList.subscribe((data) => {
                    if (this.golden && this.golden.mediaListComponent) {
                        this.golden.mediaListComponent.emit(
                            'addItem',
                            data
                        );
                        // this.fillOwnerData([data]);
                    }
                });
            }
        } else {
            this.isPopout = true;
            // this.overlay.hideWhole();
            this.cd.detectChanges();
        }

    }

    fillOwnerData(res) {
        if (this.id == res[0].ID) {
            this.defaultFile = res[0];
        }
        this.file = res[0];
        this.som = TMDTimecode.fromString(
            this.file.SOM_text,
            TimeCodeFormat[this.file.TimecodeFormat]
        ).toSeconds();
        this.timecodeFormatString = res[0].TimecodeFormat;
        let playRestricted = this.securityService.hasPermissionByName('play_restricted_content');

        if (this.config.options.detailsviewType !== 'MediaDetails') {
            let src = <RCEArraySource>res.map((el, i) => {
                let duration = TMDTimecode.fromString(
                    el.DURATION_text,
                    TimeCodeFormat[el.TimecodeFormat]
                ).toSeconds();
                if (duration === 0) {
                    this.isFileValid = false;
                }
                let source: RCESource = {
                    id: el.ID,
                    restricted: el.MEDIA_STATUS === 1,
                    src: el.MEDIA_STATUS === 1 && !playRestricted ? '' : el.PROXY_URL,
                    seconds: 0,
                    live: el.IsLive,
                    som: TMDTimecode.fromString(el.SOM_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                    som_string: el.SOM_text,
                    fileName: el.FILENAME,
                    chunkNumber: i + 1,
                };

                source.seconds = duration;

                return source;
            });
            if (typeof this.src == 'undefined') {
                this.src = src;
            } else {
                this.src = (<RCEArraySource>this.src).concat(src);
            }
            this.totalDuration = (<RCEArraySource>this.src).map(e => e.seconds).reduce((a, b) => a + b, this.som);
            this.src = (<RCEArraySource>this.src).map((el, idx) => {
                el.percent = ((<RCEArraySource>this.src).slice(0, idx).map(el => el.seconds)
                    .reduce((a, b) => a + b, 0) + el.seconds) / (this.totalDuration - this.som);
                return el;
            });
        } else {
            let src = <RCEArraySource>res.map(el => {
                let source: RCESource = {
                    id: el.ID,
                    restricted: el.MEDIA_STATUS === 1,
                    src: el.MEDIA_STATUS === 1 && !playRestricted ? '' : el.PROXY_URL,
                    seconds: 0,
                    percent: 1,
                    live: el.IsLive,
                    som: TMDTimecode.fromString(el.SOM_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                    som_string: el.SOM_text
                };

                return source;
            });
            this.src = src;
            this.totalDuration = (<RCEArraySource>this.src).map(e => e.seconds).reduce((a, b) => a + b, this.som);
        }

        this.cd.detectChanges();
    }

    checkMediaList() {
        return this.config.options.detailsviewType === 'MediaDetails' && this.golden && this.golden.mediaListComponent;
    }

    showMediaTable() {
        const modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.media_wizard, MediaWizardComponent, {
            title: 'media.wizard.title',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });

        modal.load().then((cr: ComponentRef<MediaWizardComponent>) => {
            modal.modalEvents.subscribe((res: any) => {
                (cr.instance as MediaWizardComponent).ceService.clearItemForAddToMediaList();
            });
        });


        // let data = this.getSelectedRow();
        // wizardProvider.showModal(data.ID);


        // this.searchWizardModalConfig.options.content.options.provider.showModal();
    }

    getClips(): Array<MediaClip> {
        return this.segmentetClipsProvider.getClips(this.golden.getTimelineItems());
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    private placeOrder() {
        if (this.isFileValid) {
            let modalProvider = this.injector.get(IMFXModalProvider);
            let modal: IMFXModalComponent = modalProvider.showByPath(
                lazyModules.wf_raise,
                RaiseWorkflowWizzardComponent, {
                    title: 'rwwizard.title',
                    size: 'md',
                    position: 'center',
                    footerRef: 'modalFooterTemplate'
                });

            modal.load().then((compRef: ComponentRef<RaiseWorkflowWizzardComponent>) => {
                const comp: RaiseWorkflowWizzardComponent = compRef.instance;
                comp.rwwizardprovider.open(
                    this.config.options.file.ID,
                    this.clipEditorService.getClipEditorType(),
                    this.getClips()
                );
            });


        } else {
            this.notificationRef.notifyShow(2, 'rce.invalid_file');
        }
    }

    private openPreview() {
        if (!(this.golden && this.golden.timelineComponent && this.golden.timelineComponent.compRef)) {
            this.notificationRef.notifyShow(2, 'rce.no_timline_text');
            return;
        }

        if (this.isFileValid) {
            let modalProvider = this.injector.get(IMFXModalProvider);
            const previewModal = modalProvider.showByPath(lazyModules.preview_player_comp, ModalPreviewPlayerComponent, {
                size: 'md',
                title: 'rce.timeline_preview',
                position: 'center',
                footer: false
            }, {
                file: this.file,
                src: <RCEArraySource>this.src,
                clips: this.getClips(),
                type: this.clipEditorService.getClipEditorType()
            });
            previewModal.load().then((cr: ComponentRef<ModalPreviewPlayerComponent>) => {
                previewModal.modalEvents.subscribe((res: any) => {
                    previewModal.contentView.instance.playerWrapper.cleanPlayers();
                });
            });
        } else {
            this.notificationRef.notifyShow(2, 'rce.invalid_file');
        }
    }

    private clickBack() {
        this.location.back();
    }

    private _isError(err) {
        if (err.status === 500) {
            // ошибка сервера
            this.text = this.translate.instant('details_item.server_not_work');
        } else if (err.status === 400 || err.status === 404) {
            // элемент не найден
            this.text = this.translate.instant('details_item.media_item_not_found');
        } else if (err.status === 0) {
            // сети нет
            this.text = this.translate.instant('details_item.check_network');
        }
        this.error = true;
        this.cd.markForCheck();
        return true;
    }

    /*
       * Check file properties
       */
    private checkDetailExistance(file) {
        return this.config.options.provider.checkDetailExistance(file);
    }

    /*
     * Check object properties
     */
    private checkObjectExistance(obj) {
        return this.config.options.provider.checkObjectExistance(obj);
    }
}
