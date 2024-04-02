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
    ChangeDetectionStrategy, OnChanges, AfterViewInit, SimpleChanges
} from '@angular/core';
import { IMFXModalComponent } from '../../../../../../../../../modules/imfx-modal/imfx-modal';
import { IMFXModalPromptComponent } from '../../../../../../../../../modules/imfx-modal/comps/prompt/prompt';
import { IMFXModalEvent } from '../../../../../../../../../modules/imfx-modal/types';
import { IMFXModalProvider } from '../../../../../../../../../modules/imfx-modal/proivders/provider';
import { lazyModules } from "../../../../../../../../../app.routes";
import { VideoBrowser } from "../../../../../../../../../services/system.config/search.types";

@Component({
    selector: 'settings-groups-video-browser-app',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class SettingsGroupsVideoBrowserAppComponent implements OnInit, OnChanges, AfterViewInit{
    @Input('videoBrowserAppSettings') private videoBrowserAppSettings: VideoBrowser;
    @Output('changedVideoBrowserAppSettings') private changedVideoBrowserAppSettings: EventEmitter<any> = new EventEmitter<any>();

    videoBrowserLabels: VideoBrowser = {
        messageAllScreens: '',
        messageClosedCaptionsPanel: '',
        messageMediaBasket: '',
        systemName: '',
        helpUrl: ''
    }

    constructor(
        private cdr: ChangeDetectorRef,
        private modalProvider: IMFXModalProvider
    ) {

    }

    ngOnInit() {

    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges.videoBrowserAppSettings && simpleChanges.videoBrowserAppSettings.currentValue) {
            this.setValues(simpleChanges.videoBrowserAppSettings.currentValue);
        }
    }

    ngAfterViewInit() {
        // this.versionCreationSettings = (!$.isEmptyObject(this.versionCreationSettings))
        //     ? this.versionCreationSettings
        //     : this.getDefault();
        //
        // this.availableVersionNames = this.versionCreationSettings.availableVersionNames;
    }

    setValues(val: VideoBrowser) {
        this.videoBrowserLabels = JSON.parse(JSON.stringify(val));
    }

    onChangeVideoBrowserAppSettings() {
        this.changedVideoBrowserAppSettings.emit(this.videoBrowserLabels);
    }

}
