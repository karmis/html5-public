/**
 * Created by initr on 18.10.2016.
 */
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CanLoad, Route} from '@angular/router';
import {SecurityService} from '../../services/security/security.service';
import {LoginService} from "../../services/login/login.service";

@Injectable()
export class SecurityLoadProvider implements CanLoad {
    constructor(private securityService: SecurityService, private loginService: LoginService) {
    }

    /**
     * @param route
     * @returns {boolean|Promise<boolean>}
     */
    canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
        return this.securityService.isAccess(route.path, this.loginService);
    }
}
