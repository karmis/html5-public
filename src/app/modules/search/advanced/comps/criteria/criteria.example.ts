/**
 * Created by Sergey Trizna on 27.09.2017.
 */
import {ChangeDetectionStrategy, Component, Input, ViewChild, ViewEncapsulation} from "@angular/core";
import {IMFXAdvancedCriteriaComponent} from "./criteria";
import {
    AdvancedModeTypes,
    AdvancedPointerCriteriaType,
    AdvancedSearchDataForControlType,
    AdvancedSearchSettingsCommonData,
    AdvancedStructureCriteriaType
} from "../../types";
import {IMFXAdvancedCriteriaControlsComponent} from "./comps/controls/controls.component";
import {SearchAdvancedCriteriaProvider} from "./providers/provider";

@Component({
    selector: 'advanced-criteria-example',
    templateUrl: 'tpl/example.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SearchAdvancedCriteriaProvider,
    ]

})
export class IMFXAdvancedCriteriaExampleComponent extends IMFXAdvancedCriteriaComponent {
    @ViewChild('advancedCriteriaControlModule', {static: false}) controlRef: IMFXAdvancedCriteriaControlsComponent; // control
    @Input() criteria: AdvancedStructureCriteriaType; // criteria data
    @Input() mode: AdvancedModeTypes;
    @Input() common: AdvancedSearchSettingsCommonData;
    @Input() groupId: number;

    constructor(protected transfer: SearchAdvancedCriteriaProvider) {
        super(transfer);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            // set pointer
            let searchEditorType = this.criteria.data.field.SearchEditorType;
            let fieldProp = this.common.props[this.criteria.data.field.Name];
            let pointer: AdvancedPointerCriteriaType = <AdvancedPointerCriteriaType>{
                groupId: this.groupId,
                criteriaId: this.criteria.id,
                mode: this.mode
            };
            this.transfer.setPointer(pointer);
            this.transfer.onSelectField(fieldProp, true);
            this.transfer.onSelectOperator(this.criteria.data.operator, true);

            // set controls
            this.controlRef.setControl(searchEditorType, <AdvancedSearchDataForControlType> {
                field: fieldProp,
                mode: this.mode,
                criteria: this.criteria
            });
        })

    }
}
