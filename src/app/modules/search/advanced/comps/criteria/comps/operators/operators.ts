import {ChangeDetectionStrategy, Component, EventEmitter, Output, ViewChild, ViewEncapsulation} from "@angular/core";
import {Select2ItemType, Select2ListTypes} from "../../../../../../controls/select2/types";
import {IMFXControlsSelect2Component} from "../../../../../../controls/select2/imfx.select2";
import {SearchAdvancedCriteriaProvider} from "../../providers/provider";

@Component({
    selector: 'advanced-criteria-operators',
    templateUrl: 'tpl/index.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaOperatorsComponent {
    @ViewChild('advancedCriteriaOperatorsSelect2Control', {static: false}) compRef: IMFXControlsSelect2Component;
    @Output() onSelected: EventEmitter<Select2ItemType> = new EventEmitter<Select2ItemType>();
    private operators: Select2ListTypes = [];

    constructor(private transfer: SearchAdvancedCriteriaProvider) {}

    /**
     * Set operators for control
     * @param operators
     * @param selectedId
     */
    setOperators(operators: Select2ListTypes, selectedId: number|string = 0, disabledOperators = []) {
        if(this.transfer.model.DBField == 'SCHEMAID') {
            operators = operators.filter(function(operator){return operator.text !== '!='});
        }
        if (disabledOperators && disabledOperators.length > 0) {
            if (disabledOperators.find(el => el === this.transfer.model.DBField) !== undefined) {
                operators = operators.filter(function(operator){return operator.text !== '!='});
            }
        }
        this.operators = operators;
        this.compRef.setData(this.operators, true);
        this.setSelectedOperator(selectedId);
    }

    /**
     * Set selected operators by id
     * @param id
     */
    setSelectedOperator(id: number | string) {
        this.compRef.setSelectedByIds([id]);
        let operator: Select2ItemType = this.operators[this.compRef.getSelected()];
        this.transfer.onSelectOperator(operator);
        this.onSelected.emit(operator);
    }

    /**
     * On select operator
     */
    onSelect() {
        let operator: Select2ItemType = this.operators[this.compRef.getSelected()];
        this.transfer.onSelectOperator(operator);
        this.onSelected.emit(operator);
    }
}
