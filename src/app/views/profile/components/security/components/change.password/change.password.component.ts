import {
    Component,
    ViewEncapsulation,

} from '@angular/core';
import {NotificationService} from "../../../../../../modules/notification/services/notification.service";
import {ProfileService} from "../../../../../../services/profile/profile.service";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'profile-security-change-password',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class ProfileSecurityChangePasswordComponent {

    private oldPassword: string = null;
    private newPassword: string = null;
    private newPasswordValidate: string = null;

    constructor(protected profileService: ProfileService,
        protected notificationService: NotificationService) {

    }

    savePassword() {
        if(this.oldPassword == null || this.newPassword == null || this.newPasswordValidate == null) {
            this.notificationService.notifyShow(2, "All fields required!");
        }
        else if(this.oldPassword != this.newPassword && this.newPassword == this.newPasswordValidate) {
            this.profileService.changePassword({ OldPassword :this.oldPassword, NewPassword:this.newPassword }).subscribe((res: any) =>{
                this.notificationService.notifyShow(1, "Password changed!");
            },
     (err: HttpErrorResponse)=>{
                this.notificationService.notifyShow(2, "Error! " + err.error.Message);
            });
        }
        // else if(this.oldPassword == this.newPassword) {
        //     alert("Same as old");
        // }
        else if(this.newPassword != this.newPasswordValidate) {
            this.notificationService.notifyShow(2, "Passwords not match!");
        }
    }
}

