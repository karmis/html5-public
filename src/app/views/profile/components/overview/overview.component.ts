import {
    Component,
    ViewEncapsulation,

} from '@angular/core';
import { ProfileService } from '../../../../services/profile/profile.service';
import { LoginService } from '../../../../services/login/login.service';
import { LoginProvider } from '../../../login/providers/login.provider';
import { TranslateService } from "@ngx-translate/core";
import * as moment from 'moment'

@Component({
    selector: 'profile-overview',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ProfileService
    ]
})
export class ProfileOverviewComponent {
    data: any = {};
    constructor(private profileService: ProfileService,
                protected translate: TranslateService,
                private loginProvider: LoginProvider,
                private loginService: LoginService) {
    }

    /**
     * On init component
     */
    ngOnInit() {
        // Loading data
        let authData = this.loginService.getAuthData();
        if (Object.keys(authData).length === 0) {
            setTimeout(() => {
                this.loginProvider.logout();
            });
        }

        // Fetch info
        this.profileService.getUserProfile()
            .subscribe(
                (resp: any) => {
                    this.data = Object.assign({}, this.data, resp, authData);
                },
                (error: any) => {
                    console.error('Failed from /api/userprofile', error);
                }
            );
    }

    getDate() {
        // const format  = this.translate.instant('common.date_format')
        const format  = 'DD/MM/YYYY'
        return moment(this.data.ExpiryDate).format(format);
    }
}

