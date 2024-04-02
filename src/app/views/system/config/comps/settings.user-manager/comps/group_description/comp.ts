import { Component, Input, ViewEncapsulation } from '@angular/core';
import { UserGroupType } from '../../modals/group.modal/group.modal.component';

@Component({
    selector: 'group_description',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
})

export class SettingsUserManagerGroupDescriptionComponent {
    private data: UserGroupType = {
        CHANNELS: [],
        NAME: '',
        DESCRIPTION: '',
        PRESETS: [],
        RESPONSIBILITIES: [],
        REPORTS_PERMISSIONS: [],
        SCHEDULE_AREAS: [],
        USERS: []
    };
    @Input('data') set setData(data: UserGroupType) {
        this.data = data;
    }
}
