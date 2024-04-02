import {Component, ComponentRef, EventEmitter, Inject, Input, Output, ViewEncapsulation} from '@angular/core';
import {UserGroupType} from '../../../../modals/group.modal/group.modal.component';
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import { TranslateService } from '@ngx-translate/core';
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {UserManagerService} from "../../services/settings.user-manager.service";
import {ResponsibilitiesPresetsType, ResponsibilitiesUsersType} from "../../modals/group.modal/group.modal.component";
import {TabDataUsersModalComponent} from "./modals/tabs.add-data-users.modal/tab.add-data-users.modal.component";
import { ChoosingRowsModalComponent } from '../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component';
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'users-tab',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
})

export class SettingsUsersTabComponent {
    @Output('onDeleteItems') public onDeleteItems: EventEmitter<ResponsibilitiesUsersType[]> = new EventEmitter<ResponsibilitiesUsersType[]>();
    @Output('onAddItems') public onAddItems: EventEmitter<ResponsibilitiesUsersType[]> = new EventEmitter<ResponsibilitiesUsersType[]>();
    @Input('data') private data: ResponsibilitiesUsersType[] = [];
    @Input('isNew') private isNew: boolean = false;
    @Input('readOnly') private readOnly: boolean = true;
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
            textParams["NAME"] += i == 0 ? this.getFullName(this.selectedRows[i]) : ", " + this.getFullName(this.selectedRows[i]);
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
                    this.selectedRows = [];
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    addItems() {
        this.addModal = this.modalProvider.showByPath(lazyModules.tab_add_data_users_modal, TabDataUsersModalComponent, {
            size: "md",
            title: 'user_management.users.modal.add_new',
            position: 'center',
            footerRef: 'modalFooterTemplate',
            usePushState: false
        }, {context: this});

        this.addModal.load().then((cr: ComponentRef<TabDataUsersModalComponent>) => {
            this.addModal.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    this.onAddItems.emit(res.$event);
                }
            });

            const content: ChoosingRowsModalComponent = cr.instance;
            this.userManagerService.getUsers().subscribe((res: ResponsibilitiesUsersType[]) => {
                let result = res.map((item: ResponsibilitiesUsersType) => {
                    item.__FULLNAME = this.getFullName(item);
                    return item;
                }).filter((x: any) => {
                    for (let i = 0; i < this.data.length; i++) {
                        if (this.data[i].ID === x.ID) {
                            return false;
                        }
                    }
                    return true;
                });
                content.setData(result, "__FULLNAME");
                setTimeout(() => {
                    content.toggleOverlay(false);
                });
            });
        });
    }

    private getFullName(item: ResponsibilitiesUsersType) {
        return item.USER_ID + (item.SURNAME?' ' + item.SURNAME:'') + (item.FORENAME?' '+item.FORENAME:'');
    }
}
