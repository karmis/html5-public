import {Component, ComponentRef, EventEmitter, Inject, Input, Output, ViewEncapsulation} from '@angular/core';
import {UserGroupType} from '../../../../modals/group.modal/group.modal.component';
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import { TranslateService } from '@ngx-translate/core';
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {UserManagerService} from "../../services/settings.user-manager.service";
import {ResponsibilitiesPresetsType} from "../../modals/group.modal/group.modal.component";
import { ChoosingRowsModalComponent } from '../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component';
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'user-presets-tab',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
})

export class SettingsUserPresetsTabComponent {
    @Output('onDeleteItems') public onDeleteItems: EventEmitter<ResponsibilitiesPresetsType[]> = new EventEmitter<ResponsibilitiesPresetsType[]>();
    @Output('onAddItems') public onAddItems: EventEmitter<ResponsibilitiesPresetsType[]> = new EventEmitter<ResponsibilitiesPresetsType[]>();
    @Output('onSetItems') public onSetItems: EventEmitter<ResponsibilitiesPresetsType[]> = new EventEmitter<ResponsibilitiesPresetsType[]>();
    @Input('data') private data: ResponsibilitiesPresetsType[] = [];
    @Input('isNew') private isNew: boolean = false;
    @Input('readOnly') private readOnly: boolean = true;
    @Input('isSelectAll') private isSelectAll: boolean = false;
    @Input('isSelectedAll') private isSelectedAll: boolean = false;
    private selectedRows = [];
    private addModal: IMFXModalComponent;
    private lastClickedRow: number = 0;

    constructor(@Inject(TranslateService) protected translate: TranslateService,
                @Inject(UserManagerService) protected userManagerService: UserManagerService,
                protected modalProvider: IMFXModalProvider) {
    }

    clearSelection() {
        this.selectedRows = [];
    }

    processRowClick(item, $event, i) {
        if (this.readOnly) {
            return
        }
        if ($event.shiftKey) {
            if(this.lastClickedRow > i){
                this.selectedRows = this.selectedRows.concat(this.data.slice(i, this.lastClickedRow));
            } else {
                this.selectedRows = this.selectedRows.concat(this.data.slice(this.lastClickedRow, i+1));
            }

            return;
        }
        this.lastClickedRow = i;
        if (this.selectedRows.length == 0) {
            this.selectedRows.push(item);
        } else {
            if ($event.ctrlKey) {
                if (this.selectedRows.indexOf(item) > -1) {
                    this.selectedRows.splice(this.selectedRows.indexOf(item), 1);
                }
                else {
                    this.selectedRows.push(item)
                }
            } else {
                if (this.selectedRows.length == 1 && this.selectedRows[0] == item) {
                    this.selectedRows = [];
                }
                else {
                    this.selectedRows = [];
                    this.selectedRows.push(item);
                }
            }
        }
    }

    deleteItems() {
        if (this.readOnly || this.selectedRows.length == 0)
            return;

        let textParams = {};
        let deleteText = "user_management.users.modal.remove_item";
        textParams["NAME"] = "";
        for (let i = 0; i < this.selectedRows.length; i++) {
            textParams["NAME"] += i == 0 ? this.selectedRows[i].NAME : ", " + this.selectedRows[i].NAME;
        }
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                deleteText,
                textParams
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.onDeleteItems.emit(this.selectedRows);
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    addItems() {
        this.addModal = this.modalProvider.showByPath(lazyModules.choose_rows_modal, ChoosingRowsModalComponent, {
            size: "sm",
            title: 'user_management.users.modal.add_new',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, isSelectAll: this.isSelectAll, isSelectedAll: this.isSelectedAll});

        this.addModal.load().then((cr: ComponentRef<ChoosingRowsModalComponent>) => {
            this.addModal.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    if (res.$event && res.$event.length !== 0) {
                        if (this.isSelectedAll === true) {
                            this.onChangeSelectAll(false);
                        }
                        this.onAddItems.emit(res.$event);
                    }
                }
            });


            let content: ChoosingRowsModalComponent = cr.instance;
            this.userManagerService.getPresets().subscribe((res: ResponsibilitiesPresetsType[]) => {
                let result = res.filter((x) => {
                    for (let i = 0; i < this.data.length; i++) {
                        if (this.data[i].ID === x.ID) {
                            return false;
                        }
                    }
                    return true;
                });
                content.setData(result, "NAME");
                setTimeout(() => {
                    content.toggleOverlay(false);
                });
            });
        })
    }

    onChangeSelectAll(isSelectedAll: boolean, silent: boolean = true) {
        if (isSelectedAll === true) {
            if(this.data.length > 0){
                let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
                    IMFXModalAlertComponent, {
                    size: 'md',
                    title: 'modal.titles.confirm',
                    position: 'center',
                    footer: 'cancel|ok'
                });
                modal.load().then(cr => {

                    let modalContent: IMFXModalAlertComponent = cr.instance;
                    modalContent.setText(
                        this.translate.instant('user_management.is_sure_access_to_all_presets')
                    );
                    modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                        if (e.name === 'ok') {
                            this.isSelectedAll = isSelectedAll;
                            this.onSetItems.emit([<ResponsibilitiesPresetsType>{ID: 0, NAME: "ALL"}]);
                            this.selectedRows = [];
                            modal.hide();
                        } else if (e.name === 'hide') {
                            modal.hide();
                        }
                    });
                })
            } else {
                this.isSelectedAll = isSelectedAll;
                this.onSetItems.emit([<ResponsibilitiesPresetsType>{ID: 0, NAME: "ALL"}]);
                this.selectedRows = [];
            }
        } else {
            this.isSelectedAll = isSelectedAll;
            this.onSetItems.emit();
        }
    }
}
