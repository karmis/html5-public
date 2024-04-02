import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {IMFXControlsLookupsSelect2Component} from '../select2/imfx.select2.lookups';
import {Select2ConvertObject, Select2ItemType} from '../select2/types';
import {Select2EventType} from '../select2/imfx.select2';
import {CollectionLookupChangeType, CollectionLookupComp} from '../collection.lookup/collection.lookup.comp';
import {LookupsTypes} from '../../../services/system.config/search.types';
import {ArrayProvider} from '../../../providers/common/array.provider';
import {TranslateService} from '@ngx-translate/core';
import {StringProivder} from '../../../providers/common/string.provider';
import {Router} from '@angular/router';
import {LookupService} from '../../../services/lookup/lookup.service';
import {HttpService} from '../../../services/http/http.service';
import {MisrTemplatesMisrItems} from '../../../views/system/config/comps/misrmanager/templates/modals/misr.templates.modal/misr.templates.modal';

export type CollectionLookupData = { [key: string]: string[] | number[] };
export type CollectionLookupOnUpdate = {
    $event: Select2EventType,
    idField: string,
    values: Select2ItemType[],
    groupKey?: number, rulesKey?: number, ruleKey?: number, type: CollectionLookupChangeType,
    lookupObject?: CollectionLookupsStructureDataType,
    i?: number | 'fake'
};
export type CollectionLookupOnAddRemove = { type: CollectionLookupChangeType, field: string };
export type CollectionLookupsObjectType = {
    controlType?: 'checkbox' | 'lookups-select2',
    lookupType?: LookupsTypes,
    lookupUrl?: string,
    displayLabel?: string,
    lookupData?: Select2ItemType[],
    lookupField?: string,
    idField: string,
    //values?: CollectionLookupData,
    compareObject?: Select2ConvertObject,
    fetchLookup?: boolean
} & CollectionLookupsStructureDataType;

export type CollectionLookupsReturnType = {
    items: Select2ItemType[],
    structItem?: CollectionLookupsObjectType,
    control: IMFXControlsLookupsSelect2Component,
    values?: CollectionLookupData,
    x: number,
    y: number,
    i: number
};

export type CollectionLookupsReturnListType = { [key: string]: CollectionLookupsReturnType }
export type CollectionLookupsStructureType = { [key: number]: { [key: number]: CollectionLookupsStructureDataType } }
export type CollectionLookupsStructureDataType = { values?: CollectionLookupData/*string[] */ };

@Component({
    selector: 'collection-lookups',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CollectionLookupsComp extends CollectionLookupComp {
    public self: CollectionLookupsComp = this;
    @ViewChildren('controls') public controls: QueryList<IMFXControlsLookupsSelect2Component>;
    @Input('titleColWidth') titleColWidth: string = 'auto';
    @Input('controlColWidth') controlColWidth: string;
    @Input('title') title: string;
    @Input('minLimit') minLimit: number = 1;
    @Input('maxLimit') maxLimit: number = 10;
    @Input('maxLimitGroups') maxLimitGroups: number = 10;
    @Input('groups') group: boolean = false;
    @Output() onUpdateControl: EventEmitter<CollectionLookupOnUpdate> = new EventEmitter<CollectionLookupOnUpdate>();
    @Output() onUpdateStructure: EventEmitter<CollectionLookupOnAddRemove> = new EventEmitter<CollectionLookupOnAddRemove>();
    @Input('structure') private structure: CollectionLookupsStructureType = {};
    private ObjectRef: Object = Object;
    private valuesUpdated: boolean = false;

    constructor(public arrayProvider: ArrayProvider,
                public translate: TranslateService,
                public stringProvider: StringProivder,
                public router: Router,
                public lookupService: LookupService,
                public cdr: ChangeDetectorRef,
                public http: HttpService) {
        super(arrayProvider, translate, stringProvider, router, lookupService, cdr, http);
    }

    @Input('lookupsObjects') private _lookupsObjects: CollectionLookupsObjectType[] = [];

    get lookupsObjects(): CollectionLookupsObjectType[] {
        return this._lookupsObjects;
    }

    @Input('count') set count(c: number | null) {
        if (c === null) {
            return;
        }
        this.setCount(c).subscribe(() => {
            // on ready ...
        });
    }

    // set lookupsObjects(lookups: CollectionLookupsObjectType[]) {
    //     // this.update(lookups);
    //     this._lookupsObjects = lookups;
    // }


    // @TODO redeclare this method for reuse
    update(dirtySelected: MisrTemplatesMisrItems[] = [], groupFieldName: string = 'GROUP_ID', lookups: any[] = []) {
        // this.cdr.detach(); // detach
        // this.structure = {}; // reset
        // const lookupConfig: CollectionLookupsObjectType = this.lookupsObjects.find((lookupObject: CollectionLookupsObjectType) => {
        //     return misrItem[lookupObject.idField] != null
        // });
        let _preStructure: CollectionLookupsStructureType = {};
        $.each(this.lookupsObjects, (columnId: number, lookupConfig: CollectionLookupsObjectType) => {
            $.each(dirtySelected, (rowId: number, misrItem: MisrTemplatesMisrItems) => {

                const values = misrItem[lookupConfig.idField];
                const groupId = misrItem[groupFieldName];

                if (lookupConfig.controlType == 'lookups-select2') {
                    if (!lookupConfig.lookupData) {
                        const dirtyData = lookups[lookupConfig.lookupField];
                        if (!lookupConfig.lookupField || !misrItem) {
                            return true;
                        }
                        lookupConfig.lookupData = this.turnArrayOfObjectToStandart(
                            dirtyData,
                            lookupConfig.compareObject,
                        );
                    }
                } else if (lookupConfig.controlType == 'checkbox') {
                    // still not demand any addition actions
                }

                if (!lookupConfig.values) {
                    lookupConfig.values = {};
                }
                if (!lookupConfig.values[rowId]) {
                    lookupConfig.values[rowId] = (values !== null || true) ? [values] : [];
                }

                _preStructure = this.addItem(groupId, lookupConfig.values, lookupConfig, true, _preStructure, rowId, columnId)

            });
            if (dirtySelected.length == 0) { // for new groups
                if (lookupConfig.controlType == 'lookups-select2') {
                    if (!lookupConfig.lookupData) {
                        const dirtyData = lookups[lookupConfig.lookupField];
                        if (!lookupConfig.lookupField) {
                            return true;
                        }
                        lookupConfig.lookupData = this.turnArrayOfObjectToStandart(
                            dirtyData,
                            lookupConfig.compareObject,
                        );
                    }
                } else if (lookupConfig.controlType == 'checkbox') {
                    // still not demand any addition actions
                }
            }
        });

        this.structure = _preStructure;
        this.cdr.detectChanges();
        // new Promise((r) => {
        //     r();
        // }).then(() => {
        //
        // });
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        // this.controls.changes
        //     .subscribe(() => console.log(this.controls));
    }

    getStructure(): CollectionLookupsStructureType {
        return $.extend(true, {}, this.structure);
    }

    getValues(): CollectionLookupsReturnListType {
        // if (!this.valuesUpdated && this._storedResults) {
        //     return this._storedResults;
        // }

        const results: CollectionLookupsReturnListType = {};
        let x: number = 0; // item
        let y: number = 0; // level
        this.controls.forEach((control: IMFXControlsLookupsSelect2Component, i: number) => {
            if (i > 0) { // skip the first (fake) control
                const x = i % this._lookupsObjects.length - 1;
                let val = null;
                if (control.getSelectedId() != null) {
                    val = control.getSelectedObjects();
                }
                results[i] = {
                    items: val,
                    control: control,
                    structItem: this._lookupsObjects[x],
                    x: x,
                    y: y,
                    i: i
                };
            }
        });
        y = 0;
        x = 0;

        // this._storedResults = results;
        // this.valuesUpdated = false;

        return results;
    }

    _isValid(type): boolean {
        const res: number[] = [];
        if (this.controls && this.controls.length > 0 && type !== 'remove') {
            this.controls.forEach((control: IMFXControlsLookupsSelect2Component, i) => {
                if (control.getSelectedId() == null) {
                    res.push(i);
                    return;
                }
            });
        }
        this.isValid = !res.length;
        return this.isValid;
    }

    // @ts-ignore
    _onUpdateControl($event: Select2EventType, groupKey: number, rulesKey: number, ruleKey: number) {
        // this.cdr.detach();
        // if ?
        // (this.structure[groupKey][rulesKey] as CollectionLookupData).values[ruleKey] = {};
        if ($event.params.data && $event.params.data[0] && $event.params.data[0].id != null) {
            this.valuesUpdated = true;
            (this.structure[groupKey][rulesKey] as CollectionLookupsObjectType).values[ruleKey] = $event.params.data.map((item: Select2ItemType) => {
                return item.id
            });
            (this._lookupsObjects[ruleKey] as CollectionLookupsObjectType).values = (this.structure[groupKey][rulesKey] as CollectionLookupsStructureDataType).values;
        }

        this._lastChanged = {
            $event: $event,
            idField: this._lookupsObjects[ruleKey % this._lookupsObjects.length].idField,
            // idField: this._lookupsObjects[ruleKey].idField,
            values: $event.params.data, // this.structure[groupKey][rulesKey][ruleKey], // $event.params.context.getSelectedObject(),
            lookupObject: this._lookupsObjects[ruleKey % this._lookupsObjects.length],
            // lookupObject: this._lookupsObjects[ruleKey],
            groupKey: groupKey,
            rulesKey: rulesKey,
            ruleKey: ruleKey,
            type: 'change',
        };
        this.onUpdateControl.emit(this._lastChanged);
        // this.cdr.markForCheck();
    }

    public addItem(
        groupId = null,
        values: CollectionLookupData = {},
        lookupConfig: CollectionLookupsObjectType = null,
        silentMode: boolean = false,
        fakeStructure: CollectionLookupsStructureType = null,
        _rowId: number = null, _columnId: number = null): CollectionLookupsStructureType {
        // this.cdr.detach();
        if (groupId == null) {
            groupId = this.getNewGroupId();
        }

        const _preStructure: CollectionLookupsStructureType = fakeStructure ? fakeStructure : this.structure;
        if (!_preStructure[groupId]) {
            _preStructure[groupId] = {};
        }

        const rowId = _rowId != null ? _rowId : Object.keys(_preStructure[groupId]).length + 1;
        if (!_preStructure[groupId][rowId]) {
            _preStructure[groupId][rowId] = {values: {}} as CollectionLookupsStructureDataType;
        }
        const columnId = _columnId != null ? _columnId : Object.keys(_preStructure[groupId][rowId].values).length;

        if (lookupConfig && lookupConfig.values) { // old data
            _preStructure[groupId][rowId].values[columnId] = lookupConfig.values[rowId];
        } else { // new row
            _preStructure[groupId][rowId].values = new Array(this.lookupsObjects.length).fill([]).reduce((obj, item, key) => {
                obj[key] = item;
                return obj
            }, {});
        }

        if (!fakeStructure) {
            this.structure = _preStructure;
            if (!silentMode) {
                this.cdr.detectChanges();
                new Promise((r) => {
                    // this.cdr.detectChanges();
                    r();
                }).then(() => {
                    if (lookupConfig) {
                        this.updateControls(lookupConfig.values, lookupConfig.lookupData);
                    }
                });
            }
            return this.structure;
        } else {
            return _preStructure;
        }
    }

    public removeItem(_groupId: string = null, _ruleId: string = null): void {
        const groupId = parseInt(_groupId);
        const ruleId = parseInt(_ruleId);
        if (groupId == null && ruleId == null) {
            return;
        }

        const fakeStructure = this.structure;
        if (!isNaN(ruleId)) {
            fakeStructure[groupId][ruleId] = null;
            delete fakeStructure[groupId][ruleId];
        } else {
            delete fakeStructure[groupId];
        }

        if (fakeStructure[groupId] && Object.keys(fakeStructure[groupId]).length === 0) {
            delete fakeStructure[groupId];
        }

        this.structure = fakeStructure;
        this._lastChanged = {
            $event: null,
            idField: null,
            values: null,
            lookupObject: null,
            groupKey: groupId,
            rulesKey: ruleId,
            ruleKey: ruleId,
            type: 'remove',
        };
        this.cdr.detectChanges();
        this.onUpdateControl.emit(this._lastChanged);
    }


    public trackByFn(index, item) {
        return index;
        // or if you have no unique identifier:
        // return index;
    }

    public entryValues(val: any) {
        for (let k in val) {
            // this.addGroup(val[k]);
        }
    }

    // private createGroup(values: CollectionLookupData = {}, lookupConfig: CollectionLookupsObjectType): CollectionLookupsStructureDataType {
    //     return {};
    // }

    // public addNewGroup() {
    //     const newGroupId: number = this.addGroup(null);
    //     this.setCount(this._countCollection.length + 1, null, newGroupId).subscribe((type) => {
    //         this.isValid = this._isValid(type);
    //     });
    // }

    // private createItem(lookupConfig: CollectionLookupsObjectType): CollectionLookupsStructureDataType {
    //     // const d: CollectionLookupsStructureDataType = {} as CollectionLookupsStructureDataType;
    //     // new Array(this._lookupsObjects.length).fill(null).forEach((item, index) => {
    //     //     d[Guid.newGuid()] = {
    //     //         values: values
    //     //     };
    //     // });
    //
    //
    //
    //
    //     // return new Array(this.lookupsObjects.length).fill(null).map((item, index) => {
    //     //     return {
    //     //         valueId: value != undefined? value:null,
    //     //     }
    //     // });
    // }

    isMaxReached(): boolean {
        let obj = this.structure || {};
        return Object.keys(obj).length >= this.maxLimitGroups;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.structure = {};
        this._lookupsObjects = [];
    }

    private getNewGroupId(): number {
        return parseInt(Object.keys(this.structure).pop() || '0') + 1
    }

}
