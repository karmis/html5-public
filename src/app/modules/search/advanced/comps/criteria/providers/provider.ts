/**
 * Created by Sergey Trizna on 28.09.2017.
 */
import { EventEmitter, Injectable } from "@angular/core";
import {
    AdvancedCriteriaType,
    AdvancedFieldType,
    AdvancedPointerCriteriaType,
    AdvancedSearchDataCriteriaReturnType,
    AdvancedSearchDataFromControlType
} from "../../../types";
import { Select2ItemType } from "../../../../../controls/select2/types";

@Injectable()
export class SearchAdvancedCriteriaProvider {
    public data: AdvancedSearchDataFromControlType;
    onUpdate: EventEmitter<AdvancedSearchDataCriteriaReturnType> = new EventEmitter<AdvancedSearchDataCriteriaReturnType>();
    onSelectedOperator: EventEmitter<void> = new EventEmitter<void>();
    private pointer: AdvancedPointerCriteriaType;
    public model: AdvancedCriteriaType = {
        "Field": "",
        "DBField": "",
        "Operation": "",
        "Value": "",
        "GroupId": "",
        // "LookupValue": "",
        // "Parameter": ""
    };

    constructor() {
    }

    getPointer(): AdvancedPointerCriteriaType {
        return this.pointer;
    }

    setPointer(pointer: AdvancedPointerCriteriaType) {
        this.pointer = pointer;
        this.model.GroupId = pointer.groupId;
    }

    /**
     * On select field
     */
    onSelectField(field: AdvancedFieldType, silent: boolean = false) {
        this.model.DBField = field.Name;
        this.model.Field = field.FriendlyName;
        this.model.Value = undefined;
        if (!silent) {
            this.updated();
        }

    }

    /**
     * On select operator
     */
    onSelectOperator(operator: Select2ItemType, silent: boolean = false) {
        this.model.Operation = operator.text;
        if (!silent) {
            this.updated();
        }
        this.onSelectedOperator.emit();
    }

    /**
     * On select value
     */
    onSelectValue(value: AdvancedSearchDataFromControlType) {
        this.model.Value = value.value;
        this.data = value;
        this.updated();
    }

    public clearData() {
        this.data = undefined;
    }

    /**
     * On update criteria
     */
    private updated() {
        this.onUpdate.emit(<AdvancedSearchDataCriteriaReturnType>{
            data: this.data,
            model: this.model,
            pointer: this.getPointer()
        });
        // new Promise((resolve, reject) => {
        //     resolve();
        // }).then(
        //     () => {
        //         this.onUpdate.emit(<AdvancedSearchDataCriteriaReturnType>{
        //             data: this.data,
        //             model: this.model,
        //             pointer: this.getPointer()
        //         });
        //     }
        // );

    }
}
