import { ComponentRef, Inject, Injector } from "@angular/core";
import {
    SlickGridEventData,
    SlickGridFormatterData,
    SlickGridResp
} from "../../../modules/search/slick-grid/types";
import { VersionSlickGridProvider } from "../../version/providers/version.slick.grid.provider";
import { SupplierPortalComponent } from "../supplier.portal.component";
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridService } from '../../../modules/search/slick-grid/services/slick.grid.service';
import { MediaInsideSupplierPortalComponent } from '../modules/media-inside-supplier-portal/media.component';
import { SearchModel } from '../../../models/search/common/search';
import { UploadMethod} from '../../../modules/upload/upload';
import { UploadProvider } from '../../../modules/upload/providers/upload.provider';
import { Observable } from 'rxjs';
import { IMFXModalProvider } from '../../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../modules/imfx-modal/imfx-modal';
import { RaiseWorkflowWizzardComponent } from '../../../modules/rw.wizard/rw.wizard';
import { IMFXModalEvent } from '../../../modules/imfx-modal/types';
import { PresetType } from '../../../modules/order-presets-grouped/types';
import { OrderPresetsGroupedModalComponent } from '../../../modules/order-presets-grouped-modal/order-presets-grouped-modal.component';
import {lazyModules} from "../../../app.routes";
import {SlickProvidersHelper} from "../../../modules/abstractions/slick.providers.helper";

export class SupplierPortalSlickGridProvider extends VersionSlickGridProvider {
    public modalProvider: IMFXModalProvider;
    private vcSetupsStorageKey: string = 'supplier_portal.version_complete.setups';
    public vcSettings: PresetType = null;
    constructor(@Inject(Injector) public injector: Injector, private uploadProvider: UploadProvider) {
        super(injector);
        this.modalProvider = injector.get(IMFXModalProvider);
    }

    initListeners() {
        this.uploadProvider.fetchUploadMethod().subscribe((method: UploadMethod) => {
            if(method === 'aspera') {
                SlickProvidersHelper.asperaUploadInit(this);
            } else {
                this.onDropToGrid.subscribe((d: { data: SlickGridFormatterData, event: any }) => {
                    if (d.event.dataTransfer.files.length) {
                        this.upload(d.data.data, d.event.dataTransfer.files);
                        SlickProvidersHelper.initializeUploadEvents(this, d);
                    }
                });
            }
        });
    }

    setSelectedRows(rowIds: number[]) {
        super.setSelectedRows(rowIds);

        if(rowIds.length > 1) {
            let comp: MediaInsideSupplierPortalComponent = (<SupplierPortalComponent>this.config.componentContext).mediaInsideSupplierPortal;
            if (!comp) {
                return;
            }
            comp.clearResultForAssociatedMediaGrid();
        }
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        let mediaInsideSupplierPortal = (<SupplierPortalComponent>this.config.componentContext).mediaInsideSupplierPortal;
        let mimsgp: any = mediaInsideSupplierPortal.slickGridComp.provider;
        if (rowId == null)
            this.setNullRow(suppressDataUpdated);
        else {
            mimsgp.setSelectedRow();
            mimsgp.onSelectRow.emit([]); // reset DnD formatters
            this.getSlick().setSelectedRows([rowId]);
            this._selectedRowsIds = [rowId];
            if (rowId != this.prevRowId) {
                this.setNotNullRow(eventData, suppressDataUpdated, rowId);
            }
        }
    }

    protected _setSelectionAndDataAfterRequest(resp: SlickGridResp, searchModel?: SearchModel) {
        super._setSelectionAndDataAfterRequest(resp, searchModel, true, false);
    }

    onRowChanged(_data?: SlickGridEventData): any {
        let comp: MediaInsideSupplierPortalComponent = (<SupplierPortalComponent>this.config.componentContext).mediaInsideSupplierPortal;
        if (!comp) {
            return;
        }
        let data = _data;
        if (!_data) {
            data = this.lastData;
        }
        if (!data) {
            return;
        }
        let service: any = this.injector.get(SlickGridService);
        let provider: SlickGridProvider = comp.slickGridComp.provider;
        const extendColumns = comp.slickGridComp.provider.extendedColumns;
        comp.clearResultForAssociatedMediaGrid();
        this.lastData = data;
        if (comp && data.row) {
            provider.showOverlay();
            provider.PagerProvider.setPage(1, false);
            service.getRowsByIdVersionsToMedia(data.row.ID, extendColumns, 1, provider)
                .subscribe((resp: any) => {
                    provider.buildPageByData(resp);
                }, () => {
                    provider.hideOverlay();
                }, () => {
                    provider.hideOverlay();
                });
        }

    }

    hookSearchModel(searchModel: SearchModel): Observable<SearchModel> {
        return SlickProvidersHelper.hookSearchModel(this, searchModel);
    }

    onRowDoubleClicked(data: SlickGridEventData) {
    }

    completeVersion($event) {
        const modalProvider = this.injector.get(IMFXModalProvider);

        const modal: IMFXModalComponent = modalProvider.showByPath(
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
                this.getSelectedRow().ID,
                "Version",
                null,
                {
                    preset: this.vcSettings || null,
                    showZeroStep: false,
                    VersionSourceType: 'version'
                }
            );
        });
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
                if (this.vcSettings) {
                    comp.opgComp.setPresetActive(this.vcSettings);
                }
            });
        });

        modal.modalEvents.subscribe((res: IMFXModalEvent) => {
            if (res && res.name == "ok") {
                this.vcSettings = res.$event;
                if (callBacks && (typeof callBacks['ok'] == 'function')) {
                    callBacks['ok'].call();
                }
            }
        });
    }

    retriveVCOptions() {
        this.serverGroupStorageService.retrieve({
            local: [this.vcSetupsStorageKey]
        }).subscribe((res:any) => {
            if (!res.local[this.vcSetupsStorageKey]) {
                return;
            }

            let vcSetups = JSON.parse(res.local[this.vcSetupsStorageKey] || null);
            if (vcSetups) {
                vcSetups = vcSetups ? vcSetups : this.vcSettings;
                this.vcSettings = $.extend(true, this.vcSettings, vcSetups);
            }
        });
    }

}
