import {Component, ComponentRef, EventEmitter, Inject, Input, Output, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {UserManagerService} from "../../services/settings.user-manager.service";
import {ChoosingRowsModalComponent} from '../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component';
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'user-groups-tab',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
})

export class SettingsUserGroupsTabComponent {
    @Output('onDeleteItems') public onDeleteItems: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output('onAddItems') public onAddItems: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Input('data') private data;
    @Input('user') private user;
    private selectedRows = [];
    private addModal: IMFXModalComponent;

    constructor(@Inject(TranslateService) protected translate: TranslateService,
                @Inject(UserManagerService) protected userManagerService: UserManagerService,
                protected modalProvider: IMFXModalProvider) {
    }

    clearSelection() {
        this.selectedRows = [];
    }

    processRowClick(item, $event, i) {
        if (this.selectedRows.length == 0) {
            this.selectedRows.push(item);
        } else {
            if ($event.ctrlKey) {
                if (this.selectedRows.indexOf(item) > -1) {
                    this.selectedRows.splice(this.selectedRows.indexOf(item), 1);
                } else {
                    this.selectedRows.push(item)
                }
            } else {
                if (this.selectedRows.length == 1 && this.selectedRows[0] == item) {
                    this.selectedRows = [];
                } else {
                    this.selectedRows = [];
                    this.selectedRows.push(item);
                }
            }
        }
    }

    deleteItems() {
        if (this.selectedRows.length == 0)
            return;

        let textParams = {};
        let deleteText = "user_management.users.modal.remove_item_group";
        textParams["USER"] = this.user ? this.user : "";
        textParams["NAME"] = "";
        for (var i = 0; i < this.selectedRows.length; i++) {
            textParams["NAME"] += i == 0 ? this.selectedRows[i].NAME : ", " + this.selectedRows[i].NAME;
        }

        let self = this;
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then((cr: ComponentRef<IMFXModalAlertComponent>) => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                deleteText,
                textParams
            );
        });
        modal.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name === 'ok') {
                let result = this.data.filter((x) => {
                    for (var i = 0; i < this.selectedRows.length; i++) {
                        if (this.selectedRows[i]["ID"] == x["ID"]) {
                            return false;
                        }
                    }
                    return true;
                }).map(field => field["ID"]);
                this.onDeleteItems.emit(result);
                this.selectedRows = [];
                modal.hide();
            } else if (e.name === 'hide') {
                modal.hide();
            }
        });
    }

    addItems() {
        this.selectedRows = [];
        this.addModal = this.modalProvider.showByPath(lazyModules.choose_rows_modal, ChoosingRowsModalComponent, {
            size: "sm",
            title: 'user_management.users.modal.add_group',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this});

        this.addModal.load().then((cr: ComponentRef<ChoosingRowsModalComponent>) => {
            this.addModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    this.onAddItems.emit(res.$event);
                }
            });
            const content = cr.instance;
            this.userManagerService.getGroups().subscribe((res: any) => {
                let result = res.filter((x) => {
                    for (let i = 0; i < this.data.length; i++) {
                        if (this.data[i].ID == x.ID) {
                            return false;
                        }
                    }
                    return true;
                });
                content.setData(result, "NAME");
            });
        });
    }
}
