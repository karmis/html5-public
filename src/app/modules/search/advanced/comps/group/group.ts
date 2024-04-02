/**
 * Created by initr on 28.11.2016.
 */
import {
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import {
    AdvancedModeTypes, AdvancedPointerCriteriaType, AdvancedSearchDataCriteriaReturnType,
    AdvancedSearchSettingsCommonData,
    AdvancedStructureGroupType
} from "../../types";
export class IMFXAdvancedGroupComponent {
    @Output() onUpdateCriteria: EventEmitter<AdvancedSearchDataCriteriaReturnType> = new EventEmitter<AdvancedSearchDataCriteriaReturnType>();
    /**
     * On change criteria
     */
    updateCriteria($event: AdvancedSearchDataCriteriaReturnType) {
        this.onUpdateCriteria.emit($event);
    }
}
