/**
 * Created by Sergey Trizna on 27.09.2017.
 */
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output,
    ViewEncapsulation
} from "@angular/core";
import {IMFXAdvancedGroupComponent} from "./group";
import {
    AdvancedModeTypes,
    AdvancedPointerCriteriaType,
    AdvancedPointerGroupType, AdvancedSearchDataCriteriaReturnType,
    AdvancedSearchSettingsCommonData,
    AdvancedStructureGroupType
} from "../../types";

@Component({
    selector: 'advanced-group-builder',
    templateUrl: 'tpl/builder.html',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})
export class IMFXAdvancedGroupBuilderComponent extends IMFXAdvancedGroupComponent {
    @Input() group: AdvancedStructureGroupType;
    @Input() mode: AdvancedModeTypes;
    @Input() common: AdvancedSearchSettingsCommonData;
    @Output() onRemoveCriteria: EventEmitter<AdvancedPointerCriteriaType> = new EventEmitter<AdvancedPointerCriteriaType>();
    @Output() onRemoveGroup: EventEmitter<AdvancedPointerGroupType> = new EventEmitter<AdvancedPointerGroupType>();
    @Output() onAddCriteria: EventEmitter<AdvancedPointerGroupType> = new EventEmitter<AdvancedPointerGroupType>();
    // constructor(private cdr: ChangeDetectorRef){
    //     super()
    // }
    /**
     * Add criteria to group
     */
    addCriteria() {
        this.onAddCriteria.emit(<AdvancedPointerGroupType> {
            groupId: this.group.id,
            mode: this.mode
        });
    }

    /**
     * Remove criteria from group
     * @param $event
     */
    removeCriteria($event: AdvancedPointerCriteriaType) {
        this.onRemoveCriteria.emit($event);
    }

    /**
     * Remove group
     */
    removeGroup() {
        this.onRemoveGroup.emit(<AdvancedPointerGroupType> {
            groupId: this.group.id,
            mode: this.mode
        });
    }
}
