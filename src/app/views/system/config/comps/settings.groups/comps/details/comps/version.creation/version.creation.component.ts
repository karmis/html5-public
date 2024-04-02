/**
 * Created by IvanBanan 20.06.2019.
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
import { IMFXModalComponent } from '../../../../../../../../../modules/imfx-modal/imfx-modal';
import { IMFXModalPromptComponent } from '../../../../../../../../../modules/imfx-modal/comps/prompt/prompt';
import { IMFXModalEvent } from '../../../../../../../../../modules/imfx-modal/types';
import { IMFXModalProvider } from '../../../../../../../../../modules/imfx-modal/proivders/provider';
import { lazyModules } from "../../../../../../../../../app.routes";

@Component({
    selector: 'settings-groups-version-creation',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class SettingsGroupsVersionCreationComponent {
    @Input('versionCreationSettings') private versionCreationSettings = {
        availableVersionNames: []
    };
    private availableVersionNames: any[] = [];
    @Output('changedVersionCreationSettings') private changedVersionCreationSettings: EventEmitter<any> = new EventEmitter<any>();

    constructor(private cdr: ChangeDetectorRef,
                private modalProvider: IMFXModalProvider) {

    }

    ngOnInit() {

    }

    ngOnChanges(simpleChangesObj) {
        if (simpleChangesObj.versionCreationSettings) {
            this.versionCreationSettings = (!$.isEmptyObject(simpleChangesObj.versionCreationSettings.currentValue))
                ? simpleChangesObj.versionCreationSettings.currentValue
                : this.getDefault();
            this.availableVersionNames = this.versionCreationSettings.availableVersionNames;
        }
    }

    ngAfterViewInit() {
        // this.versionCreationSettings = (!$.isEmptyObject(this.versionCreationSettings))
        //     ? this.versionCreationSettings
        //     : this.getDefault();
        //
        // this.availableVersionNames = this.versionCreationSettings.availableVersionNames;
    }

    getDefault() {
        return {
            availableVersionNames: []
        };
    }

    addItems() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.imfx_modal_prompt,
            IMFXModalPromptComponent, {
            size: 'md',
            title: 'settings_group.version_creation.modal_add_name.title',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr =>{
            let modalContent: IMFXModalPromptComponent =cr.instance;
            modalContent.setLabel('settings_group.version_creation.modal_add_name.label');
            modalContent.setPlaceholder('settings_group.version_creation.modal_add_name.placeholder');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    let name = modalContent.getValue();
                    this.availableVersionNames.push(name);
                    this.changeVersionCreationSettings();
                    this.cdr.detectChanges();
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    deleteRow($event,item) {
        const index = this.availableVersionNames.indexOf(item);
        if (index !== -1) {
            this.availableVersionNames.splice(index, 1);
            this.changeVersionCreationSettings();
        }
    }

    changeVersionCreationSettings() {
        this.changedVersionCreationSettings.emit(this.versionCreationSettings);
    }

}
