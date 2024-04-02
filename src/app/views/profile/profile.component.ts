import { Component, ViewEncapsulation } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';

import { Router } from '@angular/router';

@Component({
    moduleId: 'profile',
    selector: 'profile',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent {
    profilePage: string = 'overview';
    constructor(private router: Router,
    private profileService: ProfileService) {
    }

    overview() {
        this.profilePage = 'overview';
    }

    security() {
        this.profilePage = 'security';
    }

    defaultPages() {
      this.profilePage = 'defaultpages';
    }

    onChangeDefaultPage(page) {
      this.profileService.defaultPageChange(page);
    }
}
