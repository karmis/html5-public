import {
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import { NotificationService } from "../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import { ChannelsGroupsService } from "../../services/settings.channels-groups.service";
import { ChangeModalBaseComponent } from '../../../../../../../modules/abstractions/change.modal.base.component';
import {Observable, Subject, Subscriber} from "rxjs";
import {takeUntil} from "rxjs/internal/operators";

@Component({
    selector: 'channel-groups-change-modal',

    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ChannelsGroupsService
    ]
})

export class ChannelsGroupChangeModalComponent extends ChangeModalBaseComponent {
    private channelsLookup = {};
    private destroyed$: Subject<any> = new Subject();

    constructor(public injector: Injector,
                protected service: ChannelsGroupsService,
                public cd: ChangeDetectorRef,
                @Inject(TranslateService) public translate: TranslateService,
                protected notificationService: NotificationService) {
        super(injector, cd, translate);
        this.data.Lookups["Channels"].map((val) => {
            this.channelsLookup[val.ID] = val.Name;
            return {id: val.ID, text: val.Name};
        });

        let newDataTable = this.cols;
        if (this.isNew) {
            for (let i = newDataTable.length - 1; i >= 0; --i) {
                this.itemToSave[newDataTable[i].Field] = newDataTable[i].DataType == "CheckBox"
                    ? 0
                    : "";
                if (newDataTable[i].Field == "ACTIVE") {
                    newDataTable.splice(i, 1);
                } else {
                    delete newDataTable[i].$id;
                    delete newDataTable[i].EntityKey;
                    delete newDataTable[i].id;
                    delete newDataTable[i].__contexts;
                }
            }
            this.itemToSave["Channels"] = [];
            if (this.itemToSave.hasOwnProperty('ACTIVE'))
                this.itemToSave["ACTIVE"] = 1;
            this.itemToSave['ID'] = 0;
        } else {
            for (let field in this.itemData) {
                if (this.itemData.hasOwnProperty(field)) {
                    this.itemToSave[field] = this.itemData[field] == null ? "" : this.itemData[field];
                }
            }
            this.itemToSave["Channels"] = this.itemData["Channels"].slice();
            for (let i = newDataTable.length - 1; i >= 0; --i) {
                newDataTable = this.setFieldsForSaving(newDataTable, i);
                if (newDataTable[i].DataType == "ComboSingle") {
                    if (this.itemToSave[newDataTable[i].Field])
                        for (let col in this.cols) {
                            if (this.itemToSave.hasOwnProperty(this.cols[col].Field)) {
                                if (this.cols[col].ItemsSource != null && this.cols[col].ItemsSource.split(".")[0] == newDataTable[i].Field) {
                                    const relativeField = this.cols[col].ItemsSource.split(".")[0];
                                    const relativeSource = this.cols[col].ItemsSource.split(".")[1];
                                    const lookups = this.data.Lookups[relativeField].filter((el) => {
                                        return el[relativeSource] == this.itemToSave[newDataTable[i].Field]
                                    });
                                    this.lookupsMap[this.cols[col].Field] = lookups.length > 0 ? lookups[0].ChildLookup.map((val) => {
                                        return {id: val.ID, text: val.Name};
                                    }) : null;
                                }
                            }
                        }
                }
                if (newDataTable[i].Field == "ACTIVE") {
                    newDataTable.splice(i, 1);
                } else {
                    delete newDataTable[i].$id;
                    delete newDataTable[i].EntityKey;
                    delete newDataTable[i].id;
                    delete newDataTable[i].__contexts;
                }
            }

        }
        this.cols = newDataTable;

        for (let field in this.data.Lookups) {
            if (this.data.Lookups.hasOwnProperty(field)) {
                this.lookupsMap[field] = this.data.Lookups[field].map((val) => {
                    return {id: val.ID, text: val.Name};
                });
            }
        }

        this.inLoad = false;
    }

    onAddChannel(e) {
        e.map((val) => {
            this.itemToSave["Channels"].push(val.CH_CODE);
            return null;
        });
    }

    onDeleteChannel(e) {
        for (let i = 0; i < e.length; i++) {
            const idx = this.itemToSave["Channels"].indexOf(e[i]);
            if (idx > -1) {
                this.itemToSave["Channels"].splice(idx, 1);
            }
        }
    }

    saveData() {
        delete (<any>this.itemToSave).$id;
        delete (<any>this.itemToSave).EntityKey;
        delete (<any>this.itemToSave).id;
        delete (<any>this.itemToSave).__contexts;
        this.toggleOverlay(true);
        if (this.validate(this.itemToSave, this.data.View.Columns)) {
            return new Observable((observer: Subscriber<any>) => {
                this.modalRef.modalEvents.emit({
                    name: 'saveData',
                    $event: {itemToSave: this.itemToSave, observer}
                });
            }).pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                this.notificationService.notifyShow(1, this.translate.instant(this.translateKey + ".save_success"));
                this.modalRef.emitClickFooterBtn('ok');
                for (let i = 0; i < this.data.View.Columns.length; i++) {
                    this.data.View.Columns[i].NotValid = false;
                }
                this.modalRef.hide();
            }, (err) => {
                this.toggleOverlay(false);
                this.notificationService.notifyShow(2, this.translate.instant(this.translateKey + ".save_error"));
            });
        } else {
            this.toggleOverlay(false);
        }
    }


    validate(item, colums): boolean {
        clearTimeout(this.validatorTimeout);
        let mustBeUniqueFiled = "";
        let requiredFiled = "";
        for (let i = 0; i < colums.length; i++) {
            if (colums[i].DataType == 'TextBox' ||
                colums[i].DataType == 'NumberBox' ||
                colums[i].DataType == 'TextBoxMultiline' ||
                colums[i].DataType == 'ComboSingle') {
                const validData = this.validFieldRequired(item, colums, i, requiredFiled, mustBeUniqueFiled);
                requiredFiled = validData.requiredFiled;
                mustBeUniqueFiled = validData.mustBeUniqueFiled;
            } else if (colums[i].DataType == 'ColorSelector' && (colums[i].Required || colums[i].Unique)) {
                const validData = this.validFieldUnique(item, colums, i, requiredFiled, mustBeUniqueFiled);
                requiredFiled = validData.requiredFiled;
                mustBeUniqueFiled = validData.mustBeUniqueFiled;
            }
        }
        if (mustBeUniqueFiled.length > 0 || requiredFiled.length > 0) {
            let resultMessage = this.validFieldMessageError(mustBeUniqueFiled, requiredFiled);
            setTimeout(() => {
                for (var i = 0; i < colums.length; i++) {
                    colums[i].NotValid = false;
                }
            }, 4000);
            this.notificationService.notifyShow(2, resultMessage, true, 4000);
            return false;
        } else {
            for (let i = 0; i < colums.length; i++) {
                if (colums[i].DataType == 'ColorSelector') {
                    item[colums[i].Field] = this.hexToDelphi(item[colums[i].Field]);
                }
            }
        }
        return true;
    }

}
