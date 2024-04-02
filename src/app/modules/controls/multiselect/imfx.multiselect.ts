/**
 * Created by Sergey Trizna on 17.12.2016.
 */
// See http://wenzhixin.net.cn/p/multiple-select/docs/
import {
    Component, ChangeDetectionStrategy, ViewEncapsulation, Input, Output, EventEmitter,
    ViewChild
} from '@angular/core';

import {ArrayProvider} from '../../../providers/common/array.provider'

// Loading jQuery
import * as $ from 'jquery';

// Loading plugin
import "multiple-select";
import {Select2ConvertObject} from "../select2/types";

@Component({
    selector: 'imfx-controls-multiselect',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        ArrayProvider
    ]
})

export class IMFXControlsMultiselectComponent {
    @Output() onOpen: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCheckAll: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUncheckAll: EventEmitter<any> = new EventEmitter<any>();
    @Output() onFocus: EventEmitter<any> = new EventEmitter<any>();
    @Output() onBlur: EventEmitter<any> = new EventEmitter<any>();
    @Output() onOptgroupClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAnyEvent: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Reference to current component (for plugin)
     */
    @ViewChild('imfxControlsMultiselect', {static: false}) private compRef;

    /**
     * Selected ids of data objects
     * @type {Array}
     */
    @Input('selected') private selected: Array<any> = [];

    /**
     * Data for plugin
     * @type {Array}
     */
    @Input('data') data: Array<any> = [];

    /**
     * Width for select box
     * @type {string}
     */
    @Input('width') private width: string = '300px';

    /**
     * Set enabled/disabled for plugin on init
     * @type {boolean}
     */
    @Input('disabled') private disabled: boolean = false;

    /**
     * Group mode
     * @type {boolean}
     */
    @Input('groupMode') private groupMode: boolean = false;

    /**
     * Placeholder
     * @type {string}
     */
    @Input('placeholder') private placeholder: string = 'Select ...';

    /**
     * Multiple mode
     * @type {string}
     */
    @Input('multiple') private multiple: boolean = false;

    /**
     * Select all mode
     * @type {string}
     */
    @Input('selectAll') private selectAll: boolean = true;

    /**
     * Single mode
     * @type {string}
     */
    @Input('single') private single: boolean = false;

    /**
     * Filter
     * @type {string}
     */
    @Input('filter') private filter: boolean = true;

    /**
     * Is open
     * @type {string}
     */
    @Input('isOpen') private isOpen: boolean = false;

    /**
     * Filter
     * @type {string}
     */
    @Input('keepOpen') private keepOpen: boolean = false;

    /**
     * selectAllDelimiter
     * @type {Array}
     */
    @Input('selectAllDelimiter') private selectAllDelimiter: any[] = ['[', ']'];

    /**
     * selectAllDelimiter
     * @type {number}
     */
    @Input('minimumCountSelected') private minimumCountSelected: number = 3;

    /**
     * countSelected
     * @type {string}
     */
    @Input('countSelected') private countSelected: string = '# of % selected';

    /**
     * Container
     * @type {string}
     */
    @Input('container') private container: string = 'body';

    private extendsOptions = {};

    /**
     * Standart object understandable for plugin
     * @type {{value: string; text: string; selected: boolean; disabled: boolean}}
     */
    private standartObject = {
        value: '',
        text: '',
        selected: false,
        disabled: false
    }

    /**
     * Get default options
     */
    public getDefaultOptions() {
        return {
            data: this.data,
            disabled: this.disabled,
            placeholder: this.placeholder,
            multiple: this.multiple,
            width: this.width,
            selectAll: this.selectAll,
            single: this.single,
            filter: this.filter,
            isOpen: this.isOpen,
            keepOpen: this.keepOpen,
            selectAllDelimiter: this.selectAllDelimiter,
            minimumCountSelected: this.minimumCountSelected,
            countSelected: this.countSelected,
            container: this.container,
        };
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
     * @returns {{}&{data: Array<any>, tag: boolean, tokenSeparators: (","|" ")[], placeholder: string, ajax: null, cache: boolean}&{data: Array<any>, tag: boolean, tokenSeparators: (","|" ")[], placeholder: string, ajax: null, cache: boolean}}
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

    public constructor(private arrayProvider: ArrayProvider) {
    }

    ngAfterViewInit() {
        this.initPlugin();
    }

    /**
     * Get selected ids
     * @returns {any}
     */
    public getSelects() {
        return this.compRef.multipleSelect("getSelects");
    }

    /**
     * get selected ids (adapter)
     */
    public getSelected() {
        return this.compRef.multipleSelect("getSelects");
    }

    /**
     * Get selected labels
     * @returns {any}
     */
    public getSelectsAsText() {
        return this.compRef.multipleSelect("getSelects", "text");
    }

    /**
     * Check all items
     * @returns {any}
     */
    public checkAll() {
        return this.compRef.multipleSelect("checkAll");
    }

    /**
     * Un check all items
     * @returns {any}
     */
    public uncheckAll() {
        return this.compRef.multipleSelect("uncheckAll");
    }

    /**
     * Un check all items (decorator)
     * @returns {any}
     */
    public clearSelected() {
        return this.uncheckAll();
    }

    /**
     * Setting new array of data
     * @param data
     * @param withReinit
     */
    public setData(data: Array<any>, withReinit: boolean = true) {
        this.clear(false);
        this.data = data;
        if (withReinit == true) {
            this.reinitPlugin({data: this.data});
        }
    }

    /**
     * Clear selected values and data list
     * @param withReinit
     */
    public clear(withReinit: boolean = true) {
        this.clearSelected();
        this.clearData(withReinit);
    }


    /**
     * Creating element <option>
     * @param paramOpt
     */
    private getOptionEl(paramOpt) {
        let defOpts = {value: '', text: '', selected: false, disabled: false};
        let opts = Object.assign({}, defOpts, paramOpt);

        return $("<option />", opts);
    }

    /**
     * Insert options to base select
     * @param opts
     */
    private insertOptions(opts: Array<any>) {
        let self = this;
        opts.forEach(function (opEl) {
            self.insertOption(opEl);
        });
    }

    /**
     * Insert option to base select
     * @param opEl
     */
    private insertOption(opEl) {
        this.compRef.append(opEl);
    }

    /**
     * Clearing
     */
    private clearData(withReinit: boolean = true) {
        $(this.compRef).find('option').remove();
        $(this.compRef).find('optgroup').remove();
        if (withReinit == true) {
            this.reinitPlugin({data: this.data});
        }
    }

    /**
     * Refresh plugin
     */
    public refreshPlugin() {
        this.compRef.multipleSelect("refresh");
    }

    /**
     * Disable plugin
     */
    public disable() {
        this.switchingDisablingPlugin('disable');
    }

    /**
     * Enable plugin
     */
    public enable() {
        this.switchingDisablingPlugin('enable');
    }

    /**
     * Open dropdown
     */
    // TODO https://github.com/wenzhixin/multiple-select/issues/336
    // public open() {
    //     this.compRef.multipleSelect("open");
    // }

    /**
     * Close dropdown
     */
    public close() {
        this.compRef.multipleSelect("close");
    }

    /**
     * Disable/Enable plugin
     * @param val
     */
    private switchingDisablingPlugin(val: string) {
        this.compRef.multipleSelect(val);
    }

    /**
     * Applying object selected and displaying him
     * @param selected
     */
    private setSelected(selected: any = []) {
        if (!selected || selected.length == 0) {
            selected = this.selected;
        }
        this.compRef.multipleSelect("setSelects", selected);
    }

    /**
     * Show html in text option of data as simple text
     * @param data
     * @returns {Array}
     */
    public dataHtmlToText(data) {
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
    public turnObjectOfObjectToStandart(obj, comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }) {
        let res = [];
        let self = this;
        $.each(obj, function (key, dirtyObj) {
            res.push(self.turnObjectToStandart(dirtyObj, comp));
        });

        return res;
    }

    /**
     * Turning array of object to array of objects understandable for plugin
     */
    public turnArrayOfObjectToStandart(arr, comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }) {
        let res = [];
        let self = this;
        arr.forEach(function (dirtyObj) {
            res.push(self.turnObjectToStandart(dirtyObj, comp));
        });

        return res;
    }

    /**
     * Turning simple array to standart object understandable for plugin
     * @param array
     * @returns {Array}
     */
    public turnArrayToStandart(array: Array<any>) {
        let data = [];
        array.forEach(function (val, key) {
            data.push({value: key, text: val, selected: false, disabled: false});
        });

        return data;
    }

    /**
     * Turning any crazy object to object understandable for plugin
     */
    public turnObjectToStandart(dirtyObj, comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }, defObj = {
        selected: false,
        disabled: false
    }) {
        let obj = Object.assign({}, this.standartObject);
        obj.value = dirtyObj[comp.key];
        obj.text = dirtyObj[comp.text];
        obj.selected = comp.selected ? dirtyObj[comp.selected] : defObj.selected;
        obj.disabled = comp.disabled ? dirtyObj[comp.disabled] : defObj.disabled;

        return obj;
    }

    /**
     * Re init jQuery plugin with new options
     * @param paramOptions
     */
    public reinitPlugin(paramOptions: Object = {}) {
        let options = this.getActualOptions();
        let self = this;

        // updating options in base select element
        options.data.forEach(function (obj) {
            self.insertOption(self.getOptionEl(obj));
        });

        // Refresh plugin
        this.refreshPlugin();

        // Displaying selections
        this.setSelected();
    }

    /**
     * Init jQuery plugin with options
     */
    private initPlugin() {
        this.compRef = $(this.compRef.nativeElement);

        let options = this.getActualOptions();
        let optionsWithEvents = Object.assign(options, this.bindEventsToEmmiters());

        // updating options in base select element
        let self = this;
        optionsWithEvents.data.forEach(function (obj) {
            self.insertOption(self.getOptionEl(obj));
        });
        this.compRef.multipleSelect(optionsWithEvents);

        // After plugin init
        this.afterPluginInit();

        // Displaying selections
        this.setSelected();

    }

    private bindEventsToEmmiters() {
        let self = this;

        return {
            onOpen: function (e) {
                self.onOpen.emit(e);
                self.onAnyEvent.emit();
            },
            onClose: function (e) {
                self.onClose.emit(e);
                self.onAnyEvent.emit();
            },
            onCheckAll: function (e) {
                self.onCheckAll.emit(e);
                self.onAnyEvent.emit();
            },
            onUncheckAll: function (e) {
                self.onUncheckAll.emit(e);
                self.onAnyEvent.emit();
            },
            onFocus: function (e) {
                self.onFocus.emit(e);
                self.onAnyEvent.emit();
            },
            onBlur: function (e) {
                self.onBlur.emit(e);
                self.onAnyEvent.emit();
            },
            onOptgroupClick: function (view) {
                self.onOptgroupClick.emit(view);
                self.onAnyEvent.emit();
            },
            onClick: function (view) {
                self.onClick.emit(view);
                self.onAnyEvent.emit();
            }
        }
    }

    /**
     * After init the jq plugin
     */
    private afterPluginInit() {
        // Hide popup is scroll event fired
        let self = this;
        $('*').scroll(function (e) {
            self.close();
        })
    }
}
