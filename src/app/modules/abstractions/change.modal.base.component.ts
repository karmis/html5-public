import {
    ChangeDetectorRef,
    ElementRef,
    Injector,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { TranslateService } from '@ngx-translate/core';

export abstract class ChangeModalBaseComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) protected modalFooterTemplate: TemplateRef<any>;
    @ViewChild('countrySelect', {static: false}) protected countrySelect;
    @ViewChild('countryDeliverySelect', {static: false}) protected countryDeliverySelect;
    @ViewChild('modalOverlayWrapper', {static: true}) protected modalOverlayWrapper: ElementRef;

    protected modalRef: IMFXModalComponent;
    protected data;
    protected itemData;
    protected context;
    protected isNew;
    protected lookupsMap = [];
    protected itemToSave = {};
    protected validatorTimeout;
    protected cols = [];
    protected inLoad = true;
    protected callService;
    protected translateKey;
    protected datetimeFullFormatLocaldatePipe: string = "HH:mm";

    protected constructor(public injector: Injector, public cd: ChangeDetectorRef, public translate: TranslateService) {
        this.setVariables();
    }

    private setVariables() {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.data = d.data;
        this.itemData = d.itemData && d.itemData.data ? d.itemData.data : d.itemData && d.itemData.row ? d.itemData && d.itemData.row : {};
        this.context = d.context;
        this.isNew = d.isNew;
        this.callService = d.callService;
        this.translateKey = d.translateKey || 'common_tables_grid';
        this.cols = this.data.View.Columns.slice();
    }

    public setFieldsForSaving(newDataTable, i) {
        if (newDataTable[i].DataType == "TextBoxMultiline" && this.itemData[newDataTable[i].Field] != null &&
            (this.itemData[newDataTable[i].Field].trim().startsWith("{{!MFX_XML") ||
                this.itemData[newDataTable[i].Field].trim().startsWith("<html>") ||
                this.itemData[newDataTable[i].Field].trim().startsWith("<?xml"))) {
            newDataTable[i].CodeEditor = true;
        } else {
            newDataTable[i].CodeEditor = false;
        }
        if (newDataTable[i].DataType == "ColorSelector") {
            this.itemToSave[newDataTable[i].Field] = this.itemToSave[newDataTable[i].Field] ? this.delphiToHex(this.itemToSave[newDataTable[i].Field].toString()) : "";
        }
        if (newDataTable[i].DataType == "CheckBox") {
            this.itemToSave[newDataTable[i].Field] = this.itemToSave[newDataTable[i].Field] == 1 || this.itemToSave[newDataTable[i].Field] === true ? 1 : 0;
        }
        return newDataTable;
    }

    public filterByValue(array, string, field, itemId) {
        return array.filter((o) => {
            delete o.$id;
            delete o.EntityKey;
            delete o.id;
            delete o.__contexts;
            if (o.hasOwnProperty(field) && o[field] && o["ID"] != itemId) {
                return o[field].toString().trim().toLowerCase() == string.toLowerCase();
            }
            return false;
        });
    }

    public hexToDelphi(hex) {
        let bb;
        let gg;
        let rr;
        hex = hex.trim();
        if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex)) {
            if (hex.length > 4) {
                rr = hex.substring(1, 3);
                gg = hex.substring(3, 5);
                bb = hex.substring(5, 7);
            } else {
                rr = hex.substring(1, 2);
                rr = "" + rr + rr;
                gg = hex.substring(2, 3);
                gg = "" + gg + gg;
                bb = hex.substring(3, 4);
                bb = "" + bb + bb;
            }
            rr = parseInt(rr, 16);
            gg = parseInt(gg, 16);
            bb = parseInt(bb, 16);
            let delphi = bb;
            delphi |= gg << 8;
            delphi |= rr << 16;
            return delphi;
        } else {
            return null;
        }
    }

    public intToHex(rgb) {
        let hex = rgb.toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    };

    public delphiToHex(delphi) {
        const bb = delphi >> 16;
        delphi &= 0x00FFFF;
        const gg = delphi >> 8;
        delphi &= 0x0000FF;
        const rr = delphi;
        return "#" + this.intToHex(bb) + this.intToHex(gg) + this.intToHex(rr);
    }

    public onColorFocusOut(field) {
        if (!(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(this.itemToSave[field].trim()))) {
            this.itemToSave[field] = " ";
            this.cd.detectChanges();
        } else {
            this.itemToSave[field] = this.itemToSave[field].trim();
        }
    }

    public  onChangeColorField(data, field) {
        if (this.itemToSave[field] == "" && data == '#000') {
            this.itemToSave[field] = " ";
        } else {
            this.itemToSave[field] = data;
        }
        ChangeModalBaseComponent.setPickerPosition(field);
    }

    public closeModal() {
        this.toggleOverlay(true);
        for (var i = 0; i < this.data.View.Columns.length; i++) {
            this.data.View.Columns[i].NotValid = false;
        }
        this.modalRef.hide();
    }

    public toggleOverlay(show) {
        if (show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.inLoad = show;
    }

    public checkLookup(field) {
        return this.itemToSave[field] >= 1 || typeof this.itemToSave[field] == 'string';
    }

    public getFromLookup(field) {
        const result = this.lookupsMap[field].filter(x => x.id == this.itemData[field] || x.ID == this.itemData[field])[0];
        return result ? result.text : "";
    }

    public onSelect(data, fieldId) {
        const id = data.params.data[0] ? data.params.data[0].id : "";
        if (id != this.itemToSave[fieldId]) {
            this.itemToSave[fieldId] = id;

            for (const col in this.cols) {
                if (this.itemToSave.hasOwnProperty(this.cols[col].Field)) {
                    if (this.cols[col].ItemsSource != null && this.cols[col].ItemsSource.split(".")[0] == fieldId) {
                        const relativeField = this.cols[col].ItemsSource.split(".")[0];
                        const relativeSource = this.cols[col].ItemsSource.split(".")[1];
                        this.itemToSave[this.cols[col].Field] = "";
                        const lookups = this.data.Lookups[relativeField].filter((el) => {
                            return el[relativeSource] == id
                        });
                        this.lookupsMap[this.cols[col].Field] = null;
                        this.cd.detectChanges();
                        this.lookupsMap[this.cols[col].Field] = lookups.length > 0 ? lookups[0].ChildLookup.map((val) => {
                            return {id: val.ID, text: val.Name};
                        }) : null;
                    }
                }
            }
        }
    }

    public onSelectTime(date, fieldId) {
        if (date) {
            let resultstring = "" +
                (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) + ":" +
                (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) + ":00";
            this.itemToSave[fieldId] = resultstring;
        }
    }

    public pickerClick(field) {
        $("#color-" + field).click();
        setTimeout(() => {
            ChangeModalBaseComponent.setPickerPosition(field);
        });
    }

    private static setPickerPosition(field) {
        const el = $("#color-wrapper-" + field).find("#color-" + field)[0];
        const picker = $("#color-wrapper-" + field).find(".color-picker");

        const viewportOffset = el.getBoundingClientRect();
        const top = viewportOffset.top;
        const left = viewportOffset.left - viewportOffset.left / 2 - 50;
        $(picker).css({top: top, left: left});
    }


    public getFriendlyName(fieldData) {
        for (const col in this.cols) {
            if (this.cols[col].Field == fieldData.ItemsSource.split(".")[0]) {
                return this.cols[col].Label;
            }
        }
        return "";
    }

    public validFieldRequired(item, colums, i, requiredFiled, mustBeUniqueFiled) {
        requiredFiled = this.validFieldCheck(item, colums, i, requiredFiled);
        if (colums[i].Unique && this.filterByValue(this.data.Data, item[colums[i].Field].toString().trim(), colums[i].Field, item["ID"]).length > 0) {
            colums[i].NotValid = true;
            if (mustBeUniqueFiled.length > 0) {
                mustBeUniqueFiled += ", '" + colums[i].Label + "'"
            } else {
                mustBeUniqueFiled += "'" + colums[i].Label + "'"
            }
        }
        return {
            requiredFiled,
            mustBeUniqueFiled
        }
    }

    public validFieldUnique(item, colums, i, requiredFiled, mustBeUniqueFiled) {
        if (colums[i].Unique && this.filterByValue(this.data.Data, item[colums[i].Field].toString().trim(), colums[i].Field, item["ID"])) {
            colums[i].NotValid = true;
            if (mustBeUniqueFiled.length > 0) {
                mustBeUniqueFiled += ", '" + colums[i].Label + "'"
            } else {
                mustBeUniqueFiled += "'" + colums[i].Label + "'"
            }
        }
        requiredFiled = this.validFieldCheck(item, colums, i, requiredFiled);
        return {
            requiredFiled,
            mustBeUniqueFiled
        }
    }

    private validFieldCheck(item, colums, i, requiredFiled) {
        if (item[colums[i].Field].toString().trim().length == 0 && colums[i].Required) {
            colums[i].NotValid = true;
            if (requiredFiled.length > 0) {
                requiredFiled += ", '" + colums[i].Label + "'"
            } else {
                requiredFiled += "'" + colums[i].Label + "'"
            }
        }
        return requiredFiled;
    }

    public validFieldMessageError(mustBeUniqueFiled, requiredFiled) {
        let resultMessage = '';
        if (mustBeUniqueFiled.length > 0) {
            resultMessage += this.translate.instant(this.translateKey + ".unique").replace("{0}", mustBeUniqueFiled) + "\n\r";
        }
        if (requiredFiled.length > 0) {
            resultMessage += this.translate.instant(this.translateKey + ".required").replace("{0}", requiredFiled) + "\n\r";
        }
        return resultMessage;
    }

    public changedConfig() {

    }
}
