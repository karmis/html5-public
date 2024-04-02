import {Component} from '@angular/core';
import {LoginProvider} from '../login/providers/login.provider';
@Component({
    selector: 'logout',
    template: `
    <div></div>
  `
})
export class LogoutComponent {
    constructor(private loginProvider: LoginProvider) {
        setTimeout(()=>{
            loginProvider.logout();
        })
    }
}
