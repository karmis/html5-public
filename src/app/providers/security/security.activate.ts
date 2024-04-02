import {ActivatedRouteSnapshot, CanActivate} from "@angular/router";
import { SecurityService } from "../../services/security/security.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoginService } from "../../services/login/login.service";

@Injectable()
export class SecurityActivateProvider implements CanActivate {
    constructor(private securityService: SecurityService, private loginService: LoginService,) {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.securityService.isAccess(route.routeConfig.path, this.loginService);
    }
}
