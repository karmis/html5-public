/**
 * Created by IvanBanan 23.03.2021.
 */

import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    Input,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';
import { RaiseWorkflowSettingsType } from './types';

@Component({
    selector: 'settings-groups-raise-workflow',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class SettingsGroupsRaiseWorkflowComponent {
    @Input('raiseWorkflowSettings') private raiseWorkflowSettings: RaiseWorkflowSettingsType = this.getDefault();

    @Output('changedRaiseWorkflowSettings') private changedRaiseWorkflowSettings: EventEmitter<any> = new EventEmitter<any>();

    constructor(private cdr: ChangeDetectorRef) {

    }

    ngOnInit() {

    }

    ngOnChanges(simpleChangesObj) {
        if (simpleChangesObj.raiseWorkflowSettings) {
            this.raiseWorkflowSettings = (!$.isEmptyObject(simpleChangesObj.raiseWorkflowSettings.currentValue))
                ? simpleChangesObj.raiseWorkflowSettings.currentValue
                : this.getDefault();
        }
    }

    ngAfterViewInit() {
        // this.raiseWorkflowSettings = (!$.isEmptyObject(this.raiseWorkflowSettings))
        //     ? this.raiseWorkflowSettings
        //     : this.getDefault();
        //
        // this.availableVersionNames = this.raiseWorkflowSettings.availableVersionNames;
    }

    getDefault() {
        return {
            onMedia: true,
            onVersions: true,
            onCarriers: true,
            fromBasket: true,
        };
    }

    changeRaiseWorkflowSettings($event) {
        this.changedRaiseWorkflowSettings.emit(this.raiseWorkflowSettings);
    }

}
