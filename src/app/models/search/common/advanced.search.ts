/**
 * Created by Sergey Trizna on 12.03.2017.
 */
import { Injectable } from '@angular/core';
import { SearchInterfaceModel } from './search.interface';
import {
    AdvancedCriteriaRestoreType,
    AdvancedCriteriaType, ConsumerAdvancedCriteriaType
} from '../../../modules/search/advanced/types';
import { SearchModel } from './search';
import { ConsumerSearchModel } from './consumer.search';

@Injectable()
/**
 * Advanced search
 */
export class AdvancedSearchModel implements SearchInterfaceModel {
    /**
     * Field of db
     */
    public _dbField: string;
    /**
     * Value for search
     */
    public _value: any;
    /**
     * Reference to search model
     */
    private _searchModel: SearchModel | ConsumerSearchModel;
    /**
     * Friendly name of db field
     */
    private _field: string;
    /**
     * Comparison operator
     */
    private _operation: string;
    /**
     * Group id for determination search params
     */
    private _groupId: string | number;
    private dirtyValue: any;
    /**
     * Value for recent search
     */
    private _humanValue: any;

    public set searchModel(sm: ConsumerSearchModel|SearchModel){
        this._searchModel = sm;
    }

    constructor(crits: AdvancedCriteriaType = {
        Operation: '=',
        GroupId: 0
    }) {
        this.setDBField(crits.DBField);
        this.setOperation(crits.Operation);
        this.setValue(crits.Value);
        if (crits.Field != undefined) {
            this.setField(crits.Field);
        }

        return this;
    }

    public getSearchModel() {
        return this._searchModel;
    }

    // /**
    //  * All details
    //  */
    // private _detail: any;

    getDBField(): string {
        return this._dbField;
    }

    setDBField(value: any) {
        this._dbField = value;
    }

    getField(): string {
        return this._field;
    }

    setField(value: string) {
        this._field = value;
    }

    getOperation(): string {
        return this._operation;
    }

    setOperation(value: string) {
        this._operation = value;
    }

    getGroupId(): string | number {
        return this._groupId || 0;
    }

    setGroupId(value: string | number) {
        this._groupId = value;
    }

    getValue(): any {
        return this._value;
    }

    setValue(value: any) {
        this._value = value;
    }

    getHumanValue(): any {
        return this._humanValue;
    }

    setHumanValue(_humanValue: any) {
        this._humanValue = _humanValue;
    }

    getValueAsString(separator: string = '|') {
        return this.getValue() instanceof Array ? this.getValue().join(separator) : this.getValue();
    }

    fillByJSON(json: AdvancedCriteriaType | ConsumerAdvancedCriteriaType): AdvancedSearchModel {
        let m = new AdvancedSearchModel();
        m.setValue(json.Value||(json as any)._value);
        m.setDBField((json as any)._dbField  || (json as any)._field || (json as AdvancedCriteriaType).DBField || (json as ConsumerAdvancedCriteriaType).FieldId);
        m.setField(json.Field || (json as any)._field);
        m.setOperation(json.Operation || (json as any)._operation);
        m.setGroupId(json.GroupId || (json as any)._groupId);
        if((json as any)._humanValue) {
            m.setHumanValue((json as any)._humanValue);
        }

        if((json as any).dirtyValue) {
            m.setDirtyValue((json as any).dirtyValue);
        }

        return m;
    }

    /**
     * @inheritDoc
     * The date.toJSON() is an inbuilt function in JavaScript which is used to convert the given date object's contents into a string.
     */
    _toJSON(): any {
        return {
            DBField: this.getDBField(),
            Field: this.getField(),
            // HumanValue: this.getHumanValue(),
            Operation: this.getOperation(),
            GroupId: this.getGroupId(),
            Value: this.getValueAsString()
        };
    }

    toSimpleRequest(): any {
        return {
            FieldId: this.getDBField(),
            Operation: this.getOperation(),
            Value: this.getValueAsString()
        };
    }

    toRestore(): AdvancedCriteriaRestoreType {
        let m = this._toJSON();
        // m._fullModel = this;
        m.dirtyValue = this.dirtyValue;

        return m;
    }

    /**
     * @inheritDoc
     */
    fillModel(data): void {
        this.setDBField(data._dbField);
        this.setField(data._field);
        this.setOperation(data._operation);
        this.setGroupId(data._groupId);
        this.setValue(data._value);
        this.setHumanValue(data._humanValue);
        this.setDirtyValue(data.dirtyValue);
    }

    /**
     * @inheritDoc
     */
    isValid(): boolean {
        return true;
    }

    setDirtyValue(dirtyValue: any) {
        this.dirtyValue = dirtyValue;
    }

    getDirtyValue(): any {
        return this.dirtyValue;
    }
}
