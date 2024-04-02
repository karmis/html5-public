import {Component, ComponentRef, EventEmitter, Inject, Input, Output, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {ChoosingRowsModalComponent} from '../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component';
import {ChannelsGroupsService} from "../../services/settings.channels-groups.service";
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'settings-channels-tab',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
})
export class SettingsChannelsTabComponent {
    @Output('onDeleteItems') public onDeleteItems: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output('onAddItems') public onAddItems: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Input('data') private data = [];
    @Input('lookup') private lookup = {};
    @Input('isNew') private isNew: boolean = false;
    private selectedRows = [];
    private addModal: IMFXModalComponent;

    constructor(@Inject(TranslateService) protected translate: TranslateService,
                @Inject(ChannelsGroupsService) protected channelsService: ChannelsGroupsService,
                protected modalProvider: IMFXModalProvider) {
    }

    clearSelection() {
        this.selectedRows = [];
    }

    getFriendlyName(code) {
        return this.lookup[code] ? this.lookup[code] : "";
    }

    processRowClick(item, $event, i) {
        if (this.selectedRows.length === 0) {
            this.selectedRows.push(item);
        } else {
            if ($event.ctrlKey) {
                if (this.selectedRows.indexOf(item) > -1) {
                    this.selectedRows.splice(this.selectedRows.indexOf(item), 1);
                } else {
                    this.selectedRows.push(item);
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
        let deleteText = "channels-groups.remove_item";
        textParams["NAME"] = "";
        for (var i = 0; i < this.selectedRows.length; i++) {
            textParams["NAME"] += i == 0 ? this.selectedRows[i] : ", " + this.selectedRows[i];
        }

        let self = this;
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
        }, {context: this});

        this.addModal.load().then((cr: ComponentRef<ChoosingRowsModalComponent>) => {
            this.addModal.modalEvents.subscribe((res: any) => {
                if (res && res.name === "ok") {
                    this.onAddItems.emit(res.$event);
                }
            });

            const content: ChoosingRowsModalComponent = cr.instance;
            this.channelsService.getChannels().subscribe((res: any) => {
                let result = res.Data.filter((x) => {
                    for (let i = 0; i < this.data.length; i++) {
                        if (this.data[i] === x.CH_CODE) {
                            return false;
                        }
                    }
                    return true;
                });
                content.setData(result, "CH_FULL");
                setTimeout(() => {
                    content.toggleOverlay(false);
                });
            });
        })
    }
}
