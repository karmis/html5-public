import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";
import {AdvancedStructureCriteriaType} from "../../../../types";

@Component({
    selector: 'advanced-criteria-field-example',
    templateUrl: 'tpl/example.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class IMFXAdvancedCriteriaFieldExampleComponent {
    // new implementation
    @Input() criteria: AdvancedStructureCriteriaType;
}
