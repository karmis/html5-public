/**
 * Created by Sergey Trizna on 27.12.2017.
 */
import {SlickGridProvider} from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import {Router} from "@angular/router";
import {BasketService} from "../../../services/basket/basket.service";
import {ApplicationRef, ComponentFactoryResolver, ComponentRef, Inject, Injector} from "@angular/core";
import {SlickGridRowData} from "../../../modules/search/slick-grid/types";
import {appRouter} from "../../../constants/appRouter";
import {ItemTypes} from "../../../modules/controls/html.player/item.types";
import {ClipEditorService} from "../../../services/clip.editor/clip.editor.service";
import {TranslateService} from '@ngx-translate/core';
import {NotificationService} from "../../../modules/notification/services/notification.service";
import {RaiseWorkflowWizzardComponent} from "../../../modules/rw.wizard/rw.wizard";
import {IMFXModalComponent} from "../../../modules/imfx-modal/imfx-modal";
import {IMFXModalProvider} from "../../../modules/imfx-modal/proivders/provider";
import {IMFXModalAlertComponent} from "../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../modules/imfx-modal/types";
import {WorkflowListComponent} from '../../workflow/comps/wf.list.comp/wf.list.comp';
import {MediaChangeStatusComponent} from "../modules/media-status/comp";
import {HttpService} from '../../../services/http/http.service';
import {MediaItemEllipsisDropdownComponent} from "../../../modules/controls/mediaItemEllipsisDropdown/media.item.ellipsis.dropdown";
import {MediaService} from '../../../services/media/media.service';
import {NativeNavigatorProvider} from '../../../providers/common/native.navigator.provider';
import {lazyModules} from "../../../app.routes";

export class LoanSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public basketService: BasketService;
    private refreshStarted;
    private modalProvider: IMFXModalProvider;
    private httpService: HttpService;
    private nativeNavigatorProvider: NativeNavigatorProvider;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.modalProvider = injector.get(IMFXModalProvider);
        this.httpService = injector.get(HttpService);
        this.nativeNavigatorProvider = injector.get(NativeNavigatorProvider);
    }

    addToBasket($events) {
        let data = this.getSelectedRowData();

        if (!this.isOrdered(data)) {
            this.basketService.addToBasket(data, 'Media');
        }

        // for update state for other formatters at row
        // let slick = this.getSlick();
        // slick.invalidateRow(this.getSelectedRowId());
        // slick.render();
    }

    removeFromBasket($events) {
        let data = this.getSelectedRowData();
        if (this.isOrdered(data)) {
            this.basketService.removeFromBasket([data]);
        }
    }

    getMediaDetails($events) {
        let data = this.getSelectedRowData();
        let searchType = this.module.searchType.toLowerCase();
        if (!searchType) {
            throw new Error('let searchType is not defined!');
        }
        this.router.navigate(
            [
                appRouter[searchType].detail.substr(
                    0,
                    appRouter[searchType].detail.lastIndexOf('/')
                ),
                data.ID
            ]
        );
    }

    showRaiseWorkflowWizzard($events, rowData) {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.wf_raise,
            RaiseWorkflowWizzardComponent, {
                title: 'rwwizard.title',
                size: 'md',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            });
        modal.load().then((compRef: ComponentRef<RaiseWorkflowWizzardComponent>) => {
            const comp: RaiseWorkflowWizzardComponent = compRef.instance;
            let selectedRows = this.getSelectedRowsData();
            if (this.plugin.multiSelect && selectedRows.length > 1) { // multiselect rows
                let mediaItems = selectedRows.map((el) => {
                    return {ID: el.ID, basket_item_type: "Media"};
                });
                comp.rwwizardprovider.openFromStep(mediaItems, null);
            } else {
                comp.rwwizardprovider.open(this.getSelectedRow().ID, "Media");
            }

        });

    }

    isOrdered(data?: SlickGridRowData): boolean {
        if (!data) {
            data = this.getSelectedRowData();
        }

        return data ? this.basketService.hasItem(data) : false;
    }

    getDownloadLink() {
        let host = `${window.location.protocol}//${window.location.hostname}`;
        let data = this.getSelectedRowData();
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
        return this.module.showMediaLogger;
    }

    goToMediaLogger($events, context?: MediaItemEllipsisDropdownComponent) {
        let data = this.getSelectedRowData();
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
        let data = this.getSelectedRowData();
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
        let data = this.getSelectedRowData();
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
        // let data = this.getSelectedRowData();
        let data = this.getSelectedRowsData();
        let rows: Array<any> = data;
        let clipEditorService: ClipEditorService = this.injector.get(ClipEditorService);
        clipEditorService.setClipEditorType('media');
        // set rows
        clipEditorService.setSelectedRows(rows);

        // set isAudio flag
        let isAudio = (<any>data[0]).MEDIA_TYPE == ItemTypes.AUDIO ? true : false;
        clipEditorService.setIsAudio(isAudio);
        let id = data.map(row => row.ID).join(',');

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

    requestBrowseCopy() {
        console.log('requestBrowseCopy');
    }

    //
    openInRCE($events, rowData) {
        let data = this.getSelectedRowData();
        this.router.navigate(['rce', data.ID]);
    }

    canUnbindMedia(): boolean {
        let data = this.getSelectedRowData();
        let res: boolean = false;
        if (data) {
            res = data.PGM_PARENT_ID == 0;
        }

        return res;
    }

    changeStatus(data) {
        if (!data) {
            data = this.getSelectedRowData();
        }
        let modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.change_status_media,
            MediaChangeStatusComponent,
            {
                title: this.translate.instant('media_status_modal.title') + ' (' + data.TITLE + ')',
                size: 'md',
                position: 'center',
                footer: 'cancel|save'
            }, {data: data, context: this});
        modal.load().then((comp: ComponentRef<MediaChangeStatusComponent>) => {
            const notificator = this.injector.get(NotificationService);
            modal.contentView.instance.onSave.subscribe((res: boolean | string) => {
                if (res === true) {
                    notificator.notifyShow(1, 'media_status_modal.save_success', true, 1000, false);
                } else {
                    const message = (typeof res == 'string') ? res : '';
                    notificator.notifyShow(2, message, true, 1000, false);
                }
            });
        });

    }

    unbind($events) {
        let data = this.getSelectedRowsData();
        let translate = this.injector.get(TranslateService);
        let notificator = this.injector.get(NotificationService);
        let mgs = this.injector.get(MediaService);
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            title: 'media.unattach.alert_title',
            size: 'md',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr =>{
            let alertModal: IMFXModalAlertComponent = cr.instance;
            if (data.length == 1) {
                alertModal.setText('media.unattach.alert_text', {mediaId: data[0].ID});
            } else {
                alertModal.setText('media.unattach.alert_text_multiselect');
            }
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    if (data.length == 1) {
                        mgs.unbindMedia(data[0].ID).subscribe((res: any) => {
                            if (res && res.ErrorCode && res.Result == false) {
                                notificator.notifyShow(2, translate.instant(res.Error));
                            } else {
                                notificator.notifyShow(1, translate.instant('mapping.unbindSuccess'));
                                this.refreshGrid(true);
                            }
                            modal.hide();
                        }, (err) => {
                            notificator.notifyShow(2, translate.instant('mapping.unbindError'));
                            modal.hide();
                        });
                    } else {
                        let mediaIds = data.map((el) => {
                            return el.ID;
                        });
                        mgs.unbindMediaArray(mediaIds).subscribe((res: any) => {
                            if (res && res.ErrorCode && res.Result == false) {
                                notificator.notifyShow(2, translate.instant('mapping.unbindErrorMultiselect') + translate.instant(res.Error));
                            } else {
                                notificator.notifyShow(1, translate.instant('mapping.unbindSuccess'));
                                this.refreshGrid(true);
                            }
                            modal.hide();
                        }, (err) => {
                            notificator.notifyShow(2, translate.instant('mapping.unbindErrorMultiselect'));
                            modal.hide();
                        });
                    }
                }
            });
        });
    }

    afterRequestData(resp, searchModel) {
        if (!this.refreshStarted) {
            super.afterRequestData(resp, searchModel);

        } else {
            let respLength = resp.Rows ? resp.Rows : resp.Data.length;
            let data = this.prepareData(resp.Data, respLength);
            // this.originalPreparedData = data;
            this.updateData(null, data);
            if (this.refreshStarted) {
            }
            this.refreshStarted = false;
        }
    }

    activeWorkflows(): void {
        let data = this.getSelectedRowData();
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
            modalContent.loadData([data.ID]);
        });

    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-addbasket') ||
            $(event.target).hasClass('icons-inbasket') ||
            $(event.target).hasClass('media-basket-button') ||
            $(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).closest('.slick-cell').hasClass('selected');
    }
}
