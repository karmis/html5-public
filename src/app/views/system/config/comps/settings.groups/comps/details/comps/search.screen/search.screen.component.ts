/**
 * Created by dvvla on 28.09.2017.
 */

import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {BrandingSearchFormComponent} from '../../../../../../../../branding/components/search/branding.search.form.component';
import { SettingsGroupsDetailsComponent } from '../../settings.groups.details.component';
import { SetSearchComponent } from "../../../../../../../../branding/components/set-search/set-search.component";

@Component({
    selector: 'settings-groups-detail-search-screen',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        //SettingsGroupsService
    ]
})
export class SettingsGroupsDetailsSearchScreenComponent implements OnInit {
    // @Input('context') private context: SettingsGroupsDetailsComponent;
    @Input('startSearchSettings') private startSearchSettings: any;
    @ViewChild('startSearchFormComponent', {static: true}) private _startSearchFormComponent: SetSearchComponent;
    // @Output('startForm') private startForm: EventEmitter<any> = new EventEmitter<any>();
    get startSearchFormComponent(): SetSearchComponent{
        return this._startSearchFormComponent;
    }

    ngOnInit() {
        let self = this;
        // this.context.startSearchSettings.subscribe((res: any) => {
        let res = this.startSearchSettings;
        if (res && res.DATA) {
            let data = JSON.parse(res.DATA);
            self._startSearchFormComponent.setCustomizedParams({
                title: data.Title,
                subtitle: data.Subtitle,
                selectedBackground: data.Background,
                selectedSearchLogo: data.Logo,
                selectedOpacity: data.Opacity
            });
        } else {
            self._startSearchFormComponent.setCustomizedParams({
                title: '',
                subtitle: '',
                selectedBackground: 'EMPTY',
                selectedOpacity: '0.2'
            });
        }
        // self.startForm.emit(self);
        // });
    }


}
