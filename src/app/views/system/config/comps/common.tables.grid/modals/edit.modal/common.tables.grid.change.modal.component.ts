import {
    Component,
    Inject,
    Injector,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { NotificationService } from "app/modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import { NavigationStart, Router } from "@angular/router";
import { takeUntil } from "rxjs/internal/operators";
import {Observable, Subject, Subscriber} from "rxjs";
import { ChangeModalBaseComponent } from 'app/modules/abstractions/change.modal.base.component';

@Component({
    selector: 'config-tables-change-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        './../../../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    host: {
        '(document:keydown.escape), ["$event"]': 'onEscPress($event)',
    }
})

export class CommonTablesGridChangeModalComponent extends ChangeModalBaseComponent {
    private fullscreen = {};
    private destroyed$: Subject<any> = new Subject();
    private readOnlyItem = false;
    private hoveredImage = {};
    private defaultPositive = 1;

    constructor(
        public injector: Injector,
        public cd: ChangeDetectorRef,
        private router: Router,
        @Inject(TranslateService) public translate: TranslateService,
        protected notificationService: NotificationService
    ) {
        super(injector, cd, translate);
        this.router.events.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((event) => {
            if (event instanceof NavigationStart && this.lastFullscreen != null) {
                this.toggleFullscreen(this.lastFullscreen);
            }
        });

        this.fullscreen = {};
        let newDataTable = this.cols;
        if (this.isNew) {
            for (let i = newDataTable.length - 1; i >= 0; --i) {
                this.itemToSave[newDataTable[i].Field] = newDataTable[i].DataType == "CheckBox"
                    ? 0
                    : newDataTable[i].DataType == "ComboMulti"
                        ? []
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
            if (this.itemToSave.hasOwnProperty('ACTIVE'))
                this.itemToSave["ACTIVE"] = 1;
            this.itemToSave['ID'] = 0;
        } else {
            if (this.data.View.disabledFieldMask) {
                for (let i = newDataTable.length - 1; i >= 0; --i) {
                    if (newDataTable[i].Field == this.data.View.disabledFieldMask) {
                        this.readOnlyItem = this.itemData[newDataTable[i].Field];
                        break;
                    }
                }
            }
            for (let field in this.itemData) {
                if (this.itemData.hasOwnProperty(field)) {
                    this.itemToSave[field] = this.itemData[field] == null ? "" : this.itemData[field];
                }
            }
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
                                    }) : [];
                                }
                            }
                        }
                }
                if (newDataTable[i].DataType == "ComboMulti") {
                    this.itemToSave[newDataTable[i].Field] = this.itemToSave[newDataTable[i].Field].map((val) => {
                        return {Id: val};
                    });
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
                if (field.indexOf(',') > -1) {
                    const fields = field.split(',');
                    for (let i = 0; i < fields.length; i++) {
                        this.lookupsMap[fields[i]] = this.data.Lookups[field].map((val) => {
                            return {id: val.ID, text: val.Name};
                        });
                    }
                } else {
                    this.lookupsMap[field] = this.data.Lookups[field].map((val) => {
                        return {id: val.ID, text: val.Name};
                    });
                }

            }
        }

        this.inLoad = false;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onEscPress(e) {
        if (this.lastFullscreen != null) {
            this.toggleFullscreen(this.lastFullscreen);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    private lastFullscreen = null;

    toggleFullscreen(field) {
        this.fullscreen[field] = !this.fullscreen[field];
        if (this.fullscreen[field]) {
            this.lastFullscreen = field;
            $("#fullscreen-initial-container-" + field + " #fullscreen-target-" + field).appendTo(".common-app-wrapper");
        } else {
            this.lastFullscreen = null;
            $(".common-app-wrapper #fullscreen-target-" + field).appendTo("#fullscreen-initial-container-" + field);
        }
        setTimeout(() => {
            this.refreshCodeMirror();
        });
    }

    refreshCodeMirror() {
        let editor = (<any>($('.CodeMirror')[0])).CodeMirror;
        editor.refresh();
    }

    onClose(data, fieldId) {
        this.hoveredImage[fieldId] = null;
    }

    onOptionHover(data, fieldId) {
        this.hoveredImage[fieldId] = data;
    }

    onSelectMulti(data, fieldId) {
        if (data.params.data) {
            this.itemToSave[fieldId] = data.params.data.map((val) => {
                return {Id: val.id};
            })
        } else {
            this.itemToSave[fieldId] = [];
        }
    }

    getBit(number, bitPosition) {
        return (number & (1 << bitPosition)) === 0 ? false : true;
    }

    setBit(number, bitPosition) {
        return number | (1 << bitPosition);
    }

    clearBit(number, bitPosition) {
        const mask = ~(1 << bitPosition);
        return number & mask;
    }

    toggleBit(field, bit) {
        var num = this.itemToSave[field];
        this.itemToSave[field] = this.getBit(num, bit) ? this.clearBit(num, bit) : this.setBit(num, bit);
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
                    for (var i = 0; i < this.data.View.Columns.length; i++) {
                        this.data.View.Columns[i].NotValid = false;
                    }
                    this.modalRef.hide();
                }, (err) => {
                    this.toggleOverlay(false);
                    this.notificationService.notifyShow(2, this.translate.instant(this.translateKey + ".save_error"));
                });
            // }
        } else {
            this.toggleOverlay(false);
        }
    }

    processIntegerLimits(val, positive, isDecimal) {
        if (val != null && typeof (val) == "string") {
            val = val.replace(/,/g, ".");
        }
        if (isDecimal) {
            let returnValue = val;
            let reg = /^0$|^-?[1-9]\d*([.,](\d+)?)?$/;

            let matchReg = val !== null && reg.test(val.toString());
            if (matchReg) {
                let matchResult = val.match(reg);
                if (!matchResult[2]) {
                    val = val.replace(/\./g, "");
                }
            }

            if (positive) {
                if (!(matchReg && parseFloat(val) > 0 && parseFloat(val) < 2147483647))
                    returnValue = 1;
            } else if (val === null || !reg.test(val.toString()))
                returnValue = 0;

            return returnValue;
        }

        let returnValue = val;
        const reg = /^0$|^-?[1-9]\d*$/;

        if (positive) {
            if (val !== null && reg.test(val.toString()) && parseFloat(val) > 0 && parseFloat(val) < 2147483647)
                returnValue = parseFloat(val);
            else
                returnValue = 1;
        } else {
            if (val !== null && reg.test(val.toString()) && parseFloat(val) > -2147483647 && parseFloat(val) < 2147483647)
                returnValue = parseFloat(val);
            else if (val !== null && reg.test(val.toString()) && (parseFloat(val) <= -2147483647 || parseFloat(val) >= 2147483647)) {
                if (parseFloat(val) <= -2147483647) {
                    returnValue = -2147483646;
                } else {
                    returnValue = 2147483646;
                }
            } else if (val === null || !reg.test(val.toString()))
                returnValue = 0;
        }

        return returnValue;
    }

    validatePositive(val, isDecimal, isFinal) {
        if (val != null && typeof (val) == "string") {
            val = val.replace("/,/g", ".");
        }
        if (isDecimal) {
            const regularReg = /^0$|^[1-9]\d*([.,](\d+)?)?$/;
            const finalReg = /^0$|^[1-9]\d*([.,]\d+)?$/;
            let reg = isFinal ? finalReg : regularReg;
            return val !== null && reg.test(val.toString()) && parseFloat(val) >= this.defaultPositive;
        } else {
            const reg = /^0$|^[1-9]\d*$/;
            return val !== null && reg.test(val.toString()) && parseInt(val) >= this.defaultPositive && parseInt(val) < 2147483647;
        }
    }

    onNumberFieldInput(ev, positive, isDecimal) {
        positive && !this.validatePositive(ev.target.value, isDecimal, false) ?
            ev.target.value = this.defaultPositive :
            ev.target.value = this.processIntegerLimits(ev.target.value, positive, isDecimal);
    }

    onNumberFieldPaste(ev, positive, isDecimal) {
        ev.stopPropagation();
        ev.preventDefault();
        let val = ev.clipboardData.getData("text");

        positive && !this.validatePositive(val, isDecimal, false) ?
            ev.target.value = this.defaultPositive :
            ev.target.value = this.processIntegerLimits(val, positive, isDecimal);
    }

    validate(item, colums): boolean {
        clearTimeout(this.validatorTimeout);
        let mustBeUniqueFiled = "";
        let requiredFiled = "";
        let positiveField = "";
        for (let i = 0; i < colums.length; i++) {
            if (colums[i].DataType == 'TextBox' ||
                colums[i].DataType == 'NumberBox' ||
                colums[i].DataType == 'TextBoxMultiline' ||
                colums[i].DataType == 'ComboSingle') {
                if (item[colums[i].Field] == null || item[colums[i].Field].toString().trim() == "") {
                    if (colums[i].DataType == 'NumberBox') {
                        if (colums[i].PositiveNumber)
                            item[colums[i].Field] = this.defaultPositive;
                        else
                            item[colums[i].Field] = 0;
                    } else
                        item[colums[i].Field] = ""
                }

                if (colums[i].DataType == 'NumberBox' && colums[i].PositiveNumber && !this.validatePositive(item[colums[i].Field], colums[i].DecimalNumber, true)) {
                    colums[i].NotValid = true;
                    if (requiredFiled.length > 0) {
                        positiveField += ", '" + colums[i].Label + "'"
                    } else {
                        positiveField += "'" + colums[i].Label + "'"
                    }
                }
                const validData = this.validFieldRequired(item, colums, i, requiredFiled, mustBeUniqueFiled);
                requiredFiled = validData.requiredFiled;
                mustBeUniqueFiled = validData.mustBeUniqueFiled;
            } else if (colums[i].DataType == 'ColorSelector' && (colums[i].Required || colums[i].Unique)) {
                if (item[colums[i].Field] == null) {
                    item[colums[i].Field] = ""
                }
                const validData = this.validFieldUnique(item, colums, i, requiredFiled, mustBeUniqueFiled);
                requiredFiled = validData.requiredFiled;
                mustBeUniqueFiled = validData.mustBeUniqueFiled;

            } else if (colums[i].DataType == 'Flags' || colums[i].DataType == 'ComboMulti') {
                console.warn("Not implemented!");
            }
        }
        if (mustBeUniqueFiled.length > 0 || requiredFiled.length > 0 || positiveField.length > 0) {
            let resultMessage = this.validFieldMessageError(mustBeUniqueFiled, requiredFiled);
            if (positiveField.length > 0) {
                resultMessage += this.translate.instant(this.translateKey + ".positive").replace("{0}", requiredFiled) + "\n\r";
            }
            setTimeout(() => {
                for (let i = 0; i < colums.length; i++) {
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
                if (colums[i].DataType == 'ComboMulti') {
                    item[colums[i].Field] = item[colums[i].Field].map((val) => {
                        return val.Id;
                    });
                }
            }
        }
        return true;
    }

}
