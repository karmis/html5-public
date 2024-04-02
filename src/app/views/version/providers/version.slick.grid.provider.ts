import {SlickGridProvider} from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import {ComponentFactoryResolver, ComponentRef, Inject, Injector} from "@angular/core";
import {Router} from "@angular/router";
import {BasketService} from "../../../services/basket/basket.service";
import { SlickGridResp, SlickGridRowData } from "../../../modules/search/slick-grid/types";
import {IMFXModalComponent} from "../../../modules/imfx-modal/imfx-modal";
import {UploadComponent} from "../../../modules/upload/upload";
import {IMFXModalProvider} from "../../../modules/imfx-modal/proivders/provider";
import {RaiseWorkflowWizzardComponent} from "../../../modules/rw.wizard/rw.wizard";
import {VersionWizardComponent} from "../../../modules/version-wizard/wizard";
import {VersionWizardProvider} from "../../../modules/version-wizard/providers/wizard.provider";
import {WorkflowListComponent} from '../../workflow/comps/wf.list.comp/wf.list.comp';
import {CreateSubversionModalComponent} from '../../../modules/create.subversion.modal/create.subversion.modal.component';
import {SecurityService} from "../../../services/security/security.service";
import * as $ from "jquery";

import {lazyModules} from "../../../app.routes";
import {UploadRemoteComponent} from "../../../modules/upload-remote/remote.upload";
import { ChangeCustomStatusComponent } from "../../media/comp/change-custom-status/change-custom-status.comp";
import { SearchModel } from "../../../models/search/common/search";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { WorkflowComponent } from "../../workflow/workflow.component";

export class VersionSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public basketService: BasketService;
    popupMultiOpenedData: SlickGridRowData[] = null;
    popupMultiOpened = false;
    private securityService: SecurityService;
    selectedSubRow?: { id?: number, index?: number } = {};


    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.securityService = injector.get(SecurityService);
    }

    upload(data?: SlickGridRowData, files?: FileList) {
        const modalProvider = this.injector.get(IMFXModalProvider);
        if (!this.securityService.hasPermissionByName('media_upload')) {
            console.warn('>>> Upload not allowed');
            return;
        }
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.upload_modal, UploadComponent, {
            title: 'base.media_upload',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {
            forcedUploadMode: 'version'
        });
        modal.load().then((cr: ComponentRef<UploadComponent>) => {
            if (!data || !data.ID) {
                data = this.getSelectedRow();
            }
            const uc: UploadComponent = cr.instance;
            uc.setVersion({id: (<any>data).ID, text: (<any>data).FULLTITLE}, data);
            uc.changeAssociateMode('version');
            uc.disableMedia();
            if (files) {
                uc.onSelectFiles(files);
            }
        })
    }

    /**
     * do not remove
     */
    remoteUpload() {
        const modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.upload_remote_modal, UploadRemoteComponent, {
            title: 'remote_upload.title',
            size: 'lg',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {
            forcedUploadMode: 'version'
        });

        modal.load().then((cr: ComponentRef<UploadRemoteComponent>) => {
            const data = this.getSelectedRow();
            (cr.instance as UploadRemoteComponent).setVersion({
                id: data.ID, text: data.FULLTITLE
            }, data);
        });
    }

    showRaiseWorkflowWizzard(wzSourceType: 'media' | 'version' = 'media') {
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
            let items: number[] | number = this.getSelectedRows().map(item => item.ID);

            if (items.length === 1) {
                items = items[0]
            }

            comp.rwwizardprovider.open(
                items,
                "Version",
                null,
                {
                    VersionSourceType: wzSourceType
                });
        });
    }

    raiseTaskOnMedia() {
        this.showRaiseWorkflowWizzard('media');
    }

    raiseTaskOnVersion() {
        this.showRaiseWorkflowWizzard('version');
    }

    clipEditor($events) {
        const modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.version_wizard, VersionWizardComponent, {
            title: 'version.wizard.title',
            class: 'stretch-modal',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then((cr: ComponentRef<VersionWizardComponent>) => {
            const wizardView: VersionWizardComponent = (<VersionWizardComponent>cr.instance);
            const wizardProvider: VersionWizardProvider = wizardView.provider;
            const data = this.getSelectedRow();
            wizardProvider.showModal(data.ID);
        })
    }

    addToBasket($events) {
        let data = this.getSelectedRowData();
        if (!this.isOrdered(data)) {
            this.basketService.addToBasket(data, "Version");
        }

        // for update state for other formatters at row
        let slick = this.getSlick();
        slick.invalidateRow(this.getSelectedRowId());
        slick.render();
    }

    isOrdered(data?: SlickGridRowData): boolean {
        if (!data) {
            data = this.getSelectedRowData();
        }

        return data ? this.basketService.hasItem(data) : false;
    }

    activeWorkflows($event): void {
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
            modalContent.loadData([data.ID], 'version');
        });
    }

    createSubversion($event) {
        let data = this.getSelectedRowData();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.create_subversion,
            CreateSubversionModalComponent, {
                title: 'version.create_version.title',
                size: 'md',
                position: 'center',
                footer: 'cancel|ok'
            });

        modal.load().then((modal: ComponentRef<CreateSubversionModalComponent>) => {
            let modalContent: CreateSubversionModalComponent = modal.instance;
            modalContent.setContextItem(data);
            modalContent.setItemType("Version");
            modalContent.setSuccessCB(() => {
                setTimeout(() => {
                    this.refreshGrid(true);
                }, 2000);
            });
        });
    }

    openPopups($event) {
        const selectedRows = this.getSelectedRows();
        const btnEl = $($event.target);

        if (selectedRows.length > 1) {
            if (!this.popupMultiOpened) {
                if (!this.module.popupsSelectors) {
                    return;
                }
                const opts = this.module.popupsSelectors[btnEl.data('popupid')];
                if (!opts) {
                    this.hidePopups();
                    return false;
                }

                const offset = btnEl.offset() as any;
                offset.top = offset.top + 4 + (btnEl.height() as any);
                offset.left = offset.left + (btnEl.width() as any);

                $(opts.popupMultiEl).show();
                $(opts.popupMultiEl).offset(offset);

                const outOfconfines = $(window).height() - $(opts.popupMultiEl).children().height() - offset.top - 15;
                if (outOfconfines < 0) {
                    offset.top = offset.top + outOfconfines;
                }
                $(opts.popupMultiEl).offset(offset);
                this.popupMultiOpenedData = selectedRows;
                this.popupMultiOpened = true;
            } else {
                this.hidePopups();
            }
        } else {
            if (!this.popupOpened || (btnEl.data('rowid') != null && btnEl.data('rowid') != this.popupOpenedId)) {
                if (!this.module.popupsSelectors) {
                    return;
                }
                const opts = this.module.popupsSelectors[btnEl.data('popupid')];
                if (!opts) {
                    this.hidePopups();
                    return false;
                }

                // let rowId = btnEl.data('rowid');
                // let model = this.config.gridOptions.api.getModel();
                // this.rowData = model.getRow(rowId - 1);
                const offset = btnEl.offset() as any;
                offset.top = offset.top + 4 + (btnEl.height() as any);
                offset.left = offset.left + (btnEl.width() as any);

                $(opts.popupEl).show();
                $(opts.popupEl).offset(offset);

                const outOfconfines = $(window).height() - $(opts.popupEl).children().height() - offset.top - 15;
                if (outOfconfines < 0) {
                    offset.top = offset.top + outOfconfines;
                }
                $(opts.popupEl).offset(offset);
                this.popupOpened = true;
                this.popupOpenedId = btnEl.data('rowid');
            } else {
                this.hidePopups();
            }
        }
    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).parent().parent().parent().hasClass('selected') ||
            $(event.target).parent().parent().hasClass('selected');
    }

    hidePopups() {
        this.popupOpened = false;
        this.popupOpenedId = null;
        this.popupMultiOpened = false;
        this.popupMultiOpenedData = null;
        if (!this.config.moduleContext) {
            return;
        }
        // this.rowData = null;
        $.each(this.module.popupsSelectors, (l, sel) => {
            if (sel && sel.popupEl) {
                $(sel.popupEl).hide();
            }
            if (sel && sel.popupMultiEl) {
                $(sel.popupMultiEl).hide();
            }

        });
        return;
    }
    onChangeCustom(){
        let data = this.getSelectedRowsData();
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


    refreshGridLazy(ids: number[] = [], message = false) {
        let updateIds,
            searchModel: SearchModel = new SearchModel();

        if (Array.isArray(ids) && ids.length != 0) {
            updateIds = ids;
        } else {
            if (this.getSelectedRows().length) {
                updateIds = this.getSelectedRows().map((e) => e.ID);
            } else if (this.getSelectedSubRow() && this.getSelectedSubRow().hasOwnProperty('id')) {
                updateIds = [this.getDataView().getItemById(this.getSelectedSubRow().id).ID];
            }

        }

        if (updateIds && updateIds.length > 0) {
            const asm_id = new AdvancedSearchModel();

            asm_id.setDBField('ID');
            asm_id.setField('Id');
            asm_id.setOperation('=');
            asm_id.setValue(updateIds.join('|'));
            asm_id.setGroupId(searchModel.getNextAvailableGroupId());
            if (!searchModel.hasAdvancedItem(asm_id)) {
                searchModel.addAdvancedItem(asm_id);
            }

        }

        this._buildPageRequestLazy(searchModel, message);
        (this.componentContext as any).refreshStarted = true;
    }

    private getSelectedSubRow() {
        return this.selectedSubRow;
    }

    private _buildPageRequestLazy(searchModel: SearchModel, message = false) {
        this.onGridStartSearch.emit();

        this.service.search(
            this.config.options.searchType,
            searchModel,
            1,
            '',
            'desc'
        ).subscribe(
            (resp: SlickGridResp) => {
                this.afterRequestDataLazy(resp, searchModel, message);
            }, (err) => {
                this.onGridEndSearch.emit(false);

            }, () => {
                this.onGridEndSearch.emit(true);
            });
    }

    private afterRequestDataLazy(resp, searchModel, message = true) {
        this.selectedRows = this.getSlick().getSelectedRows();
        this.setSelectedRows(this.selectedRows);

        this.selectedRows.forEach((indexRow, i) => {
            const curRow = this.getData()[indexRow];
            if(curRow) {
                const updateRow = this.findNode(curRow.ID, resp.Data[i]);
                if (updateRow) {
                    updateRow.id = curRow.id;
                    this.getDataView().changeItem(updateRow.id, updateRow);
                }
            }
        });

        const data = this.getMergeDataviewData([]);
        this.setOriginalData(data);
        this.updateData(this.selectedRows, data);
        (this.componentContext as WorkflowComponent).refreshStarted = false;
        if(message)
            this.notificationService.notifyShow(1, "saved.save_change_custom_status", true, 1200);
    }
}
