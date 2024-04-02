import { ComponentRef, Inject, Injector } from "@angular/core";
import {
    SlickGridEventData,
    SlickGridFormatterData,
    SlickGridResp,
    SlickGridRowData
} from "../../../modules/search/slick-grid/types";
import { MediaSlickGridProvider } from "../../media/providers/media.slick.grid.provider";
import { MediaAssociateComponent } from "../media-associate.component";
import { Observable } from "rxjs";
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import { IMFXModalComponent } from "../../../modules/imfx-modal/imfx-modal";
import { IMFXModalAlertComponent } from "../../../modules/imfx-modal/comps/alert/alert";
import { IMFXModalEvent } from "../../../modules/imfx-modal/types";
import { IMFXModalProvider } from "../../../modules/imfx-modal/proivders/provider";
import { RaiseWorkflowWizzardComponent } from '../../../modules/rw.wizard/rw.wizard';
import { UploadProvider } from "../../../modules/upload/providers/upload.provider";
import { UploadMethod } from "../../../modules/upload/upload";
import { SlickGridService } from '../../../modules/search/slick-grid/services/slick.grid.service';
import { MediaInsideMediaAssociateComponent } from '../modules/media-inside-media-associate/media.component';
import { SearchModel } from '../../../models/search/common/search';
import { JsonProvider } from '../../../providers/common/json.provider';
import { PresetType } from '../../../modules/order-presets-grouped/types';
import { OrderPresetsGroupedModalComponent } from '../../../modules/order-presets-grouped-modal/order-presets-grouped-modal.component';
import { lazyModules } from "../../../app.routes";
import {SlickProvidersHelper} from "../../../modules/abstractions/slick.providers.helper";

export type MediaAssociateRaiseWfSettings = {
    flag: boolean,
    preset: PresetType
}

export class MediaAssociateSlickGridProvider extends MediaSlickGridProvider {
    public readonly wf_key: string = 'associate_media.wfrise.setups';
    public raiseWFsettings: MediaAssociateRaiseWfSettings = {
        flag: false,
        preset: null
    };
    public readonly raiseWFprefix = 'media_associate_media_workflow';
    private attachConfirmModalOpened: boolean = false;

    constructor(private jsonProvider: JsonProvider,
                private uploadProvider: UploadProvider,
                @Inject(Injector) public injector: Injector) {
        super(injector);
    }

    initListeners() {
        this.componentContext.slickGridComp.provider.onGridAndViewReady.subscribe(() => {
            this.uploadProvider.fetchUploadMethod().subscribe((method: UploadMethod) => {
                if (method === 'aspera') {
                    SlickProvidersHelper.asperaUploadInit(this);

                    this.onDropToGrid.subscribe((d: { data: SlickGridFormatterData, event: any }) => {
                        if (d.event.dataTransfer.files.length) {
                            return true;
                        } else {
                            let mediaInsideMediaAssociate = (<MediaAssociateComponent>this.config.componentContext).mediaInsideMediaAssociate;
                            let mimsgp: SlickGridProvider = mediaInsideMediaAssociate.slickGridComp.provider;

                            let mids = mimsgp.getSelectedRows();
                            if (!this.attachConfirmModalOpened) {  // TODO: refactor this fast fix
                                this.callAttachConfirmModal(d.data, mids);
                            }
                        }
                    });
                } else {
                    this.onDropToGrid.subscribe((d: { data: SlickGridFormatterData, event: any }) => {
                        if (d.event.dataTransfer.files.length) {
                            this.uploadProvider.uploadModalIsOpen = true;
                            SlickProvidersHelper.initializeUploadEvents(this, d);
                        } else {
                            let mediaInsideMediaAssociate = (<MediaAssociateComponent>this.config.componentContext).mediaInsideMediaAssociate;
                            let mimsgp: SlickGridProvider = mediaInsideMediaAssociate.slickGridComp.provider;

                            let mids = mimsgp.getSelectedRows();
                            if (!this.attachConfirmModalOpened) {  // TODO: refactor this fast fix
                                this.callAttachConfirmModal(d.data, mids);
                            }
                        }
                    });
                }
            })
        })
    }

    paramsAdvStorageKey = 'associate_media.advanced_search.version.setups';
    hookSearchModel(searchModel: SearchModel): Observable<SearchModel> {
        return SlickProvidersHelper.hookSearchModel(this, searchModel);
    }

    callAttachConfirmModal(data, mids) {
        this.attachConfirmModalOpened = true;
        const comp: MediaAssociateComponent = this.config.componentContext;
        let raiseWFsettings = this.raiseWFsettings;
        let versionTitle = data.data.FULLTITLE || data.data.TITLE;
        let mediaTitle = (mids.length == 1)
            ? "\"" + mids[0].TITLE + "\""
            : (mids.length > 1 && mids.length < 5)
                ? mids.length + " " + this.translate.instant('mapping.raise_wf_items_less_5')
                : mids.length + " " + this.translate.instant('mapping.raise_wf_items_more_5');


        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            let confirmParams = (raiseWFsettings.flag)
                ? {
                    text: 'mapping.attach_n_raise_confirm',
                    textParams: {
                        mediaTitle: mediaTitle,
                        versionTitle: versionTitle,
                        userPreset: raiseWFsettings.preset['Name']
                    }
                }
                : {
                    text: 'mapping.attach_confirm',
                    textParams: {mediaTitle: mediaTitle, versionTitle: versionTitle}
                };

            modalContent.setText(confirmParams.text, confirmParams.textParams);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide();
                    this.doAttach(data, mids);
                } else if (e.name === 'hide') {
                    modal.hide();
                }
                this.attachConfirmModalOpened = false;
            });
        });

    };

    doAttach(data, mids) {
        let raiseWFsettings = this.raiseWFsettings;
        const comp: MediaAssociateComponent = this.config.componentContext;
        let midId = mids.map((row: SlickGridRowData) => {
            return row.ID;
        })[0];

        this.mapMediaToMedia(data.data.ID, midId).subscribe((res: any) => {
            if (res && raiseWFsettings.flag) {
                this.showRaiseWorkflowModal([midId], raiseWFsettings.preset);
            }
        });
    }

    mapMediaToMedia(toId: number, dragRow: number): Observable<void> {
        return new Observable((observer) => {
            let mediaInsideMediaAssociate = (<MediaAssociateComponent>this.config.componentContext).mediaInsideMediaAssociate;
            let mimsgp: SlickGridProvider = mediaInsideMediaAssociate.slickGridComp.provider;

            (<MediaAssociateComponent>this.config.componentContext).mediaService.bindMediaToMedia(toId, dragRow).subscribe((resp: any) => {
                if (resp.Result === false) {
                    this.notificationService.notifyShow(2, this.translate.instant('mapping.errorPrefix') + resp.Error);
                } else {
                    mimsgp.refreshGrid();
                    mimsgp.setSelectedRow();
                    this.notificationService.notifyShow(1, this.translate.instant('mapping.bindSuccess'));
                }

                observer.next(resp.Result);
            }, (err) => {
                this.notificationService.notifyShow(2, this.translate.instant('mapping.bindError'));
                console.error(err);
                observer.error();
            }, () => {
                observer.complete();
            });
        });
    }

    showRaiseWorkflowModal(midIds, preset) {
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
            let mediaItems = midIds.map((el) => {
                return {ID: el, basket_item_type: "Media"};
            });
            comp.rwwizardprovider.openFromStep(mediaItems, {preset: preset});
        });
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        let mediaInsideMediaAssociate = (<MediaAssociateComponent>this.config.componentContext).mediaInsideMediaAssociate;
        let mimsgp: any = mediaInsideMediaAssociate.slickGridComp.provider;
        if (rowId == null)
            this.setNullRow(suppressDataUpdated);
        else {
            mimsgp.setSelectedRow();
            mimsgp.onSelectRow.emit([]); // reset DnD formatters
            this.getSlick().setSelectedRows([rowId]);
            this._selectedRowsIds = [rowId];
            this.setNotNullRow(eventData, suppressDataUpdated, rowId);
        }
    }

    onRowChanged(_data?: SlickGridEventData): any {
        const comp: MediaInsideMediaAssociateComponent = (<MediaAssociateComponent>this.config.componentContext).mediaInsideMediaAssociate;
        if (!comp) {
            return;
        }

        //if clicked same row
        if (_data && this.lastData && (_data.row === this.lastData.row)) {
            return;
        }

        let data = _data;
        if (!_data) {
            data = this.lastData;
        }
        if (!data) {
            return;
        }

        this.lastData = data;
        const service: any = this.injector.get(SlickGridService);
    }

    openChoosePresetModal(doSave: boolean = true, callBacks = null) {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.order_presets_grouped_modal,
            OrderPresetsGroupedModalComponent, {
                title: 'mapping.wf_preset',
                size: 'md',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            });

        modal.load().then((compRef: ComponentRef<OrderPresetsGroupedModalComponent>) => {
            const comp: OrderPresetsGroupedModalComponent = compRef.instance;
            comp.onReadyContent.subscribe(() => {
                if (this.raiseWFsettings.preset) {
                    comp.opgComp.setPresetActive(this.raiseWFsettings.preset);
                }
            });
        });

        modal.modalEvents.subscribe((res: IMFXModalEvent) => {
            if (res && res.name == "ok") {
                this.raiseWFsettings.preset = res.$event;
                if (callBacks && (typeof callBacks['ok'] == 'function')) {
                    callBacks['ok'].call();
                }
                if (doSave)
                    this.saveRaiseWFsettingsOnServer();
            }
        });
    }

    saveRaiseWFsettingsOnServer() {
        if (typeof this.raiseWFsettings.flag == 'boolean' && typeof this.raiseWFsettings.preset == 'object') {
            this.serverStorage.store(
                this.raiseWFprefix
                , this.raiseWFsettings).subscribe(()=>{}
                , (err) => {
                    console.log('serverStorage.store', this.raiseWFprefix, err);
                });
        }
    }

    retriveRaiseWfOptions() {
        const mediaInsideMediaAssociate = (this.componentContext as MediaAssociateComponent).mediaInsideMediaAssociate;
        this.serverStorage.retrieve([this.raiseWFprefix]).subscribe((res: any) => {
            const value = res && res[0].Value;
            const raiseWFsettings: MediaAssociateRaiseWfSettings = this.jsonProvider.isValidJSON(value)
                ? JSON.parse(value)
                : value;

            if (raiseWFsettings) {
                this.raiseWFsettings = raiseWFsettings;
                mediaInsideMediaAssociate.cdr.detectChanges();
                // this.mappingProvider.raiseWFsettingsChange.emit(this.raiseWFsettings);
            } else {
                this.loadRaiseWfOptionsFromConfig();
            }
        }, (err) => {
            console.log('serverStorage.retrive', this.raiseWFprefix, err);
        });
    }

    loadRaiseWfOptionsFromConfig() {
        const mediaInsideMediaAssociate = (this.componentContext as MediaAssociateComponent).mediaInsideMediaAssociate;
        this.serverGroupStorageService.retrieve({global: [this.wf_key], local: [this.wf_key]}).subscribe((res: any) => {
            if (!res.global[this.wf_key]) {
                return;
            }

            let wfSetups = JSON.parse(res.global[this.wf_key] || null);
            if (wfSetups) {
                wfSetups = wfSetups ? wfSetups : this.raiseWFsettings;
                this.raiseWFsettings = $.extend(true, this.raiseWFsettings, wfSetups);
                mediaInsideMediaAssociate.cdr.detectChanges();
            }


        });
    }

    //toDo refactor func in parent provider. it's a temporary decision.
    protected _setSelectionAndDataAfterRequest(resp: SlickGridResp, searchModel?: SearchModel) {
        this.selectedRows = this.getSlick().getSelectedRows();
        let data = this.prepareData(resp.Data, resp.Data.length);
        if (this.getData().length) {
            this.clearData(false);
        }

        this.setData(data, true);
        (<any>this.componentContext).refreshStarted = false;

        if (data.length > 0) {
            if (this.selectedRows.length > 0) {
                this.setSelectedRows(this.selectedRows);
            } else if (this.selectedRows.length == 0 && this.module.selectFirstRow == true) {
                this.setSelectedRow(0, data[0]); // selected first row
            }

        } else if (data.length == 0) {
            this.setSelectedRow(null, null, true);
        }
    }

}
