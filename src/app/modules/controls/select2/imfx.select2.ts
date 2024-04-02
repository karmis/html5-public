import { filter } from 'rxjs/operators';
/**
 * Created by Sergey Trizna on 17.12.2016.
 */
// See https://select2.github.io
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { NavigationStart, Router } from "@angular/router";

import { ArrayProvider } from "../../../providers/common/array.provider";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
// Loading jQuery
import * as $ from "jquery";
import _ from 'lodash';
// Loading plugin
import "./libs/select2.js";
import "style-loader!select2/dist/css/select2.min.css";
import { Guid } from "../../../utils/imfx.guid";
import { StringProivder } from "../../../providers/common/string.provider";
import { Select2ClearFormat, Select2ConvertObject, Select2ItemType, Select2ListTypes } from "./types";
import { HttpService } from "../../../services/http/http.service";
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { IMFXSelect2LookupReturnType } from './imfx.select2.lookups';

export type Select2EventType = {
    params: {
        event: Event | null,
        context: IMFXControlsSelect2Component,
        data: any,
        isSameAsPrevious: boolean
    }
}

@Component({
    selector: 'imfx-controls-select2',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    // host: {
    //     '(window:hashchange)': 'close()'
    // },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        ArrayProvider
    ]
})

export class IMFXControlsSelect2Component {
    @Input('additionalData') additionalData = null;
    @Input('uid') public uid: string = Guid.newGuid();
    @Output() onOpen: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelect: EventEmitter<Select2EventType> = new EventEmitter<Select2EventType>();
    @Output() onUnselect: EventEmitter<Select2EventType> = new EventEmitter<Select2EventType>();
    @Output() onAnyEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();
    @Output() onOptionHover: EventEmitter<any> = new EventEmitter<any>();
    @Output() afterSearch: EventEmitter<any> = new EventEmitter<any>();
    @Input('customStandardToString') public customStandardToString: Function = null;
    // }
    public onReady: ReplaySubject<IMFXSelect2LookupReturnType> = new ReplaySubject<IMFXSelect2LookupReturnType>();
    /**
     * Reference to current component
     */
    @ViewChild('imfxControlsSelect2', {static: false}) public elementRef;
    public compRef;
    //     }
    public destroyed$: Subject<any> = new Subject();
    protected guid = null;
    // @Input('enableDynamicTags') public set enableDynamicTags(val: boolean) {
    //     if(val) {
    //         this.multiple = true;
    //         this.tags = true;
    //     } else {
    //         this.multiple = false;
    //         this.tags = false;
    /**
     * Data for plugin
     * @type {Array}
     */
    @Input('data') protected data: Array<any> = [];
    /**
     * Custom class for select2 wrapper
     * @type {String}
     */
        // TODO: FIX IT, CURRENTLY DOES NOT WORK
    @Input('wrapperClass') protected wrapperClass: string = "";
    /**
     * Label of first empty item
     * @type {string}
     */
    /**
     * Open on hover
     */
    @Input('openOnHover') protected openOnHover: boolean = false;
    // @Input('firstEmptyLabel') protected firstEmptyLabel: string = '--empty--';
    /**
     * First item is empty
     * @type {boolean}
     */
    @Input('firstEmpty') protected firstEmpty: boolean = false;
    // @Input('firstEmptyValue') protected firstEmptyValue: string = '';
    /**
     * Enabling/Disabling multiple attr
     */
    @Input('multiple') protected multiple = false;
    /**
     * Enabling/disabling tag mode
     */
    @Input('tags') protected tags = false;

    /**
     * Value of first empty item
     * @type {string}
     */
    /**
     * Close dropdown on select
     * @type {boolean}
     */
    @Input('closeOnSelect') protected closeOnSelect: boolean = true;
    /**
     * Token separator between tags
     */
    @Input('tokenSeparators') protected tokenSeparators: string[] = [] /*[',', ';']*/;
    /**
     * Token separator as keyCode between tags
     */
    @Input('tokenSeparatorsKeys') protected tokenSeparatorsKeys: number[] = [];
    /**
     * Auto width for dropdown
     */
    @Input('dropdownAutoWidth') protected dropdownAutoWidth: boolean = true;
    /**
     * Width for select box
     * @type {string}
     */
        // @Input('width') protected width = '300px';
    @Input('width') protected width;
    /**
     * Ajax options
     * See https://select2.github.io/examples.html#data-ajax and example in readme
     * @type {{}}
     */
    @Input('ajax') protected ajax = null;
    /**
     * Enable/disable cache
     * @type {boolean}
     */
        // @TODO nothing to cache
        //  (разделение ответственности. контрол не должен заниматься кэширвоанием.
        //  он работает только с предоставленными к нему данными )
    @Input('cache') protected cache: boolean = true;
    /**
     * External array of selected values
     * @type {array}
     */
    @Input('value') protected value: any[] | Select2ItemType | 'first';
    /**
     * Minimum input length
     * @type {number}
     */
    @Input('minimumInputLength') protected minimumInputLength: number = 0;
    /**
     * Maximum selection length
     * @type {number}
     */
    @Input('maximumSelectionLength') protected maximumSelectionLength: number = Infinity;
    /**
     * Minimum results for search
     * @type {number}
     */
    @Input('minimumResultsForSearch') protected minimumResultsForSearch: number = 0;
    /**
     * Placeholder
     * @type {string}
     */
    @Input('placeholder') protected placeholder: string = 'Select ...';
    /**
     * Placeholder reference to translate
     * @type {string}
     */
    @Input('placeholderRefToTranslate') protected placeholderRefToTranslate: string = 'base.selectOoo';
    /**
     * Language
     * @type {string}
     */
    @Input('language') protected language: string = 'ru';
    /**
     * With checkboxes
     * @type {boolean}
     */
    @Input('withCheckboxes') protected withCheckboxes: boolean = false;
    /**
     * With mouseenter event emit on option hover
     * @type {boolean}
     */
    @Input('withOptionMouseEnter') protected withOptionMouseEnter: boolean = false;
    /**
     * Enable Select all button
     * @type {boolean}
     */
    @Input('selectAllButton') protected selectAllButton: boolean = false;
    /**
     * Enable Deselect all button
     * @type {boolean}
     */
    @Input('deselectAllButton') protected deselectAllButton: boolean = false;
    /**
     * Delay for opening dropdown on hover
     * @type {boolean}
     */
    @Input('delayForOpeningDropdown') protected delayForOpeningDropdown: number = 250;
    /**
     * allowClear
     * @type {any}
     */
    @Input('allowClear') protected allowClear: boolean = false;
    /**
     * validationEnabled
     * @type {any}
     */
    @Input('validationEnabled') protected validationEnabled: boolean = false;
    /**
     * readonly
     * @type {any}
     */
    @Input('readonly') protected readonly: boolean = false;
    @Input('dropdownParent') protected dropdownParent;
    @Input('clearFormat') protected clearFormat: Select2ClearFormat = {
        showButton: false,
        defaultValue: null,
        withTrigger: true
    };
    @Input('clickableOnlyArrow') protected clickableOnlyArrow = false;
    @Input('bottomDropdownMessage') protected bottomDropdownMessage: string = 'Specify the parameters of search';
    /**
     * rightSidePosition
     * display dropdown to the right side
     * @type {boolean}
     */
    @Input('rightSidePosition') protected rightSidePosition: boolean = false;
    protected cursorLeavedTheEl: boolean = false;
    protected extendsOptions = {};
    protected openOnClick: boolean = false;
    protected isValid: boolean = true;
    protected disabled: boolean = false;
    protected lastSelectedValue: any = null;
    protected routerEventsSubscr: Subscription;
    @Input('maxDataItems') protected maxDataItems = 200;
    protected skipOnSelect: boolean = false;
    protected cancelCb; //for save last binded handler(to unsubscribe into select2:closing)
    private grouping = null;

    constructor(protected arrayProvider: ArrayProvider,
                protected translate: TranslateService,
                protected stringProvider: StringProivder,
                protected router: Router,
                protected cdr: ChangeDetectorRef,
                protected http: HttpService) {
        this.overrideMultipleTemplate();
    }

    /**
     * Setting new array of data
     * @param data
     * @param withReinit
     */
    protected _storageData: Select2ListTypes = [];

    get storageData(): Array<Select2ItemType> {
        return this._storageData;
    }

    set storageData(value: Array<Select2ItemType>) {
        this._storageData = value;
    }

    /**
     * Selected ids of data objects
     * @type {Array}
     */
    @Input('selected') private _selected: Array<any> = [];

    get selected(): Array<any> {
        return this._selected;
    }

    set selected(value: Array<any>) {
        this._selected = value;
    }

    /**
     * Get default options
     * @returns Object
     */
    public getDefaultOptions() {
        return {
            // data: this.data,
            tags: this.tags,
            tokenSeparators: this.tokenSeparators,
            tokenSeparatorsKeys: this.tokenSeparatorsKeys,
            dropdownAutoWidth: this.dropdownAutoWidth,
            placeholder: this.placeholder,
            ajax: this.ajax,
            cache: this.cache,
            closeOnSelect: this.closeOnSelect,
            minimumInputLength: this.minimumInputLength,
            maximumSelectionLength: this.maximumSelectionLength,
            minimumResultsForSearch: this.minimumResultsForSearch,
            language: this.language,
            withCheckboxes: this.withCheckboxes,
            dropdownParent: this.dropdownParent || $(".common-app-wrapper"),
            width: this.width,
            allowClear: this.allowClear,
            createTag: (params) => {
                return this.createTag(params);
            },
            rightSidePosition: this.rightSidePosition
            // templateResult: (data) => "!!!!!!!!!!!!!!!!" + data
            // containerCssClass: 'dropdown',
            // dropdownCssClass: 'dropdown'
        };
    }

    createTag(params) {
        // debugger;
        const term = $.trim(params.term);

        if (term === '') {
            return null;
        }

        return {
            id: term,
            text: term,
            isNewTag: !!(this.tags && this.multiple) // add additional parameters
        }
    }

    clearSelect() {
        this.setSelectedByIds([this.clearFormat.defaultValue], this.clearFormat.withTrigger);

        const self = this;
        if (self.compRef && self.compRef.data('select2') && self.compRef.data('select2').data) {
            let val = self.compRef.data('select2').data();
            self.selected = self._getSelectedFromVal(val);
            let eventData = {
                params: {
                    event: null,
                    context: self,
                    data: self.selected,
                    isSameAsPrevious: self.isMatchLastSelectedValue(val)
                }
            };


            //is necessary to overlap the "select:close" event
            self.onSelect.emit(eventData);

            // this.close();
        }
    }

    setFocus() {
        setTimeout(() => {
            if ($(this.compRef).data('select2')) {
                this.compRef.select2('focus');
            }
        });
    }

    /**
     * Set default options
     * @param paramOptions
     */
    public setDefaultOptions(paramOptions) {
        this.extendsOptions = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            paramOptions // options from params
        );
    }

    /**
     * Returned current state options for plugin
     * @returns Object
     */
    public getActualOptions(paramOptions = {}) {
        let opts = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            this.extendsOptions, // actually options
            paramOptions // options from params
        );

        return opts;
    }

    addCustomClass() {
        if (this.wrapperClass) {
            $(this.compRef).addClass(this.wrapperClass);
        }
    }

    ngAfterViewInit(emit: boolean = true) {
        this.arrayProvider.customStandardToString = this.customStandardToString;
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            // TODO It simple solution, but not working; Need solution; https://github.com/angular/angular/issues/17880;
            // this._compiler.clearCache();

            // Bad solution, but working
            let placeholder = this.placeholderRefToTranslate ? this.translate.instant(this.placeholderRefToTranslate) : this.placeholder;
            this.reinitPlugin({placeholder: placeholder});
        });

        const self = this;
        this.routerEventsSubscr = this.router
            .events.pipe(
                filter(e => e instanceof NavigationStart))
            .subscribe(() => {
                self.close();
            });

        this.guid = Guid.newGuid();
        // start plugin after view init
        this.initPlugin();
        this.addCustomClass();
        if (this.data && this.data.length > 0) {
            this.setData(this.data);
        }

        if (emit) {
            this.onReady.next();
            this.onReady.complete();
        }
    }

    ngOnDestroy() {
        this.routerEventsSubscr && this.routerEventsSubscr.unsubscribe();
        if ($(this.compRef).data('select2')) {
            this.compRef.select2("destroy");
        }
        this.destroyed$.next();
        this.destroyed$.complete();
        // console.log('Destroy');
    }

    /**
     * Set selected values
     * @param selected
     * @param withTrigger
     */
    public setSelectedByIds(selected, withTrigger: boolean = false) {
        if (selected === null || selected === undefined) {
            this.clearSelected();
            return;
        }
        if (this.multiple == false) {
            this.selected = typeof selected == "string" ? selected : selected[0];
        } else {
            this.selected = selected;
        }

        this.setSelected();
        if (withTrigger == true) {
            this.compRef.trigger('select2:select');
        }
    }

    /**
     * Get array of data
     * @returns {Array<any>}
     */
    public getData(): Select2ListTypes {
        return this.data || [];
    }

    public findDataById(id: number | string): Select2ItemType[] {
        return this._storageData.filter((d: Select2ItemType) => {
            return d.id === id
        });
    }

    /**
     * Get data by index
     * @param i
     * @returns {Select2ItemType}
     */
    public getDataByIndex(i: number): Select2ItemType {
        let d = this.getData();
        let r: Select2ItemType;
        if (d && d.length > 0) {
            r = d[i];
        }

        return r;
    }

    getDataByText(text): Select2ItemType {
        let d = this.getData();
        let r: Select2ItemType;
        $.each(d, (k, i) => {
            if (i.text == text) {
                r = i;
                return false;
            }
        });

        return r;
    }

    getArrDataByText(text): Select2ItemType[] {
        let d = this.getData();
        let r: Select2ItemType[] = [];
        $.each(d, (k, i) => {
            if (i.text == text) {
                r.push(i);
            }
        });

        return r;
    }

    /**
     * Adding ids to array of selected
     * @param selected
     */
    public addSelectedByIds(selected) {
        this.selected = this.arrayProvider.merge(this.selected, selected, {
            unique: true,
            sort: true
        });
        if (this.multiple == false) {
            this.selected = this.selected[0];
        }

        this.setSelected();
    }

    /**
     * Adding new objects to data and adding their ids to array of selected
     * @param objects
     */
    public addSelectedObjects(objects: Array<any>, withReinit: boolean = true) {
        this.data = this.data.concat(objects);

        if (this.multiple == false) {
            this.selected = [this.data[this.data.length - 1].id];
        } else {
            let self = this;
            objects.forEach(function (obj) {
                self.selected.push(obj.id);
            });
        }

        if (withReinit == true) {
            this.reinitPlugin({data: this.data});
        }
    }

    /**
     * Clear selected values
     */
    public clearSelected(val = null) {
        this.clearSelectedValues(val = null);
    }

    /**
     * Set placeholder
     * @param val
     */
    public setPlaceholder(val: string, clear: boolean = false): void {
        this.placeholder = val;
        this.reinitPlugin({placeholder: this.placeholder});
        if (clear) {
            this.clearSelected();
        }
    }

    /**
     * Clearing array of data
     * @param withReinit
     */
    public clearData(withReinit: boolean = true) {
        this.data = [];
        this.selected = [];
        this.clearDataInDOM();

        if (withReinit == true) {
            this.reinitPlugin({data: this.data});
        }
    }

    /**
     * Refreshing data without reset
     * @param data
     */
    public refreshData(data) {
        // not sure that it work (
        this.compRef.change();
    }

    /**
     * Clear selected values and data list
     * @param withReinit
     */
    public clear(withReinit: boolean = true) {
        this.clearSelected();
        this.clearData(withReinit);
    }

    public setData(data: Array<any>, withReinit: boolean = true, grouping?: boolean, groupViews?: boolean) {
        this.clear(false);
        this._storageData = data;
        this.grouping = grouping;

        if (groupViews === undefined && this._storageData && this._storageData.length) {
            this._storageData = this._storageData.filter(function (item: Select2ItemType) {
                return !!item.text;
            }).sort((a, b) => this.sorter(a, b, this));
        }

        if (this._storageData.length > this.maxDataItems) {
            this.data = this._storageData.slice(0, this.maxDataItems);
        } else {
            this.data = this._storageData;
        }
        this._bindOption(withReinit, grouping, this.data);

        this.clearSelected();
        if (this.value) {
            if (this.value === 'first') {
                if (data[0]) {
                    this.setSelectedByIds([data[0].id]);
                }
            } else if (this.value && Array.isArray(this.value as any[])) { // is array
                // const selected = this.value.filter(el => !!el);
                this.setSelectedByIds(
                    (this.value as any[])
                        .filter(el => (el !== null && el !== undefined))
                        .map(el =>
                            (el.Id !== null && el.Id !== undefined)
                                ? el.Id
                                : (el.id !== null && el.id !== undefined) ? el.id : el)
                );
            } else if (this.value && typeof this.value === 'object') {
                if ((this.value as Select2ItemType).id && (this.value as Select2ItemType).text) {
                    this.setSelectedByIds([(this.value as Select2ItemType).id])
                }
            } else {
                this.setSelectedByIds([this.value], true);
            }
        }

    }

    public turnAndSetData(dirtyData: any[] = [], rules: Select2ConvertObject, selectedIds: string[] | number[] = []) {
        const data: Select2ItemType[] = this.turnArrayOfObjectToStandart(dirtyData, rules);
        this.setData(data);
        if (selectedIds.length > 0) {
            this.setSelectedByIds(selectedIds);
        }
    }

    /**
     * Get selected ids
     * @returns {any}
     */
    public getSelected() {
        const b = this.compRef.val();
        if (Array.isArray(b)) {
            return _.uniq(b);
        }
        return b
    }

    public getSelectedId(): null | string | number {
        return this.getSelected();
    }

    public getSelectedText(): Array<string | number> {
        let res = [];
        // if(this.compRef && this.compRef.select2 && this.compRef.data('select2')){
        const data = (<any>$(this.compRef)).select2('data');
        if (data && data.length > 0) {
            $.each(data, (k, o) => {
                res.push(o.text);
            });
        }
        // }
        return res;
    }

    public getSelectedTextByIdForSingle(id: number): string {
        return this.compRef.select2('data')[0].text;
    }

    public getSelectedObject(): Select2ItemType {
        return <Select2ItemType>{
            id: this.getSelected(),
            text: this.getSelectedText()[0]
        };
    }

    public getSelectedObjects(): Select2ItemType[] {
        const res: Select2ItemType[] = [];
        const data = (<any>$(this.compRef)).select2('data');
        if (data && data.length > 0) {
            $.each(data, (k, o: Select2ItemType) => {
                res.push(o)
            });
        }

        return res;
    }

    public getObjectByTextAndId(text: string, id: string | number): Select2ItemType | null {
        let arrVals: Select2ItemType[] = this.getArrDataByText(text);
        if (arrVals.length === 0) {
            return null;
        }

        if (arrVals.length === 1) {
            return arrVals[0];
        }

        if (arrVals.length > 1) {
            let res: Select2ItemType;
            $.each(arrVals, (k, v: Select2ItemType) => {
                if (v.id == id) {
                    res = v;
                    return false;
                }
            });

            if (!res) {
                return null;
            } else {
                return res;
            }
        }
    }

    removeDataById(id) {
        this.setData(this.getData().filter((i) => {
            return i.id != id;
        }), true);
    }

    /**
     * Disable plugin
     */
    public disable() {
        this.switchingDisablingPlugin(true);
    }

    /**
     * Enable plugin
     */
    public enable() {
        this.switchingDisablingPlugin(false);
    }

    /**
     * Open dropdown
     */
    public open() {
        // if (!this.openOnClick) {
        //     this.openOnClick = true;
        //     // this.compRef.select2("open");
        //     this.compRef.select2("open");
        //     let ddc = $(this.getDropdown().$dropdownContainer);
        //     ddc.attr('id', this.guid);
        //     let dd = ddc.find('.select2-dropdown');
        //     dd.css({opacity: 0, top: -10});
        //     dd.show();
        //     dd.stop();
        //     dd.animate({opacity: "1", top: "0px"}, 150, 'easeOutCubic', () => {
        //         dd.css({opacity: 1, top: 0});
        //     });
        // } else {
        //     this.openOnClick = false;
        //     // this.close();
        //     // if (!this.isOpen()) {
        //     //     this.compRef.select2("open");
        //     //     let ddc = $(this.getDropdown().$dropdownContainer);
        //     //     ddc.attr('id', this.guid);
        //     //     let dd = ddc.find('.select2-dropdown');
        //     //     dd.css({opacity: 0, top: -10});
        //     //     dd.show();
        //     //     dd.stop();
        //     //     dd.animate({opacity: "1", top: "0px"}, 150, 'easeOutCubic', () => {
        //     //         dd.css({opacity: 1, top: 0});
        //     //     });
        //     // }
        // }
    }

    /**
     * Close dropdown
     */
    public close() {
        // if (!this.openOnHover) {
        //     //this.compRef.select2("close");
        //     let dd = $(this.getDropdown().$dropdownContainer).find('.select2-dropdown');
        //     dd.stop();
        //     dd.animate({opacity: "0", top: "-10px"}, 150, 'easeOutCubic', () => {
        if (this.compRef && this.compRef.select2 && this.compRef.data('select2')) {
            this.compRef.select2("close");
        }

        //     })
        // } else {
        //     let dd = $(this.getDropdown().$dropdownContainer).find('.select2-dropdown');
        //     dd.stop();
        //     dd.animate({opacity: "0", top: "-10px"}, 150, 'easeOutCubic', () => {
        //         this.compRef.select2("close");
        //     })
        // }
    }

    public isOpen() {
        return !!this.compRef.data('select2').dropdown.$dropDownContainer;
    }

    setDisabled(disabled) {
        this.disabled = disabled;
        this.readonly = disabled;
        this.cdr.detectChanges();
    }

    refresh() {
        if (this.disabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    /**
     * Show html in text option of data as simple text
     * @param data
     * @returns {Array}
     */
    public dataHtmlToText(data = []) {
        let escData = [];
        data.forEach(function (obj, key) {
            // let escText = '<xmp>' + obj.text + '</xmp>';
            let escText = obj.text.replace("<", "&lt;").replace(">", "&gt;");
            obj.text = escText;
            escData[key] = obj;
        });

        return escData;
    }

    /**
     * Turning object of objects to array of objects understandable for plugin
     */
    public turnObjectOfObjectToStandart(obj = {}, comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }): Array<Select2ItemType> {
        return this.arrayProvider.turnObjectOfObjectToStandard(obj, comp)
    }

    /**
     * Turning array of objects to array of objects understandable for plugin
     */
    public turnArrayOfObjectToStandart(arr = [], comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }): Array<Select2ItemType> {
        return this.arrayProvider.turnArrayOfObjectToStandard(arr, comp);
    }

    public turnArrayOfObjectToStandartGrouping(arr = [], comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }): Array<Select2ItemType> {
        return this.arrayProvider.turnArrayOfObjectToStandardGrouping(arr, comp);
    }

    /**
     * Turning simple array to standart object understandable for plugin
     * @returns {Array}
     * @param arr
     */
    public turnArrayToStandart(arr: Array<any> = []): Array<Select2ItemType> {
        return this.arrayProvider.turnArrayToStandard(arr);
    }

    /**
     * Turning simple object to standart object understandable for plugin
     * @returns {Array}
     * @param dirtyObj
     */
    public turnSimpleObjectToStandart(dirtyObj = {}): Array<Select2ItemType> {
        return this.arrayProvider.turnSimpleObjectToStandard(dirtyObj);
    }

    /**
     * Turning any crazy object to object understandable for plugin
     */
    public turnObjectToStandart(dirtyObj = {}, comp = {
        key: 'id',
        text: 'text'
    }): Select2ItemType {
        return this.arrayProvider.turnObjectToStandard(dirtyObj);
    }

    public standartToString(dirtyObj, comp, stObj) {
        return this.arrayProvider.standardToString(dirtyObj, comp, stObj);
    }

    /**
     * Applying object selected and displaying him
     * @param selected
     */
    setSelected(selected: any = []) {
        if (!selected || selected.length == 0) {
            selected = this.selected;
        } else {
            this.selected = selected;
        }

        if (selected == null || selected.length == 0) {
            this.clearSelected();
            return;
        }

        if (!this.compRef || !this.compRef.data('select2')) {
            return;
        }

        // create missing options
        if (!this.multiple) {
            let option = this.compRef.data('select2').$element.find('option[value="' + this.selected + '"]');
            if (!option.length) {
                this.createOptionFromStorageData(this.selected);
            }
        } else {
            $.each(this.selected, (k, id) => {
                let option = this.compRef.data('select2').$element.find('option[value="' + id + '"]');
                if (!option.length) {
                    this.createOptionFromStorageData(id);
                }
            });
        }

        // if validation is active
        if (this.validationEnabled) {
            var isSelectedItemInChildren = false;
            this.data.forEach(function (el) {
                if (el.children) {
                    var selectedItems = el.children.filter(function (child) {
                        return child.id == selected;
                    });
                    if (selectedItems.length) {
                        isSelectedItemInChildren = true;
                    }
                }
            });
            var isSelectedItemInData = this.data.filter(function (el) {
                return el.id == selected;
            });
            if ((Array.isArray(selected) && selected.length === 0) || (isSelectedItemInData.length === 0 && !isSelectedItemInChildren)) {
                this.setValidation(false);
            } else {
                this.setValidation(true);
            }
        } else {
            this.setValidation(true);
        }

        this.compRef.val(selected).trigger('change');

        this.lastSelectedValue = [];
        if (Array.isArray(selected)) {
            for (let item of selected) {
                this.lastSelectedValue.push({id: item});
            }
        } else {
            this.lastSelectedValue.push({id: selected});
        }
    }

    public createOptionFromStorageData(id) {
        let datas: any[] = this._storageData.filter((i) => {
            return i.id == id;
        });
        if (datas.length == 1) {
            let data = datas[0];
            if (!this.compRef.data('select2').$element.find('option[value="' + data.id + '"]').length) {
                let el = $("<option>").attr("value", data.id).text(data.text);
                data.element = el;
                this.compRef.data('select2').$element.append(el);

                // @todo may be better
                // const newOption = new Option(data.text, data.id, false, false);
                // this.compRef.data('select2').append(newOption).trigger('blur').trigger('change');
            }
        }
    }

    /**
     * Re init jQuery plugin with new options
     */
    public reinitPlugin(paramOptions: Object = {}, compRef?: Element) {
        if (compRef) {
            this.compRef = compRef;
        }
        if (!this.compRef) {
            return;
        }
        this.compRef.select2("destroy");
        this.initPlugin(true, paramOptions);
    }

    /**
     * Init jQuery plugin with options
     */
    initPlugin(reinit: boolean = false, paramOptions = {}) {
        if (!this.elementRef) {
            return;
        }
        if (!reinit) {
            this.compRef = $(this.elementRef.nativeElement);
        }
        let options = $.extend(true, this.getActualOptions(), paramOptions);
        if (this.withCheckboxes) {
            options = this.enableCheckboxes(options);
        }

        options.rightSidePosition = this.rightSidePosition;

        if (this.multiple && this.tags) {
            options = this.enableTags(options)
        }

        let self = this;

        this.compRef = this.compRef.select2(options);

        // Fix bugs with incorrect working highlighting
        let compData = this.compRef.data('select2');


        compData.dataAdapter.container.listeners['results:all'].unshift(function (cont: {
            data: { results: Select2ConvertObject[] },
            query: { _type: string },
            _type: "results:all"
        }) {
            if (cont.data.results.length > self.maxDataItems) {
                cont.data.results = cont.data.results.slice(0, self.maxDataItems);
                if (this.$dropdown.find('.select2-results .custom-msg-select2').length == 0) {
                    this.$dropdown.find('.select2-results').append('<span class="custom-msg-select2">' + self.bottomDropdownMessage + '</span>').show();
                }
            } else {
                if (this.$dropdown.find('.select2-results .custom-msg-select2').length > 0) {
                    this.$dropdown.find('.select2-results .custom-msg-select2').remove();
                }
            }
        });

        compData.dataAdapter.container.listeners['query'].push(function (term: { term: string }) {
            let answer = [];
            let counter = 0;
            $.each((<any>self._storageData), (k, item) => {
                let lText = item.text.toLowerCase();
                let lTerm = term.term.toLowerCase();

                if (counter >= self.maxDataItems) {
                    return false;
                }
                if (lText.length === lTerm.length && lText.indexOf(lTerm) > -1) {
                    answer.unshift(item);
                    counter++;
                } else if (lText.indexOf(lTerm) > -1) {
                    answer.push(item);
                    counter++;
                } else if (typeof item.children !== 'undefined') {
                    var filteredChildren = [];
                    $.each(item.children, function (idx, child) {
                        if (child.text.toLowerCase().indexOf(term.term.toLowerCase()) > -1) {
                            filteredChildren.push(child);
                        }
                    });

                    // If we matched any of the timezone group's children, then set the matched children on the group
                    // and return the group object
                    if (filteredChildren.length) {
                        var modifiedData = $.extend({}, item, true);
                        modifiedData.children = filteredChildren;

                        // You can return modified objects from here
                        // This includes matching the `children` how you want in nested data sets
                        answer.push(modifiedData);
                    }
                }
            });
            self._bindOption(true, self.grouping, answer);
            (<any>this).trigger('results:all', {
                data: {results: answer},
                query: {term: term.term, _type: 'query'}
            });

            if (!term.term) {
                if (self._storageData.length >= self.maxDataItems) {
                    if (this.$dropdown.find('.select2-results .custom-msg-select2').length == 0) {
                        this.$dropdown.find('.select2-results').append('<span class="custom-msg-select2">' + self.bottomDropdownMessage + '</span>').show();
                    }
                } else {
                    this.$dropdown.find('.select2-results .custom-msg-select2').remove();
                }
                // return;
            }
        });


        compData.results.highlightFirstItem = function () {
            let $options = compData.$results
                .find('.select2-results__option[aria-selected]');

            let $selected = $options.filter('[aria-selected=true]');

            if (self.withCheckboxes) {
                // Check if there are any selected options
                if ($selected.length == 0) {
                    // If there are no selected options, highlight the first option
                    // in the dropdown
                    $options.first().trigger('mouseenter');
                }
            } else {
                // Check if there are any selected options
                if ($selected.length > 0) {
                    // If there are selected options, highlight the first
                    $selected.first().trigger('mouseenter');
                } else {
                    // If there are no selected options, highlight the first option
                    // in the dropdown
                    $options.first().trigger('mouseenter');
                }
            }

            compData.results.ensureHighlightVisible();
        };

        // Events
        this.bindEventsToEmmiters();

        // Displaying selections
        this.setSelected();
        $('b[role="presentation"]').hide();
        $('.select2-selection__arrow').each(function () {
            if ($(this).find("i").length == 0) {
                $(this).append('<i class="icons-down icon"></i>');
            }
        });


        // if (this.openOnHover) {
        //     let timeoutHandler = null;
        //     $(this.compRef).next(".select2").mouseenter(function () {
        //         self.cursorLeavedTheEl = false;
        //         timeoutHandler = setTimeout(() => {
        //             self.open();
        //         }, self.delayForOpeningDropdown)
        //
        //     });
        //     $(document).on("mouseleave", ".select2-container", (e) => {
        //         if ($((<any>e).toElement || (<any>e).relatedTarget).closest(".select2-container").length == 0) {
        //             clearTimeout(timeoutHandler);
        //             self.cursorLeavedTheEl = true;
        //             self.close();
        //         }
        //     });
        //     $(document).on("mouseout", ".select2-container", (e) => {
        //         if ($((<any>e).toElement || (<any>e).relatedTarget).closest(".select2-container#" + this.guid).length == 0) {
        //             clearTimeout(timeoutHandler);
        //             self.cursorLeavedTheEl = true;
        //             self.close();
        //         }
        //     });
        // } else {
        $(this.compRef).next(".select2").click(function () {
            self.open();
        });
        // }
    }

    /**
     * Check validation
     * @param selected
     */
    public checkValidation(selected: any = []) {
        // if validation is active
        if (this.validationEnabled) {
            if (selected === null || selected === undefined || (Array.isArray(selected) && selected.length === 0)) {
                this.setValidation(false);
            } else {
                this.setValidation(true);
            }
        }
    }

    /**
     * Get validation value
     */
    public getValidation() {
        return this.isValid;
    }

    public setValidation(valid: boolean) {
        this.isValid = valid;
        if (valid) {
            this.compRef.parent().removeClass('error-validation');
        } else {
            this.compRef.parent().addClass('error-validation');
        }
    }

    enableTags(options) {
        options.templateSelection = this.templateSelection;
        // options.closeOnSelect = false;
        // options.multiple = true;
        // options.maximumSelectionLength = 0;
        // options.selectOnClose = false;
        options.escapeMarkup = function (markup) {
            return markup;
        };
        return options;
    }

    templateSelection(data: Select2ItemType, container) {
        if (data.isNewTag === true) {
            container.addClass('imfx-new-tag-option');
        } else {
            container.removeClass('imfx-new-tag-option');
        }

        return data.text;

    }

    bindCancel($event) {
        let self = this;
        let initFlag = true;
        let elem = document.querySelector('.select2-container.select2-container--default.select2-container--open:not(.select2-container--above)');
        let cb = function f(ev) {
            if (initFlag) {
                initFlag = false;
                return;
            }

            if (self.destroyed$.isStopped || !elem) {
                document.removeEventListener('mousedown', f);
            }
            if (elem && elem.contains(ev.target)) {
                // ev.stopPropagation();
                return;
            }
            document.removeEventListener('mousedown', f);
            self.close();
        };

        self.cancelCb = cb;
        document.addEventListener('mousedown', cb);
    }

    /**
     * Custom elements sorter delegate
     * @type {Array}
     */
    @Input('sorter') protected sorter: any = function (a: Select2ItemType, b: Select2ItemType, context) {
        let nameA = '', nameB = '';
        if ((<any>a.text).Value != null || (<any>a.text).Value != undefined) {
            nameA = (<any>a.text).Value.toLowerCase();
            nameB = (<any>b.text).Value.toLowerCase();
        } else {
            nameA = a.text.toLowerCase();
            nameB = b.text.toLowerCase();
        }
        return nameA < nameB ? -1 : 1;
    };

    protected getDropdown() {
        return this.compRef.data('select2').dropdown;
    }

    /**
     * Disable/Enable plugin
     * @param val
     */
    protected switchingDisablingPlugin(val: boolean) {
        if (!this.compRef) {
            return;
        }
        this.compRef.prop("disabled", val);
    }

    /**
     * Remove option tag in DOM of component
     */
    protected clearDataInDOM() {
        if (!this.compRef) {
            return;
        }
        this.compRef.find('option').remove();
        this.compRef.find('optgroup').remove();
    }

    /**
     * Clearing selected values and displaying it
     */
    protected clearSelectedValues(val = null) {
        if (!this.compRef) {
            return;
        }
        this.compRef.val(val).trigger('change');
    }

    protected selectAll(): void {
        this.selected = [];
        let allOpts = this.compRef.find('option');
        allOpts.each((k, el) => {
            this.selected.push($(el).val());
        });

        this.setSelected();
        this.reinitPlugin();
    }

    protected deselectAll(): void {
        this.selected = [];
        this.setSelected();
        this.reinitPlugin();
    }

    protected enableCheckboxes(options): any {
        options.templateResult = this.templateResult;
        // options.templateSelection = this.templateSelection;
        options.closeOnSelect = false;
        options.multiple = true;
        options.maximumSelectionLength = 0;
        options.selectOnClose = false;
        options.escapeMarkup = function (markup) {
            return markup;
        };

        return options;
    }

    protected templateResult(repo, container, context) {
        if (repo.loading) return repo.text;
        // console.log(repo, container, context);
        let option = context.$element.find('option[value="' + repo.id + '"]');
        if (option.length > 0) {
            repo.selected = option[0].selected;
        }
        let checked = repo.selected ? 'icons-check' : '';
//         if(repo.selected){
//             debugger
// ;        }
        return "<span>" +
            "<i class='icon checkbox-in-select-2 " + checked + " select-item-id-" + repo.id + "' aria-hidden='true'></i>" +
            // "<i class='icon checkbox-in-select-2 " + checked + " select-item-id-" + repo.id + "' aria-hidden='true'></i>" +
            "<span class='select2-option-text-checkbox'>" + repo.text + "</span>" +
            "</span>";
    }


    protected changeStateOfCheckbox(selector: any, data, selected = null) {
        let el = {};
        if (selector.tagName != 'SELECT') {
            // let data = $(currentTarget).data('data')
            el = $(selector).find('i.select-item-id-' + data.id);
        } else {
            el = this.compRef.data('select2').$dropdown.find('i.select-item-id-' + data.id);
        }

        if (selected === null) {
            data.selected ? this.enableCheckbox(el) : this.disableCheckbox(el);
        } else {
            !selected ? this.enableCheckbox(el) : this.disableCheckbox(el);
        }
    }

    protected enableCheckbox(el) {
        el.parent().parent().attr('aria-selected', true);
        el.addClass('icons-check');
    }

    protected disableCheckbox(el) {
        el.parent().parent().attr('aria-selected', false);
        el.removeClass('icons-check');
    }

    /**
     * Bind event onSearch
     */
    protected triggerOnSearch() {
        var self = this;
        if (this.minimumResultsForSearch != Infinity) {
            $(document).on(
                'keyup',
                '.select2-container .select2-search__field',
                function (e) {
                    //Do key up
                    self.onSearch.emit(e);
                });

        }
    }

    protected triggerAfterScroll() {
        var self = this;
        if (this.minimumResultsForSearch != Infinity) {
            $(document).on(
                'keyup',
                '.select2-container .select2-search__field',
                function (event) {
                    setTimeout(() => {
                        self.afterSearch.emit(event);
                    });
                });
        }
    }

    protected getDropdownElByIndex(index) {
        let el = $('.select2-container--open .select2-dropdown');
        if (!el) {
            return false;
        }

        return el.eq(0).find('li.select2-results__option')[index];
    }

    protected clickableOnlyArrowHanlder($event) {
        // console.log($event);
    }

    protected bindEventsToEmmiters() {
        let flagNotOpenNow = false;
        let flagCalled = 0;
        let self = this;
        let th = null;
        // https://stackoverflow.com/questions/5464695/jquery-change-event-being-called-twice
        this.compRef.unbind('select2:select');
        this.compRef.unbind('select2:unselect');
        this.compRef.unbind('select2:open');
        this.compRef.unbind('select2:closing');
        this.compRef.unbind('select2:close');
        this.compRef.unbind('select2:opening');
        //
        this.compRef.on("select2:opening", function (e) {
            if (flagNotOpenNow) {
                e.preventDefault();
                return false;
            }
        });

        // this.compRef.on('results:all', function (params) {
        //     debugger;
        //     if (params.query.term == null || params.query.term === '') {
        //         var showSearch = self.compRef.showSearch(params);
        //
        //         if (showSearch) {
        //             self.compRef.$searchContainer.removeClass('select2-search--hide');
        //         } else {
        //             self.compRef.$searchContainer.addClass('select2-search--hide');
        //         }
        //     }
        // });

        this.compRef.on("select2:open", function (e, d) {
            e.stopPropagation();
            e.preventDefault();
            // self.compRef.val(JSON.stringify(self.getSelectedObject())).trigger('select2:select');
            // /*debugger*/
            // Bind scroll
            // self.triggerEventsForScroll(th, e);

            // Bind event onSearch
            self.triggerOnSearch();

            // set selected to event
            e.selected = self.selected;

            // emitters
            self.onOpen.emit(e);
            self.onAnyEvent.emit(e);

            // Bind event afterScroll
            self.triggerAfterScroll();

            // $('.js-scrollbar-target-adv').on('scroll', function () {
            //     self.close();
            // });

            if (self.withCheckboxes) {
                setTimeout(() => {
                    $.each(self.compRef.select2('data'), (k, o) => {
                        if (self.getSelected().indexOf(o.id) > -1) {
                            let el = self.getDropdownElByIndex(o.element.index);
                            if (el) {
                                self.changeStateOfCheckbox($(el), o);
                                // self.enableCheckbox($(el));
                            }
                        }
                    });
                });
            }
            if (self.withOptionMouseEnter) {
                setTimeout(() => {
                    let el = $('.select2-container--open .select2-dropdown');
                    if (el) {
                        var options = el.eq(0).find('li.select2-results__option');

                        for (var o = 0; o < options.length; o++) {
                            let data = options[o].textContent;
                            options[o].addEventListener('mouseenter', (e) => {
                                self.onOptionHover.emit(data);
                            });
                        }
                    }
                });
            }

            // self.compRef.select2('close');
            //  let ddc = $(self.getDropdown().$dropdownContainer);
            //  ddc.attr('id', self.guid);
            //  let dd = ddc.find('.select2-dropdown');
            //  dd.hide();

            self.bindCancel(e);
        });
        this.compRef.on("select2:closing", function (e) {
            if (self.openOnHover && !self.cursorLeavedTheEl) {
                e.preventDefault();
                return false;
            }
            self.cancelCb && document.removeEventListener('mousedown', self.cancelCb);
            // destroy listener on closing dropdown
            // $('.js-scrollbar-target-adv').off('scroll');
        });

        this.compRef.on("select2:close", (e) => {
            e.selected = this.selected;
            // $('.select2-selection__choice__remove').click(function (e) {
            //     flagNotOpenNow = true;
            // })
            // new Promise((r) => {
            //     r();
            // }).then(() => {
            setTimeout(() => {
                if (self.compRef && self.compRef.data('select2') && self.compRef.data('select2').data && self.compRef.data('select2').data().length > 0) {
                    const val = self.compRef.data('select2').data();
                    self.selected = self._getSelectedFromVal(val);
                    if (val.length > 0) {
                        self.skipOnSelect = true;

                        let eventData = {
                            params: {
                                event: e,
                                context: self,
                                data: self.getSelectedObjects(),
                                isSameAsPrevious: self.isMatchLastSelectedValue(val)
                            }
                        };
                        // is necessary ?
                        // self.onSelect.emit(<Select2EventType>eventData);

                        self.onClose.emit(e);
                        self.onAnyEvent.emit(e);
                    } else {
                        self.onClose.emit(e);
                        self.onAnyEvent.emit(e);
                    }
                }
            });
        });
        // });

        this.compRef.on("select2:select", function (e) {
            if (self.multiple == false) {
                self.cursorLeavedTheEl = true;
                self.close();
            }

            e.selected = self.selected;
            if (self.withCheckboxes) {
                if (e.params && e.params.originalEvent) {
                    self.changeStateOfCheckbox($(e.params.originalEvent.currentTarget), e.params.data, );
                } else {
                    const _data = e.selected.map(el => ({id: el, selected: true}));
                    for (let item of _data) {
                        self.changeStateOfCheckbox(e.currentTarget, item);
                    }
                }
            }

            //if (!self.skipOnSelect) {
            // let renderEl = self.compRef.data('select2').$container.find('.select2-selection__rendered');
            // if(!self.multiple) {
            //     renderEl.text(e.params.data.text);
            // }e.params
            if (self.compRef && self.compRef.data('select2') && self.compRef.data('select2').data) {
                let val = self.compRef.data('select2').data();
                // self.selected = self._getSelectedFromVal(val);
                let eventData = {
                    params: {
                        event: e,
                        context: self,
                        data: val,
                        isSameAsPrevious: self.isMatchLastSelectedValue(val)
                    }
                };

                self.onSelect.emit(eventData);
                self.onAnyEvent.emit(e);
            }

            const s2 = self.compRef.data('select2');
            s2.dataAdapter.$search.val('');

            // } else {
            //     self.skipOnSelect = false;
            // }

        });
        this.compRef.on("select2:unselect", function (e) {
            if (self.multiple === false) {
                self.selected = null;
                self.clearSelected();
            }
            if (self.withCheckboxes && e.params.originalEvent) {
                if (e.params.originalEvent) {
                    self.changeStateOfCheckbox($(e.params.originalEvent.currentTarget), e.params.data);
                } else {
                    self.changeStateOfCheckbox(e.currentTarget, e.params.data);
                }
            }
            let eventData = {
                params: {
                    event: e,
                    context: self,
                    data: self.getSelectedObjects(),
                    isSameAsPrevious: self.isMatchLastSelectedValue(self.getSelectedObjects())
                }
            };
            self.onUnselect.emit(eventData);
            self.onAnyEvent.emit(e);
        });

        this.onSelect.subscribe((val: Select2EventType) => {
            this.lastSelectedValue = val.params.data;
        });
    }

    /**
     * checking on match with last selected value
     */
    protected isMatchLastSelectedValue(val: Array<any>) {
        if (!val) {
            return false;
        }

        if (Array.isArray(this.lastSelectedValue) && this.lastSelectedValue.length == val.length) {
            return this.lastSelectedValue.every((el, i, arr) => {
                return arr[i].id == val[i].id;
            });
        } else {
            return false;
        }
    }

    protected overrideMultipleTemplate() {
        (<any>$.fn).select2.amd.require('select2/selection/multiple').prototype.selectionContainer = function () {
            return $(
                '<li class="select2-selection__choice imfx-choice-remove">' +
                ' <div class="select2-selection__choice__remove" role="presentation">' +
                '   <i class="icons icons-closedelete icon small"></i>' +
                ' </div>' +
                '</li>'
            );
        };
    }

    private _getSelectedFromVal(val) {
        let v = null;
        if (val == null) {
            this.clearSelected();
            return v;
        }
        if (Array.isArray(val)) {
            v = (val as []).map((item: Select2ItemType) => {
                return item.id
            });
        } else if (typeof val === 'object') {
            v = val.id ? val.id : null;
        } else {
            v = val;
        }
        if (v == null || !v.length) {
            this.clearSelected();
        }
        return v;
    }

    private _bindOption(withReinit, grouping, answer) {
        if (withReinit == true) {
            this.data = answer;
            if (grouping) {
                $.each(this.data, (key, value) => {
                    let group = $(this.compRef).find(`optgroup#${key}`);

                    group = (group.length)
                        ? group
                        : $('<optgroup label="' + value.text + '" id="' + key + '" />');

                    const opts = group.find('option');
                    const optsIndexes: any[] = (opts.map((i) => {
                        return parseInt($(opts[i]).val());
                    })).toArray();

                    $.each(value.children, (k, item: Select2ItemType) => {
                        if (optsIndexes.indexOf(item.id) === -1) {
                            const newOption = new Option(item.text, (<string>item.id), false, false);
                            group.append(newOption);
                        }
                    });
                    $(this.compRef).append(group);
                });
            } else {
                const opts = $(this.compRef).find('option');
                const optsIndexes: any[] = (opts.map((i) => {
                    return parseInt($(opts[i]).val());
                })).toArray();

                $.each(this.data, (k, item: Select2ItemType) => {
                    if (optsIndexes.indexOf(item.id) === -1) {
                        const newOption = new Option(item.text, (<string>item.id), false, false);
                        $(this.compRef).append(newOption);
                    }
                });

                // $(this.compRef).trigger('change');
            }

            //todo check collection-lookup/collection-lookups
            // $(this.compRef)
            // .val(JSON.stringify(this.getSelectedObject().id))
            // .trigger('change.select2');
            // $(this.compRef).trigger('change');
        }
    }
}
