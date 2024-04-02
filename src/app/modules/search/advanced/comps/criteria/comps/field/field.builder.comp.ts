import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
// import {AdvancedSearch} from 'app/services/viewsearch/advanced.search.service';
import {AdvancedFieldType, AdvancedSearchSettingsCommonData, AdvancedStructureCriteriaType} from "../../../../types";
import {IMFXControlsSelect2Component} from "../../../../../../controls/select2/imfx.select2";
import {SearchAdvancedCriteriaProvider} from "../../providers/provider";

@Component({
    selector: 'advanced-criteria-field-builder',
    templateUrl: 'tpl/builder.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class IMFXAdvancedCriteriaFieldBuilderComponent {
    // new implementation
    @ViewChild('advancedSearchCriteriaField', {static: false}) private fieldsEl: IMFXControlsSelect2Component;
    @Input() common: AdvancedSearchSettingsCommonData;
    @Input() criteria: AdvancedStructureCriteriaType;
    @Output() onSelected: EventEmitter<{
        fieldProp: AdvancedFieldType,
        isManually: boolean
    }> = new EventEmitter<{
        fieldProp: AdvancedFieldType,
        isManually: boolean
    }>();

    constructor(private transfer: SearchAdvancedCriteriaProvider) {
    }

    /**
     * On init component
     */
    ngAfterViewInit() {
        this.fieldsEl.setData(this.common.items, true);
        if(this.criteria.data.field && this.criteria.data.field.Name){
            this.select(this.criteria.data.field.Name, false);
        }

    }

    /**
     * Select field by id
     * @param id
     */
    select(id: string | number, isManually: boolean = true) {
        this.fieldsEl.setSelectedByIds([id]);
        this._select(isManually);
    }

    /**
     * On select field
     */
    onSelect($event) {
        //disabling for same values
        if (!$event || $event.params.isSameAsPrevious) {
            return;
        }
        this._select(true);
    }

    _select(isManually: boolean = true) {
        let fieldProp = this.common.props[this.fieldsEl.getSelected()];
        this.transfer.onSelectField(fieldProp, false);
        this.onSelected.emit({fieldProp: fieldProp, isManually: isManually});
    }
}
