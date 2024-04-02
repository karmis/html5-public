/**
 * Created by Sergey Klimenko on 10.03.2017.
 */
import  {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DetailProvider } from './providers/detail.provider'
import { DetailService } from './services/detail.service';
import { DetailConfig } from './detail.config';

import * as $ from 'jquery';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { SplashProvider } from '../../../providers/design/splash.provider';
import { GLComponent } from './gl.component';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyService } from '../taxonomy/services/service';
import { DetailThumbProvider } from './providers/detail.thumb.provider';
import { SlickGridRowData } from '../slick-grid/types';
import { appRouter } from '../../../constants/appRouter';
import { ItemTypes } from '../../controls/html.player/item.types';
import { ClipEditorService } from '../../../services/clip.editor/clip.editor.service';
import { BasketService } from '../../../services/basket/basket.service';
import { AudioSynchProvider } from '../../controls/html.player/providers/audio.synch.provider';
import { SearchSettingsProvider } from '../settings/providers/search.settings.provider';
import { IMFXModalProvider } from '../../imfx-modal/proivders/provider';
import { RaiseWorkflowWizzardComponent } from '../../rw.wizard/rw.wizard';
import { IMFXModalComponent } from '../../imfx-modal/imfx-modal';
import { SecurityService } from '../../../services/security/security.service';
import { WorkflowListComponent } from '../../../views/workflow/comps/wf.list.comp/wf.list.comp';
import { HTMLPlayerService } from '../../controls/html.player/services/html.player.service';
import { Observable, Subject } from 'rxjs';
import { IMFXModalEvent } from '../../imfx-modal/types';
import { EditSomEomModalComponent } from './components/modals/edit.som.eom.modal/edit.som.eom.modal.component';
import { NotificationService } from '../../notification/services/notification.service';
import { MediaSlickGridProvider } from '../../../views/media/providers/media.slick.grid.provider';
import { IMFXRouteReuseStrategy } from '../../../strategies/route.reuse.strategy';
import { RaiseWorkflowWizzardProvider } from '../../rw.wizard/providers/rw.wizard.provider';
import { IMFXModalAlertComponent } from '../../imfx-modal/comps/alert/alert';
import { GoldenProvider } from './providers/gl.provider';
import { takeUntil } from 'rxjs/operators';
import { MediaService } from '../../../services/media/media.service';
import { lazyModules } from '../../../app.routes';
import { NativeNavigatorProvider } from '../../../providers/common/native.navigator.provider';
import { HttpResponse } from '@angular/common/http';
import { ChangeCustomStatusComponent } from '../../../views/media/comp/change-custom-status/change-custom-status.comp';
import { BaseSearchUtil } from '../utils/utils';


@Component({
    selector: 'detail-block',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        // DetailProvider,
        DetailService,
        MediaService,
        GLComponent,
        TaxonomyService,
        AudioSynchProvider,
        SearchSettingsProvider,
        DetailThumbProvider,
        HTMLPlayerService,
        MediaSlickGridProvider,
        RaiseWorkflowWizzardProvider
        // SearchThumbsProvider
    ]
})

export class DetailComponent extends BaseSearchUtil {
    public config = <DetailConfig>{
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
            typeDetailsLocal: '',
            timecodeFormatString: 'Pal',
            providerDetailData: <any>null,
            provider: <DetailProvider>null,
            service: <DetailService>null,
            data: <any>null,
            detailCtx: this,
            showAccordions: false,
            externalSearchTextForMark: '',
            isOpenDetailPanel: false
        },
        moduleContext: this,
        layoutConfig: {
            dimensions: {
                headerHeight: 36,
                borderWidth: 10,
                dragProxyWidth: 150,
                dragProxyHeight: 0
            },
            settings: {
                hasHeaders: true,
                showPopoutIcon: true,
                showMaximiseIcon: false,
                showCloseIcon: false,
                selectionEnabled: true,
                reorderEnabled: false,
                isClosable: false
            },
            labels: {
                close: 'Close',
                maximise: 'Maximise',
                minimise: 'Minimise',
                popout: 'Open In New Window',
                popin: 'Pop In',
                tabDropdown: 'Additional Tabs'
            },
            content: [{
                type: 'row',
                content: [
                    {
                        type: 'component',
                        componentName: 'Data',
                        tTitle: 'Data',
                        width: 35
                    }
                ]
            }]
        },
        providerType: GoldenProvider
    };

    @ViewChild('gl', {static: false}) public golden;
    public activeTab = 0;
    private text: string = '';
    private error: boolean = false;
    private file: any = {};
    private checkId: any;
    private parametersObservable: any;
    private routeParamsSubscriver: any;
    private isReady: boolean = false;
    private isPopout: boolean = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(@Inject(DetailService) protected service: DetailService,
                @Inject(DetailProvider) protected provider: DetailProvider,
                @Inject(BasketService) protected basketService: BasketService,
                @Inject(ComponentFactoryResolver) protected compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) protected appRef: ApplicationRef,
                public securityService: SecurityService,
                public cd: ChangeDetectorRef,
                public router: Router,
                public route: ActivatedRoute,
                public splashProvider: SplashProvider,
                public translate: TranslateService,
                // private localStorage: LocalStorageService,
                protected nativeNavigatorProvider: NativeNavigatorProvider,
                protected modalProvider: IMFXModalProvider,
                protected notificationService: NotificationService,
                public injector: Injector) {
        super();
    }

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    public hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    hasPermission(path) {
        //return true;
        return this.securityService.hasPermissionByPath(path);
    }

    ngAfterViewInit() {
        this.isReady = true;
        location.hash = decodeURIComponent(location.hash);
        let matches = location.hash.match(new RegExp('gl-window' + '=([^&]*)'));
        if (!matches) {
            if (this.parametersObservable != null) {
                this.parametersObservable.unsubscribe();
            }
            // Set default provider/services if custom is null
            this.initializeData(this, 'provider');
            this.initializeData(this, 'service');
            this.passConfigToProvider(this);

            this.provider.injector = this.injector;
            let self = this;
            if (this.parametersObservable == null) {
                this.parametersObservable = this.route.params.subscribe(params => {
                    if (params['id']) {
                        self.checkId = params['id'];
                    }
                });
            }
            if (this.routeParamsSubscriver != null) {
                this.routeParamsSubscriver.unsubscribe();
            }

            let isFirstInit = true;
            this.routeParamsSubscriver = this.route.parent.params.subscribe((params: Params) => {
                let id = params.id;

                if (!id) {
                    return;
                }

                if (isFirstInit) {
                    this.detailInit(true);
                    isFirstInit = false;
                } else {
                    if (id != self.checkId) {
                        self.checkId = id;
                        Promise.resolve().then(() => {
                            self.detailInit(false);
                        });
                    }
                }
            });

            // this.detailInit(true);
        } else {
            this.isPopout = true;
            this.splashProvider.onHideSpinner.emit();
            this.cd.detectChanges();
        }
    }


    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        // console.log('Destroy', this);
        if (this.parametersObservable != null) {
            this.parametersObservable.unsubscribe();
        }
        if (this.routeParamsSubscriver != null) {
            this.routeParamsSubscriver.unsubscribe();
        }
    }

    detailInit(firstInit) {
        this.config.options.provider.commonDetailInit(firstInit);
    }

    _isError(err) {
        if (err.status == 500) {
            // ошибка сервера
            this.text = this.translate.instant('details_item.server_not_work');
        } else if (err.status == 400 || err.status == 404) {
            // элемент не найден
            this.text = this.translate.instant('details_item.media_item_not_found');
        } else if (err.status == 0) {
            // сети нет
            this.text = this.translate.instant('details_item.check_network');
        }
        this.splashProvider.onHideSpinner.emit();
        this.error = true;
        this.cd.markForCheck();
        return true;
    }

    /**
     * Get detail info by id
     * @param r_params route params with ID
     */
    getDetail(r_params) {
        this.file = this.config.options.service.getDetail(r_params.value.id, this.config.options.typeDetails);
        this.cd.detectChanges();
    };

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    /**
     * Calling on Back button clicking. Go back to Media page
     */
    clickBack() {
        this.config.options.provider.clickBack();
    }

    getDetailId() {
        return this.config.options.provider.getDetailId();
    }

    /**
     * Check file properties
     */
    checkDetailExistance(file) {
        return this.config.options.provider.checkDetailExistance(file);
    }

    /**
     * Check object properties
     */
    checkObjectExistance(obj) {
        return this.config.options.provider.checkObjectExistance(obj);
    }

    isEmptyOverlay(): boolean {
        return this.config.options.provider.isEmptyOverlay();
    }

    getEmptyOverlayText(): string {
        return this.config.options.provider.getEmptyOverlayText();
    }

    addToBasket($events, itemType) {
        let data = this.config.options.file;
        if (!this.isOrdered(data)) {
            this.basketService.addToBasket(data, itemType);
        }
    }

    removeFromBasket($events) {
        let data = this.config.options.file;
        if (this.isOrdered(data)) {
            this.basketService.removeFromBasket([data]);
        }
    }

    showRaiseWorkflowWizzard($events, itemType) {
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

            if(itemType == 'Media') {
                comp.rwwizardprovider.open(this.config.options.file.ID, 'Media');
            } else if (itemType == 'Tape') {

                comp.rwwizardprovider.open(
                    [this.config.options.file.ID],
                    'Tape',
                    null,
                    {
                        // showZeroStep: false,
                        VersionSourceType: 'tape'
                    });

            } else if (itemType == 'VersionOnVersion') {
                comp.rwwizardprovider.open(
                    [this.config.options.file.ID],
                    "Version",
                    null,
                    {
                        VersionSourceType: 'version'
                    });
            } else if (itemType == 'VersionOnMedia') {
                comp.rwwizardprovider.open(
                    [this.config.options.file.ID],
                    "Version",
                    null,
                    {
                        VersionSourceType: 'media'
                    });
            }
        });
    }

    isOrdered(data?: SlickGridRowData): boolean {
        if (!data) {
            data = this.config.options.file;
        }

        return data ? this.basketService.hasItem(data) : false;
    }

    getDownloadLink() {
        let host = `${window.location.protocol}//${window.location.hostname}`;
        let data = this.config.options.file;
        let url = (data) ? (data.PROXY_URL || data.LOCATION) : null;

        if (!url) {
            return null;
        }

        let pos = url.indexOf(host);

        if (pos !== -1) {
            url = url.replace(new RegExp(/\//g), '/');
            url = url.substr(pos + host.length);
            return url;
        } else {
            return null;
        }
    }


    isMediaLoggerShow() {
        return true;
    }

    goToMediaLogger($events) {
        let data = this.config.options.file;
        // this.router.navigate(['media-logger', rowData.data.ID]);
        this.router.navigate(
            [
                appRouter.media_logger.detail.substr(
                    0,
                    appRouter.media_logger.detail.lastIndexOf('/')
                ),
                data.ID
            ]
        );
        // }
    }

    isMediaLoggerEnable() {
        let data = this.config.options.file;
        if (!data) {
            return false;
        }

        let file = data;
        if (typeof (file['PROXY_URL']) == "string" && file['PROXY_URL'].match(/(?:http)|(?:https)/g) && file.IsPlayableVideo) {
            return true;
        } else if (file['UsePresignedUrl']) { // use for Presigned Url
            return true;
        } else {
            return false;
        }
    }

    clipEditorEnabled() {
        let data = this.config.options.file;
        if (!data) {
            return false;
        }
        let playable = false;
        if (data &&
            data["PROXY_URL"] &&
            data["PROXY_URL"].length > 0 &&
            data["PROXY_URL"].match(/^(http|https):\/\//g) &&
            data["PROXY_URL"].match(/^(http|https):\/\//g).length > 0 &&
            (data["MEDIA_TYPE"] == ItemTypes.AUDIO || data["MEDIA_TYPE"] == ItemTypes.MEDIA)) {
            playable = true;
        }
        if (data.UsePresignedUrl) { // use for Presigned Url
            playable = true;
        }

        const isEdge = this.nativeNavigatorProvider.isEdge();
        if (data && data["MEDIA_FORMAT_text"] == "WEBM" && isEdge) {
            playable = false;
        }
        return playable;
    }

    clipEditor($events) {
        let data = this.config.options.file;
        let rows: Array<any> = [data];
        let clipEditorService: ClipEditorService = this.injector.get(ClipEditorService);
        clipEditorService.setClipEditorType(clipEditorService.getClipEditorType().toLocaleLowerCase());
        // set rows
        clipEditorService.setSelectedRows(rows);

        // set isAudio flag
        let isAudio = data.MEDIA_TYPE == ItemTypes.AUDIO ? true : false;
        clipEditorService.setIsAudio(isAudio);
        let id = data.ID;

        //   this.router.navigate(["clip-editor", id])
        this.router.navigate(
            [
                appRouter.clip_editor_media.substr(
                    0,
                    appRouter.clip_editor_media.lastIndexOf('/')
                ),
                id
            ]
        );
    }

    isEditSomEomEnabled() {
        let data = this.config.options.file;
        if (!data) {
            return false;
        }
        let playable = false;
        ``;
        if (data && data["MEDIA_TYPE"] && data["MEDIA_TYPE"] == ItemTypes.MEDIA) {
            return true;
        } else {
            return false;
        }
    }

    editSomEom($event) {
        console.log('edit');

        let self = this
            , data = self.config.options.file
            , message = null;

        let editSomEomModal = self.modalProvider.showByPath(lazyModules.edit_som_eom_modal,
            EditSomEomModalComponent, {
            size: "sm",
            title: 'media.table.modal_edit_som_eom.title',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: self, isSelectAll: false, isSelectedAll: false, isMultiSelect: false});

        editSomEomModal.load().then((cr: ComponentRef<EditSomEomModalComponent>)=>{
            let content: EditSomEomModalComponent = cr.instance;
            content.setData(
                {
                    TimecodeFormat: data.TimecodeFormat,
                    SOMtext: data.SOM_text,
                    EOMtext: data.EOM_text
                }
            );
            editSomEomModal.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    if (res.$event && res.$event.length !== 0) {
                        self.service.editSomEom(data.ID, res.$event).pipe(
                            takeUntil(this.destroyed$)
                        ).subscribe(resp => {
                                message = self.translate.instant('media.table.modal_edit_som_eom.edit_success');
                                self.notificationService.notifyShow(1, message, true);
                                self.detailInit(false);
                            },
                            error => {
                                message = self.translate.instant('media.table.modal_edit_som_eom.edit_error');
                                self.notificationService.notifyShow(2, message, false);
                            });
                    }
                }
            });
        });



    }

    requestBrowseCopy() {
        console.log('requestBrowseCopy');
    }

    canUnbindMedia(): boolean {
        let data = this.config.options.file;
        let res: boolean = false;
        if (data) {
            res = data.PGM_PARENT_ID == 0;
        }

        return res;
    }

    unbind($events) {
        console.log('...');

        let self = this;
        let data = this.config.options.file;
        let translate = this.injector.get(TranslateService);
        let notificator = this.injector.get(NotificationService);
        let mgs = this.injector.get(MediaService);
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            title: 'media.unattach.alert_title',
            size: 'md',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then((cd: any) => {
            let alertModal: IMFXModalAlertComponent = cd.instance;
            alertModal.setText('media.unattach.alert_text', {mediaId: data.ID});
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    mgs.unbindMedia(data.ID).pipe(
                        takeUntil(this.destroyed$)
                    ).subscribe((res: any) => {
                        notificator.notifyShow(1, translate.instant('mapping.unbindSuccess'));
                        modal.hide();
                        self.detailInit(false);
                    }, (err) => {
                        notificator.notifyShow(2, translate.instant('mapping.unbindError'));
                    });
                }
            });
        });
    }

    changeStatus(withRefresh: boolean = true) {
        const provider: MediaSlickGridProvider = this.injector.get(MediaSlickGridProvider);
        provider.changeStatus(this.config.options.file, withRefresh);

    }

    onChangeCustom(){
        let data = this.config.options.file;
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.change_custom_status_modal, ChangeCustomStatusComponent, {
            title: 'Change Custom Status',
            size: 'sm',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });

        modal.load().then((modal: ComponentRef<ChangeCustomStatusComponent>) => {
            let modalContent: ChangeCustomStatusComponent = modal.instance;
            modalContent.loadData(data, 'version', this);
        });

    }

    activeWorkflows($event, itemType) {
        let data = this.config.options.file;
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_list,
            WorkflowListComponent, {
                title: 'misr.wf_list',
                size: 'xl',
                position: 'center',
                footer: 'close'
            });

        modal.load().then((modal: ComponentRef<WorkflowListComponent>) => {
            let modalContent: WorkflowListComponent = modal.instance;

            if(itemType == 'Media') {
                modalContent.loadData([data.ID]);
            } else if (itemType == 'Tape') {
                modalContent.loadData([data.ID], 'tape');
            } else if (itemType == 'Version') {
                modalContent.loadData([data.ID], 'version');
            }
        });
    }

    getMediaUrl(file): Observable<HttpResponse<any>> {
        return new Observable((observer: any) => {
            let url = file.PROXY_URL;
            if (file.UsePresignedUrl) {
                let htmlPlayerService = this.injector.get(HTMLPlayerService);
                htmlPlayerService.getPresignedUrl(file.ID).pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((res: any) => {
                    url = res;
                    observer.next(url);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(url);
                observer.complete();
                // });
            }
        });
    };
}
