import {Component, ComponentRef, EventEmitter, Inject, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {ChoosingRowsModalComponent} from '../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component';
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'user-channels-tab',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
})
export class SettingsUserChannelsTabComponent {
    @Output('onDeleteItems') public onDeleteItems: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output('onAddItems') public onAddItems: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Input('fieldsMap') private fieldsMap = {CH_FULL: "CH_FULL", CH_CODE: "CH_CODE"};
    @Input('data') private data = [];
    @Input('showLeftCode') private showLeftCode = true;
    @Input('tabName') private tabName;
    @Input('lookup') private lookup = [];
    @Input('isNew') private isNew: boolean = false;
    @Input('readOnly') private readOnly: boolean = true;
    private selectedRows = [];
    private addModal: IMFXModalComponent;

    constructor(@Inject(TranslateService) protected translate: TranslateService,
                protected modalProvider: IMFXModalProvider) {
    }

    ngAfterViewInit(): void {
        this.data.sort((a, b) => (a[this.fieldsMap['CH_CODE']] > b[this.fieldsMap['CH_CODE']]) ? 1 : ((b[this.fieldsMap['CH_CODE']] > a[this.fieldsMap['CH_CODE']]) ? -1 : 0));
    }

    clearSelection() {
        this.selectedRows = [];
    }

    processRowClick(item, $event) {
        if (this.readOnly)
            return;
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
        if (this.readOnly || this.selectedRows.length == 0)
            return;

        let textParams = {};
        let deleteText = "user_management.users.modal.remove_item";
        textParams["NAME"] = "";
        for (var i = 0; i < this.selectedRows.length; i++) {
            textParams["NAME"] += i == 0 ? this.selectedRows[i][this.fieldsMap['CH_FULL']] : ", " + this.selectedRows[i][this.fieldsMap['CH_FULL']];
        }

        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then((cr: any) => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                deleteText,
                textParams
            );
        });

        modal.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name === 'ok') {
                this.onDeleteItems.emit(this.selectedRows);
                modal.hide();
            } else if (e.name === 'hide') {
                modal.hide();
            }
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
            let result = this.lookup.filter((x) => {
                for (let i = 0; i < this.data.length; i++) {
                    if (this.data[i][this.fieldsMap['CH_CODE']] === x[this.fieldsMap['CH_CODE']]) {
                        return false;
                    }
                }
                return true;
            });
            result.sort((a, b) => (a[this.fieldsMap['CH_FULL']] > b[this.fieldsMap['CH_FULL']]) ? 1 : ((b[this.fieldsMap['CH_FULL']] > a[this.fieldsMap['CH_FULL']]) ? -1 : 0));
            content.setData(result, this.fieldsMap['CH_FULL']);
            setTimeout(() => {
                content.toggleOverlay(false);
            });
        });
    }
}
