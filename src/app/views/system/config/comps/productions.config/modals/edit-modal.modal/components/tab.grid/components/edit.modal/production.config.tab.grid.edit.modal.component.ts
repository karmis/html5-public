import {
    Component, EventEmitter, Inject, Injector, TemplateRef, ViewChild, ViewEncapsulation, ChangeDetectorRef, ElementRef,
    HostListener
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {NavigationStart, Router} from "@angular/router";
import {takeUntil} from "rxjs/internal/operators";
import {Subject} from "rxjs";
import { IMFXModalComponent } from 'app/modules/imfx-modal/imfx-modal';
import {TimeCodeFormat} from "../../../../../../../../../../../utils/tmd.timecode";

@Component({
    selector: 'production-config-tab-grid-edit-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../../../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        // ConfigTablesService
    ],
    host: {
        '(document:keydown.escape), ["$event"]': 'onEscPress($event)',
    }
})

export class ProductionConfigTabGridEditModalComponent {

    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('countrySelect', {static: false}) private countrySelect;
    @ViewChild('countryDeliverySelect', {static: false}) private countryDeliverySelect;
    // @ViewChild('modalOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;

    private modalRef: IMFXModalComponent;
    private readonly data;
    private readonly itemData;
    private context;
    private readonly isNew;
    private lookupsMap = [];
    private itemToSave = {};
    private validatorTimeout;
    private readonly cols = [];
    private callService;
    private readonly fullscreen = {};
    private datetimeFullFormatLocaldatePipe: string = "HH:mm";
    private destroyed$: Subject<any> = new Subject();
    private readOnlyItem = false;
    private hoveredImage = {};
    private defaultPositive = 1;

    constructor(protected injector: Injector,
                // protected service: ConfigTablesService,
                protected cd: ChangeDetectorRef,
                private router: Router,
                @Inject(TranslateService) protected translate: TranslateService,
                // protected notificationService: NotificationService,
                // protected lokupService: LookupService
    ) {

        this.router.events.pipe(takeUntil(this.destroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart && this.lastFullscreen != null) {
                this.toggleFullscreen(this.lastFullscreen);
            }
        });

        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.data = d.data;
        this.itemData = d.itemData && d.itemData.data ? d.itemData.data : d.itemData && d.itemData.row ? d.itemData && d.itemData.row : {};
        this.context = d.context;
        this.isNew = d.isNew;
        this.callService = d.callService;
        this.cols = this.data.View.Columns.slice();
        this.fullscreen = {};
        let newDataTable = this.cols;
        if (this.isNew) {
            for (let item of newDataTable) {
                this.itemToSave[item.Field] = item.DataType == "CheckBox" ? 0 : item.DataType == "ComboMulti" ? [] : "";
                // if (newDataTable[i].Field == "ACTIVE") {
                //     newDataTable.splice(i, 1);
                // } else {
                    delete item.$id;
                    delete item.EntityKey;
                    delete item.id;
                    delete item.__contexts;
                // }


                if (item.Rules && item.Rules.length) {
                    let rule;
                    //AutoInc
                    rule = item.Rules.find(el => el.includes('AutoInc'));
                    if (rule) {
                        let startNum = rule.substr(rule.indexOf('_') - 0 + 1) - 0;

                        if (d.data.Data && d.data.Data.length) {
                            let maxNum = Math.max(
                                ...(d.data.Data.map(el => el[item.Field]))
                            );
                            if (!isNaN(maxNum)) {
                                startNum = ++maxNum;
                            }
                        }

                        this.itemToSave[item.Field] = startNum;
                    }
                }
            }

            this.itemToSave['ID'] = 0;
        } else {
            for (let field in this.itemData) {
                if (this.itemData.hasOwnProperty(field)) {
                    this.itemToSave[field] = this.itemData[field] == null ? "" : this.itemData[field];
                }
            }
            for (let i = newDataTable.length - 1; i >= 0; --i) {
                if (newDataTable[i].DataType == "TextBoxMultiline" && this.itemData[newDataTable[i].Field] != null &&
                    (this.itemData[newDataTable[i].Field].trim().startsWith("{{!MFX_XML") ||
                        this.itemData[newDataTable[i].Field].trim().startsWith("<html>") ||
                        this.itemData[newDataTable[i].Field].trim().startsWith("<?xml"))) {
                    newDataTable[i].CodeEditor = true;
                } else {
                    newDataTable[i].CodeEditor = false;
                }
                if (newDataTable[i].DataType == "CheckBox") {
                    this.itemToSave[newDataTable[i].Field] = this.itemToSave[newDataTable[i].Field] == 1 || this.itemToSave[newDataTable[i].Field] === true ? 1 : 0;
                }
                if (newDataTable[i].DataType == "ComboSingle") {
                    if (this.itemToSave[newDataTable[i].Field])
                        for (let col in this.cols) {
                            if (this.itemToSave.hasOwnProperty(this.cols[col].Field)) {
                                if (this.cols[col].ItemsSource != null && this.cols[col].ItemsSource.split(".")[0] == newDataTable[i].Field) {
                                    let relativeField = this.cols[col].ItemsSource.split(".")[0];
                                    let relativeSource = this.cols[col].ItemsSource.split(".")[1];

                                    let lookups = this.data.Lookups[relativeField].filter((el) => {
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

                delete newDataTable[i].$id;
                delete newDataTable[i].EntityKey;
                delete newDataTable[i].id;
                delete newDataTable[i].__contexts;

            }

        }
        this.cols = newDataTable;

        for (let field in this.data.Lookups) {
            if (this.data.Lookups.hasOwnProperty(field)) {
                if (field.indexOf(',') > -1) {
                    let fields = field.split(',');
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

    checkRule(col, rule: string) {
        const r = col.Rules;
        const f = col.Field;

        if(!r || !r.length || !Array.isArray(r)) {
            return false;
        }

        return r.includes(rule);
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
        // editor.on('refresh', () => {
        //     this.toggleOverlay(false);
        // });
        editor.refresh();
    }

    getFriendlyName(fieldData) {
        for (let col in this.cols) {
            if (this.cols[col].Field == fieldData.ItemsSource.split(".")[0]) {
                return this.cols[col].Label;
            }
        }
        return "";
    }

    private inLoad = true;

    // toggleOverlay(show) {
    //     if (show) {
    //         $(this.modalOverlayWrapper.nativeElement).show();
    //     } else {
    //         $(this.modalOverlayWrapper.nativeElement).hide();
    //     }
    //     this.inLoad = show;
    // }

    checkLookup(field) {
        return this.itemToSave[field] >= 1 || typeof this.itemToSave[field] == 'string';
    }

    getFromLookup(field) {
        let result = this.lookupsMap[field].filter(x => x.id == this.itemData[field] || x.ID == this.itemData[field])[0];
        return result ? result.text : "";
    }

    getLookupsForRules(lookupField, isUnic = false) {
        const result = [];
        const lookupData = this.lookupsMap[lookupField]? this.lookupsMap[lookupField] : [];
        const rows = this.data && this.data.Data || [];

        for(var i = 0; i < lookupData.length; i++)
        {
            if(isUnic) {
                if (!rows.find(el => el[lookupField] == lookupData[i].id) || this.itemToSave[lookupField] == lookupData[i].id) {
                    result.push(lookupData[i]);
                }
            } else {
                result.push(lookupData[i]);
            }
        }
        return result;

    }

    isUnicCol(column): boolean {
        const r = column.Rules;
        const f = column.Field;
        const v = this.itemToSave[f];

        //check by rules
        if(r && r.length) {
            if (r.includes('Unique')) {
                return true;
            }
        }

        return false;
    }

    onClose(data, fieldId) {
        this.hoveredImage[fieldId] = null;
    }

    onOptionHover(data, fieldId) {
        this.hoveredImage[fieldId] = data;
    }

    onSelect(data, fieldId) {
        let id = data.params.data[0] ? data.params.data[0].id : "";
        if (id != this.itemToSave[fieldId]) {
            this.itemToSave[fieldId] = id;

            this.applyMapFnDuringEdit();
        }
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

    onSelectTime(date, fieldId) {
        if (date) {
            let resultstring = "" +
                (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) + ":" +
                (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) + ":00";
            this.itemToSave[fieldId] = resultstring;
        }
    }

    closeModal() {
        // this.toggleOverlay(true);
        for (let i = 0; i < this.data.View.Columns.length; i++) {
            this.data.View.Columns[i].NotValid = false;
        }
        this.modalRef.hide();
    }

    saveAttepmt = false;
    showSaveAttepmtValidFlag() {
        this.saveAttepmt = true;
        this.cd.markForCheck();
        setTimeout(() => {
            this.saveAttepmt = false;
        }, 5000);
    }

    clickOk() {

        // if (!this.applyCheckFnEndEdit()) {
        if (!this.validate()) {
            this.showSaveAttepmtValidFlag();
            return;
        }

        this.applyMapFnEndEdit();

        this.modalRef.emitClickFooterBtn('ok');
        this.modalRef.hide();
        // this.closeModal();
    }

    //generate and set values by rules
    applyMapFnEndEdit() {
        let arrFnCols = this.cols.filter(el => el.mapFnEndEdit && (typeof el.mapFnEndEdit == 'function'));

        let oldEl = null;
        if (this.isNew) {
            this.data.Data.push(this.itemToSave);
        } else {
            oldEl = this.data.Data.splice(this.itemToSave['id'], 1, this.itemToSave);
        }

        for (let item of arrFnCols) {
            // this.itemToSave[item.Field] = item.mapFnEndEdit.call(this, this.itemToSave, this.isNew, this.data.Data);
            item.mapFnEndEdit.call(this, this.itemToSave, this.isNew, this.data.Data); // not immutable
        }
    }

    applyMapFnDuringEdit() {
        let arrFnCols = this.cols.filter(el => el.mapFnDuringEdit && (typeof el.mapFnDuringEdit == 'function'));

        for (let item of arrFnCols) {
            this.itemToSave[item.Field] = item.mapFnDuringEdit.call(this, this.itemToSave, this.isNew, this.data.Data);
        }
    }

    getItemToSave() {
        delete (<any>this.itemToSave).$id;
        delete (<any>this.itemToSave).EntityKey;
        delete (<any>this.itemToSave).id;
        delete (<any>this.itemToSave).__contexts;

        return this.itemToSave;
    }

    getTableItemsToSave() {
        return this.data.Data;
    }

    processMaxInteger(val) {
        let returnValue = 2147483647;
        let reg = /^0$|^-?[1-9]\d*(\.\d+)?$/;
        if (val !== null && reg.test(val.toString()) && parseInt(val) < 2147483647)
            returnValue = parseInt(val);
        return returnValue;
    }

    validatePositive(val) {
        let reg = /^0$|^-?[1-9]\d*(\.\d+)?$/;
        return val !== null && reg.test(val.toString()) && parseInt(val) >= this.defaultPositive;
    }

    validateCol(column): boolean {
        const r = column.Rules;
        const f = column.Field;
        const v = this.itemToSave[f];

        //check by rules
        if(r && r.length) {
            if (r.includes('Required')) {
                if(v === null || v === undefined || v === '' || (Array.isArray(v) && v.length)) {
                    return false;
                }
            }
            // if (r.includes('Unique')) {
            //
            // }

        }


        //check by checkFnEndEdit
        if(column.checkFnEndEdit
            && (typeof column.checkFnEndEdit == 'function')
            && !column.checkFnEndEdit.call(this, this.itemToSave, this.data.Data)) {
            return false;
        }

        return true;
    }

    validate(): boolean {
        let arrFnCols = this.cols

        for (let item of this.cols) {
            if(!this.validateCol(item)) {
                return false;
            }
        }
        return true;
    }
}
