import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation,
    Input, Output, EventEmitter
} from '@angular/core';
import {Subject} from 'rxjs';
import * as moment from "moment";
@Component({
    selector: 'production-template-fields',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [],
    entryComponents: []
})
@Injectable()
export class ProductionTemplateFieldsComponent {
    @Input('data') data: any = null;
    @Input('viewData') viewData: any = null;
    @Input('lookups') lookups: any = null;
    @Input('isNew') isNew: boolean = false;
    @Output('onChangeItems') onChangeItems: EventEmitter<any> = new EventEmitter<any>();

    private itemData = {};
    private lookupsMap = {};
    private mandatoryData = {};
    private cols = [];
    private readOnlyItem = false;
    private defaultPositive = 1;
    private destroyed$: Subject<any> = new Subject();
    private datetimeFullFormatLocalDateTimePipe: string = "HH:mm";
    private datetimeFullFormatLocalDatePipe: string = "HH:mm";

    constructor(
        protected cd: ChangeDetectorRef,
        protected injector: Injector
    ) {

    }

    ngOnInit() {
        this.Init();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public Init() {
        this.itemData = {};
        this.lookupsMap = {};
        this.mandatoryData = {};
        this.cols = [];
        this.readOnlyItem = false;
        this.defaultPositive = 1;

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
        if(this.data.TemplateUiFields) {
            this.cols = this.viewData.Columns.slice();
            var tmpCols = {};
            this.cols = this.cols.filter((x)=>{
                tmpCols[x.Field] = x.DataType;
                var isHidden = !!x.Rules && x.Rules.indexOf("ConfigHidden") > -1;
                return !isHidden;
            });

            for (var i = 0; i < this.data.TemplateUiFields.length; i++) {
                this.itemData[this.data.TemplateUiFields[i].Field] = this.data.TemplateUiFields[i].Value;
                this.mandatoryData[this.data.TemplateUiFields[i].Field] = tmpCols[this.data.TemplateUiFields[i].Field].DataType != 'CheckBox' && this.data.TemplateUiFields[i].Mandatory;
            }
        }
    }

    changeMandatory(value, field) {
        this.mandatoryData[field] = value;
        this.onChangeAny();
    }

    onChangeFlag(checked, field, val) {
        this.itemData[field] = checked ? this.setBit(this.itemData[field], val.id) : this.clearBit(this.itemData[field], val.id);
        this.onChangeAny();
    }

    onChangeSimpleField(value, field) {
        this.itemData[field] = value;
        this.onChangeAny();
    }

    onChangeCheckBox(value, field) {
        value.target.checked ? this.itemData[field] = true : this.itemData[field] = false;
        this.onChangeAny();
    }

    getFromLookup(field) {
        var result = this.lookupsMap[field].filter(x => x.id == this.itemData[field] || x.ID == this.itemData[field])[0];
        return result ? result.text : "";
    }

    onChangeAny() {
        this.onChangeItems.emit({
            itemData: this.itemData,
            mandatoryData: this.mandatoryData
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
        this.onChangeAny();
    }

    onSelectMulti(data, fieldId) {
        if (data.params.data) {
            this.itemData[fieldId] = data.params.data.map((val) => {
                return {Id: val.id};
            })
        } else {
            this.itemData[fieldId] = [];
        }
        this.onChangeAny();
    }

    onSelectDateTime(date, fieldId) {
        if (date) {
            this.itemData[fieldId] = moment(date).format('YYYY-MM-DD') + 'T00:00:00';
        }
        else
            this.itemData[fieldId] = null;
        this.onChangeAny();
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
        this.onChangeAny();
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
}
