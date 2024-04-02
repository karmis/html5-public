import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injectable,
    Injector,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
    Input, Output, EventEmitter, OnInit, TemplateRef, Inject, QueryList
} from '@angular/core';
import * as moment from "moment";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../notification/services/notification.service";
import {Subject} from "rxjs";
import {Router} from "@angular/router";
import {IMFXControlsDateTimePickerComponent} from "../../../../controls/datetimepicker/imfx.datetimepicker";
import { IMFXControlsSelect2Component } from '../../../../controls/select2/imfx.select2';

export type ProductionOnChangeDataType = {
    fieldId: string,
    fieldValue: any
}

@Component({
    selector: 'production-info-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None
})

export class ProductionInfoTabComponent implements OnInit {

    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;
    @Output('onChangeItems') onChangeItems: EventEmitter<any> = new EventEmitter<any>();
    @Output('onChangeFieldValue') onChangeFieldValue: EventEmitter<ProductionOnChangeDataType> = new EventEmitter<ProductionOnChangeDataType>();
    @ViewChildren(IMFXControlsDateTimePickerComponent) datetimepickers!: QueryList<IMFXControlsDateTimePickerComponent>;

    private groups = [];
    private cols = [];
    private lookups = {};
    private itemData = {};
    private lookupsMap = {};
    private readOnlyItem = false;
    private isNew = false;
    private defaultPositive = 1;
    private destroyed$: Subject<any> = new Subject();
    private datetimeFullFormatLocalDateTimePipe: string = "HH:mm";
    private datetimeFullFormatLocalDatePipe: string = "HH:mm";

    constructor(private injector: Injector,
                protected cd: ChangeDetectorRef,
                private router: Router,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService) {

    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
    }

    saveData() {
    }

    clearValidationView(field) {
        this.cols[field.Id].NotValid = false;
    }

    public isValid() {
        var validationResult = {
            valid: true,
            validationMessage: ""
        };
        for (var i = 0; i < this.groups.length; i++) {
            for (var j = 0; j < this.groups[i].length; j++) {
                const fieldID = this.groups[i][j].Id;
                this.cols[fieldID].NotValid = false;
                if(this.groups[i][j].Mandatory && (this.itemData[fieldID] === null || this.itemData[fieldID] === "" || this.itemData[fieldID] === [])) {
                    validationResult.valid = false;
                    validationResult.validationMessage += this.groups[i][j].Title + ", ";
                    this.cols[fieldID].NotValid = true;
                }
            }
        }
        if(!validationResult.valid) {
            validationResult.validationMessage += "Is Mandatory";
        }
        return validationResult;
    }

    public Init(groups, view, lookups, externalItemData = null) {
        this.groups = groups;
        this.cols = view;
        this.lookups = lookups;

        this.itemData = {};
        this.lookupsMap = {};
        this.readOnlyItem = false;
        this.defaultPositive = 1;
        var disabledFieldMask = null;

        for (var c in this.cols) {
            var col = this.cols[c];
            if(col.Rules && col.Rules.length > 0) {
                for (var i = 0; i < col.Rules.length; i++) {
                    var regExp = /\(([^)]+)\)/;
                    var matches = regExp.exec(col.Rules[i]);
                    if(matches && matches.length > 0) {
                        col[col.Rules[i].split("(")[0]] = matches[1].split(",");
                    }
                    else {
                        col[col.Rules[i]] = true;
                    }

                    if(col.Rules[i] == 'SystemRow') {
                        disabledFieldMask = col.Field;
                    }
                }
            }
        }

        for (var field in this.lookups) {
            if (this.lookups.hasOwnProperty(field)) {
                if (field.indexOf(',') > -1) {
                    var fields = field.split(',');
                    for (var i = 0; i < fields.length; i++) {
                        this.lookupsMap[fields[i]] = this.lookups[field].map((val) => {
                            return {id: val.ID, text: val.Name};
                        });
                    }
                } else {
                    this.lookupsMap[field] = this.lookups[field].map((val) => {
                        return {id: val.ID, text: val.Name};
                    });
                }
            }
        }
        if(this.groups) {
            for (var i = 0; i < this.groups.length; i++) {
                for (var j = 0; j < this.groups[i].length; j++) {
                    const fieldID = this.groups[i][j].Id;
                    if(externalItemData != null) {
                        if(fieldID == "OWNERS" && externalItemData[fieldID]) {
                            var ownersIDs = externalItemData[fieldID].split(";").map( (val, idx) => {
                                return { Id:val };
                            } );
                            this.itemData[fieldID] = ownersIDs;
                        }
                        else
                            this.itemData[fieldID] = externalItemData[fieldID] != null ? externalItemData[fieldID] : null;
                    }
                    else
                        this.itemData[fieldID] = (this.groups[i][j].Value !== null && this.groups[i][j].Value !== undefined) ? this.groups[i][j].Value : null;
                }
            }
        }
        this.onChangeAny(null);
        this.cd.detectChanges();
    }
    setValueByFieldId(fieldID, value) {
        this.itemData[fieldID] = value;
        if (this.cols[fieldID].DataType == 'DateTime') {
            let c = this.datetimepickers.filter(c => {return c.id == fieldID});
            if (c.length) {
                c[0].setValue(value);
            }
        };
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
    }

    onChangeCheckBox(value, field) {
        value.target.checked ? this.itemData[field] = true : this.itemData[field] = false;
        this.onChangeAny(field);
    }

    onChangeFlag(checked, field, val) {
        this.itemData[field] = checked ? this.setBit(this.itemData[field], val.id) : this.clearBit(this.itemData[field], val.id);
        this.onChangeAny(field);
    }

    onChangeSimpleField(value, field) {
        this.itemData[field] = value;
        this.onChangeAny(field);
    }

    getFromLookup(field) {
        var result = this.lookupsMap[field].filter(x => x.id == this.itemData[field] || x.ID == this.itemData[field])[0];
        return result ? result.text : "";
    }

    onChangeAny(fieldId) {
        this.onChangeItems.emit({fieldValue: this.itemData, fieldId});
    }
    onChangeField(fieldId, fieldValue) {
        this.onChangeFieldValue.emit({
            fieldId: fieldId,
            fieldValue: fieldValue
        });
    }

    processIntegerLimits(val, positive) {
        var returnValue = val;
        var reg = /^0$|^-?[1-9]\d*(\.\d+)?$/;

        if (positive) {
            if (val !== null && reg.test(val.toString()) && parseInt(val) > 0 && parseInt(val) < 2147483647)
                returnValue = parseInt(val);
            else
                returnValue = 1;
        } else {
            if (val !== null && reg.test(val.toString()) && parseInt(val) > -2147483647 && parseInt(val) < 2147483647)
                returnValue = parseInt(val);
            else if (val !== null && reg.test(val.toString()) && (parseInt(val) <= -2147483647 || parseInt(val) >= 2147483647)) {
                if (parseInt(val) <= -2147483647) {
                    returnValue = -2147483646;
                } else {
                    returnValue = 2147483646;
                }
            } else if (val === null || !reg.test(val.toString()))
                returnValue = 0;
        }

        return returnValue;
    }

    validatePositive(val) {
        var reg = /^0$|^-?[1-9]\d*(\.\d+)?$/;
        return val !== null && reg.test(val.toString()) && parseInt(val) >= this.defaultPositive && parseInt(val) < 2147483647 && parseInt(val);
    }

    onSelect(data, fieldId) {
        var id = data.params.data[0] ? data.params.data[0].id : "";
        if (id != this.itemData[fieldId]) {
            this.itemData[fieldId] = id;

            for (var col in this.cols) {
                if (this.itemData.hasOwnProperty(this.cols[col].Field)) {
                    if (this.cols[col].ItemsSource != null && this.cols[col].ItemsSource.split(".")[0] == fieldId) {
                        var relativeField = this.cols[col].ItemsSource.split(".")[0];
                        var relativeSource = this.cols[col].ItemsSource.split(".")[1];
                        this.itemData[this.cols[col].Field] = "";
                        var lookups = this.lookupsMap[relativeField].filter((el) => {
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
        this.onChangeAny(fieldId);
    }

    onSelectMulti(data, fieldId) {
        if (data.params.data) {
            this.itemData[fieldId] = data.params.data.map((val) => {
                return {Id: val.id};
            })
        } else {
            this.itemData[fieldId] = [];
        }
        this.onChangeAny(fieldId);
    }

    onSelectDate(date, fieldId) {
        if (date) {
            this.itemData[fieldId] = moment(date).format('YYYY-MM-DD') + 'T00:00:00';
        }
        else
            this.itemData[fieldId] = null;
        this.onChangeAny(fieldId);
    }

    onSelectTime(date, fieldId) {
        if (date) {
            let resultstring = "" +
                (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) + ":" +
                (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) + ":00";
            this.itemData[fieldId] = resultstring;
        }
        else
            this.itemData[fieldId] = null;
        this.onChangeAny(fieldId);
    }

    onSelectDateTime(date, fieldId) {
        if (date) {
            this.itemData[fieldId] = moment(date).format('YYYY-MM-DDTHH:mm:ss');
        }
        else
            this.itemData[fieldId] = null;
        this.onChangeField(fieldId, this.itemData[fieldId]);
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
        var num = this.itemData[field];
        this.itemData[field] = this.getBit(num, bit) ? this.clearBit(num, bit) : this.setBit(num, bit);
    }

    getFriendlyName(fieldData) {
        for (var col in this.cols) {
            if (this.cols[col].Field == fieldData.ItemsSource.split(".")[0]) {
                return this.cols[col].Label;
            }
        }
        return "";
    }

    checkLookup(field) {
        return this.itemData[field] >= 1 || typeof this.itemData[field] == 'string';
    }

    customSorter(a, b, context: IMFXControlsSelect2Component) {
        return a.text.localeCompare(b.text);
    }
}
