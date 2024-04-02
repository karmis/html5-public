/**
 * Created by Sergey Trizna on 27.09.2017.
 */
import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";
import {IMFXAdvancedGroupComponent} from "./group";
import {AdvancedModeTypes, AdvancedSearchSettingsCommonData, AdvancedStructureGroupType} from "../../types";

@Component({
    selector: 'advanced-group-example',
    templateUrl: 'tpl/example.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})
export class IMFXAdvancedGroupExampleComponent extends IMFXAdvancedGroupComponent {
    @Input() group: AdvancedStructureGroupType;
    @Input() mode: AdvancedModeTypes;
    @Input() common: AdvancedSearchSettingsCommonData;
}