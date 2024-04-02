import { ComponentRef, Inject, Injector } from "@angular/core";
import {
    SlickGridEventData,
    SlickGridFormatterData,
    SlickGridResp,
    SlickGridRowData
} from "../../../modules/search/slick-grid/types";
import { VersionSlickGridProvider } from "../../version/providers/version.slick.grid.provider";
import { MappingComponent } from "../mapping.component";
import { NotificationService } from "../../../modules/notification/services/notification.service";
import { Observable, Subscription } from "rxjs";
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import { IMFXModalComponent } from "../../../modules/imfx-modal/imfx-modal";
import { IMFXModalEvent } from "../../../modules/imfx-modal/types";
import { IMFXModalProvider } from "../../../modules/imfx-modal/proivders/provider";
import { RaiseWorkflowWizzardComponent } from '../../../modules/rw.wizard/rw.wizard';
import { UploadProvider } from "../../../modules/upload/providers/upload.provider";
import { UploadMethod, XmlTreeValidationResult } from "../../../modules/upload/upload";
import { SlickGridService } from '../../../modules/search/slick-grid/services/slick.grid.service';
import {
    MediaInsideMappingComponent,
    MediaInsideMappingTabsEnum
} from '../modules/media-inside-mapping/media.component';
import { SettingsGroupsService } from "../../../services/system.config/settings.groups.service";
import { SearchModel } from '../../../models/search/common/search';
import { JsonProvider } from '../../../providers/common/json.provider';
import { PresetType } from '../../../modules/order-presets-grouped/types';
import { OrderPresetsGroupedModalComponent } from '../../../modules/order-presets-grouped-modal/order-presets-grouped-modal.component';
import { lazyModules } from "../../../app.routes";
import {
    AttachConfirmModalComponent,
    MappingItemListForSaveType
} from '../../media-associate/comps/attach-confirm/attach-confirm-modal.component';
import { UploadGroupSettings } from '../../../modules/upload/types';
import { XMLService } from '../../../services/xml/xml.service';
import $ from 'jquery';
import {SlickProvidersHelper} from "../../../modules/abstractions/slick.providers.helper";

export type MappingRaiseWfSettings = {
    flag: boolean,
    isAllowMulti: boolean,
    preset: PresetType
}

export class MappingSlickGridProvider extends VersionSlickGridProvider {
    public readonly wf_key: string = 'associate.wfrise.setups';
    public notificator: NotificationService;
    public modalProvider: IMFXModalProvider;
    public raiseWFsettings: MappingRaiseWfSettings = {
        flag: false,
        isAllowMulti: false,
        preset: null
    };
    public readonly raiseWFprefix = 'associate_media_workflow';
    onGridAndViewReadySUB: Subscription = null;
    fetchUploadMethodSUB: Subscription = null;
    private settingsGroupsService: SettingsGroupsService;
    private attachConfirmModalOpened: boolean = false;
    private xmlService: XMLService;

    constructor(private jsonProvider: JsonProvider,
                private uploadProvider: UploadProvider,
                @Inject(Injector) public injector: Injector) {
        super(injector);
        this.modalProvider = injector.get(IMFXModalProvider);
        this.settingsGroupsService = injector.get(SettingsGroupsService);
        this.xmlService = injector.get(XMLService)
    }

    initListeners() {
        if (this.onGridAndViewReadySUB) {
            return
        }
        this.onGridAndViewReadySUB = this.componentContext.slickGridComp.provider.onGridAndViewReady.subscribe(() => {
            if (this.fetchUploadMethodSUB) {
                return
            }
            this.fetchUploadMethodSUB = this.uploadProvider.fetchUploadMethod().subscribe((method: UploadMethod) => {
                if (method === 'aspera') {
                    SlickProvidersHelper.asperaUploadInit(this);

                    this.onDropToGrid.subscribe((d: { data: SlickGridFormatterData, event: any }) => {
                        if (d.event.dataTransfer.files.length) {
                            return true;
                        } else {
                            let mediaInsideMapping = (<MappingComponent>this.config.componentContext).mediaInsideMapping;
                            let mimsgp: SlickGridProvider = mediaInsideMapping.slickGridComp.provider;

                            let mids = mimsgp.getSelectedRows();
                            if (!this.attachConfirmModalOpened) {  // TODO: refactor this fast fix
                                this.callAttachConfirmModal(d.data, mids);
                            }
                        }
                    });
                } else {
                    this.onDropToGrid.subscribe((d: { data: SlickGridFormatterData, event: any }) => {
                        if (this.uploadProvider.uploadModalIsOpen) {
                            return;
                        }
                        if (d.event.dataTransfer.files.length) {
                            this.upload(d.data.data, d.event.dataTransfer.files);
                            this.uploadProvider.uploadModalIsOpen = true;
                            SlickProvidersHelper.initializeUploadEvents(this, d);
                        } else {
                            let mediaInsideMapping = (<MappingComponent>this.config.componentContext).mediaInsideMapping;
                            let mimsgp: SlickGridProvider = mediaInsideMapping.slickGridComp.provider;

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

    paramsAdvStorageKey = 'associate.advanced_search.version.setups';
    hookSearchModel(searchModel: SearchModel): Observable<SearchModel> {
        return SlickProvidersHelper.hookSearchModel(this, searchModel);
    }

    callAttachConfirmModal(data, mids) {
        this.settingsGroupsService.getSettingsUserById('uploadSettings').subscribe((uploadSettings: any) => {
            const ugs: UploadGroupSettings = JSON.parse(uploadSettings[0].DATA) as UploadGroupSettings;
            let raiseWFsettings = this.raiseWFsettings;
            let versionTitle = data.data.TITLE;

            let mediaTitle = (mids.length == 1)
                ? "\"" + mids[0].TITLE + "\""
                : (mids.length > 1 && mids.length < 5)
                    ? mids.length + " " + this.translate.instant('mapping.raise_wf_items_less_5')
                    : mids.length + " " + this.translate.instant('mapping.raise_wf_items_more_5');

            if (!mediaTitle) {
                mediaTitle = '[no title]';
            }
            if (ugs.schema && ugs.schema.Id) {
                this.xmlService.getXmlData(ugs.schema.Id).subscribe((xmlData: any) => {
                    let modal: IMFXModalComponent = this.getAssignModal(data, xmlData, true);
                    this.assignModalLoad(modal, raiseWFsettings, mediaTitle, versionTitle, mids, data)
                });
            } else {
                let modal: IMFXModalComponent = this.getAssignModal(data, null, false);
                this.assignModalLoad(modal, raiseWFsettings, mediaTitle, versionTitle, mids, data)
            }
        });
    };

    getAssignModal(data, xmlData = null, hasXml: boolean = false) {
        return this.modalProvider.showByPath(lazyModules.attach_confirm_modal,
            AttachConfirmModalComponent, {
                size: hasXml ? 'lg' : 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            }, {
                row: data.data,
                xmlData: xmlData,
                hasXml: hasXml
            });
    }

    assignModalLoad(modal, raiseWFsettings, mediaTitle, versionTitle, mids, data) {
        modal.load().then(cr => {
            this.attachConfirmModalOpened = true;
            let modalContent: AttachConfirmModalComponent = cr.instance;
            let confirmParams = (raiseWFsettings.flag && raiseWFsettings.preset)
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

            modalContent.setText(confirmParams.text, confirmParams.textParams, mids);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.showOverlay();
                    modalContent.isValidSchema().subscribe((res: XmlTreeValidationResult[]) => {
                        let isValid: boolean = true;
                        $.each(res, (k: number, obj: XmlTreeValidationResult) => {
                            if (!obj.result) {
                                modalContent.onSelect(obj.model, true, true);
                                isValid = false;
                                return false;
                            }
                        });

                        if (isValid) {
                            modal.hideOverlay();
                            modal.hide();
                            const prepared: { ItemList: MappingItemListForSaveType[] } = modalContent.getPreparedForSaveObject()
                            this.doAttach(data, mids, prepared);
                        } else {
                            modal.hideOverlay();
                            return
                        }
                    });

                } else if (e.name === 'hide') {
                    modal.hide();
                }
                this.attachConfirmModalOpened = false;
            });
        });
    }

    doAttach(data, mids, prepared: { ItemList: MappingItemListForSaveType[] }) {
        let raiseWFsettings = this.raiseWFsettings;
        // const comp: MappingComponent = this.config.componentContext;
        let midIds = mids.map((row: SlickGridRowData) => {
            return row.ID;
        });

        this.mapMediaToVersion(data.data.ID, prepared).subscribe((res: any) => {
            if (res && raiseWFsettings.flag) {
                this.showRaiseWorkflowModal(midIds, raiseWFsettings.preset);
            }
        });
    }

    mapMediaToVersion(toId: number, dragRows: { ItemList: MappingItemListForSaveType[] }): Observable<void> {
        return new Observable((observer) => {
            let mediaInsideMapping = (<MappingComponent>this.config.componentContext).mediaInsideMapping;
            let mimsgp: SlickGridProvider = mediaInsideMapping.slickGridComp.provider;

            (<MappingComponent>this.config.componentContext).mediaService.bindMediaToVersion(toId, dragRows).subscribe((resp: any) => {
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
                footerRef: 'modalFooterTemplate',
                usePushState: false
            });

        modal.load().then((compRef: ComponentRef<RaiseWorkflowWizzardComponent>) => {
            const comp: RaiseWorkflowWizzardComponent = compRef.instance;
            let mediaItems = midIds.map((el) => {
                return {ID: el, basket_item_type: "Media"};
            });
            comp.rwwizardprovider.openFromStep(mediaItems, {
                preset: preset,
                workflowPerItem: (mediaItems.length > 1)
                    ? !this.raiseWFsettings.isAllowMulti
                    : false
            });
        });
    }

    setSelectedRows(rowIds: number[]) {
        super.setSelectedRows(rowIds);

        if (rowIds.length > 1) {
            let comp: MediaInsideMappingComponent = (<MappingComponent>this.config.componentContext).mediaInsideMapping;
            if (!comp) {
                return;
            }
            comp.clearResultForAssociatedMediaGrid();
        }
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        if (rowId == null)
            this.setNullRow(suppressDataUpdated);
        else {
            this.getSlick().setSelectedRows([rowId]);
            this._selectedRowsIds = [rowId];
            this.setNotNullRow(eventData, suppressDataUpdated, rowId);
        }
    }

    onRowChanged(_data?: SlickGridEventData, forced: boolean = false): any {
        const comp: MediaInsideMappingComponent = (<MappingComponent>this.config.componentContext).mediaInsideMapping;
        if (!comp) {
            return;
        }

        if (!forced) {
            //if clicked same row
            if (_data && this.lastData && (_data.row === this.lastData.row)) {
                return;
            }
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
        const provider: SlickGridProvider = comp.associatedMediaSlickGridComp.provider;
        const extendColumns = provider.extendedColumns;
        comp.clearResultForAssociatedMediaGrid();
        if (comp && data.row) {
            if (comp.currentTab === MediaInsideMappingTabsEnum.associated) {
                provider.showOverlay();
            }
            provider.PagerProvider.setPage(1, false);
            service.getRowsByIdVersionsToMedia(data.row.ID, extendColumns, 1, provider, {
                context: (this.componentContext as MappingComponent).mediaInsideMapping, field: 'associatedMediaGridConfig'
            }).subscribe((resp: any) => {
                    provider.buildPageByData(resp);
                }, () => {
                    if (comp.currentTab === MediaInsideMappingTabsEnum.associated) {
                        provider.hideOverlay();
                    }
                }, () => {
                    if (comp.currentTab === MediaInsideMappingTabsEnum.associated) {
                        provider.hideOverlay();
                    }
                });
        }
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
                , this.raiseWFsettings).subscribe(undefined
                , (err) => {
                    console.log('serverStorage.store', this.raiseWFprefix, err);
                });
        }
    }

    retriveRaiseWfOptions() {
        const mediaInsideMapping = (this.componentContext as MappingComponent).mediaInsideMapping;
        this.serverStorage.retrieve([this.raiseWFprefix]).subscribe((res: any) => {
            const value = res && res[0].Value;
            const raiseWFsettings: MappingRaiseWfSettings = this.jsonProvider.isValidJSON(value)
                ? JSON.parse(value)
                : value;

            if (raiseWFsettings) {
                this.raiseWFsettings = raiseWFsettings;
                mediaInsideMapping.cdr.detectChanges();
            } else {
                this.loadRaiseWfOptionsFromConfig();
            }
        }, (err) => {
            console.log('serverStorage.retrive', this.raiseWFprefix, err);
        });
    }

    loadRaiseWfOptionsFromConfig() {
        const mediaInsideMapping = (this.componentContext as MappingComponent).mediaInsideMapping;
        this.serverGroupStorageService.retrieve({global: [this.wf_key], local: [this.wf_key]}).subscribe((res: any) => {
            if (!res.global[this.wf_key]) {
                return;
            }

            let wfSetups = JSON.parse(res.global[this.wf_key] || null);
            if (wfSetups) {
                wfSetups = wfSetups ? wfSetups : this.raiseWFsettings;
                this.raiseWFsettings = $.extend(true, this.raiseWFsettings, wfSetups);
                mediaInsideMapping.cdr.detectChanges();
            }


        });
    }

    protected _setSelectionAndDataAfterRequest(resp: SlickGridResp, searchModel?: SearchModel) {
        super._setSelectionAndDataAfterRequest(resp, searchModel, true, false);
    }
}
