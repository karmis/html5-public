/**
 * Created by Sergey Trizna on 16.02.2017.
 */
import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {PermissionService} from '../permission/permission.service';
import {ArrayProvider} from "../../providers/common/array.provider";
import {appRouter} from '../../constants/appRouter';
import {LoginService} from "../login/login.service";
import {Observable} from "rxjs";

@Injectable()
export class SecurityService {
    private userPermissions;
    private mode;

    constructor(private arrayProvider: ArrayProvider,
                private router: Router) {
    }

    public isAccess(path: string, ls: LoginService): Observable<boolean> | Promise<boolean> | boolean {
        // console.log(path);
        // Is logged
        let isLoggedIn = ls.isLoggedIn();
        // If has permissions to path - allow redirect else -- go to 403
        if (isLoggedIn) {
            if (this.hasPermissionByPath(path)) {
                return true;
            } else {
                console.warn(path, ' access denied');
                this.router.navigate([appRouter.no_access]).then(() => {});
            }
        } else {
            // /*debugger*/;
            // Store target path for redirect on it after login
            ls.setTargetPath(location.hash.substr(2));
            // return false
        }

        return false;
    }

    /**
     * Return list of permissions
     * @returns {any|Array}
     */
    public getPermissions(): {
        paths: Array<string>,
        names: Array<string>,
    } | any {
        if (!this.userPermissions) {
            console.error('Permissions not available');
            return this.router.navigate([appRouter.logout]);

        }

        return this.userPermissions;
    }

    /**
     * Store permissions
     * @param permissions
     * @param mode
     */
    public setPermissions(permissions: Array<number> = [], mode: string = null): void {
        this.mode = mode;
        this.userPermissions = this.buildPermissions(permissions);
        // this.storage.store(this.storagePrefix, this.userPermissions);
    }

    public getCurrentMode() {
        return this.mode;
    }

    /**
     * Return has or no permissions by name
     * @param name - name of component or module
     */
    public hasPermissionByName(name: string): boolean {
        let userPermissions = this.getPermissions();

        // for example: if name == 'media-basket' then true was returned for media and for media-basket
        // TODO refact if it incorrect
        return userPermissions.names ? userPermissions.names.indexOf(name) > -1 : false;
    }

    /**
     * Return has or no permissions by name
     * @param path - path name
     */
    public hasPermissionByPath(path: string): boolean {
        let userPermissions = this.getPermissions();

        // for example: if name == 'media-basket' then true was returned for media and for media-basket
        // TODO refact if it incorrect
        if (userPermissions && userPermissions.paths && userPermissions.paths.length > 0) {
            return userPermissions.paths.indexOf(path) > -1;
        }

        return false;
    }

    /**
     * Build list of permissions use array of permissions number
     * @param permissions
     * @returns {{paths: Array, names: Array}}
     */
    private buildPermissions(permissions: Array<number | string> = []): { paths: Array<string>, names?: Array<string> } {
        if (this.mode != null && this.mode.length > 0) {
            permissions = [this.mode];
            let gPerms = PermissionService.getPermissionsModesMap();
            let uPerms = {
                paths: []
            };

            permissions.forEach((perm) => {
                if (gPerms[perm]) {
                    uPerms.paths = this.arrayProvider.merge(uPerms.paths, gPerms[perm].paths, {unique: true});
                }
            });

            return uPerms;
        }
        else {
            permissions.push(0); // common settings
            let gPerms = PermissionService.getPermissionsMap();
            let uPerms = {
                paths: [],
                names: [],
            };

            permissions.forEach((perm) => {
                this.setPrentPermissions(perm, gPerms, uPerms);
            });

            return uPerms;
        }
    }

    private setPrentPermissions(perm, gPerms, uPerms) {
        if (gPerms[perm]) {
            uPerms.paths = this.arrayProvider.merge(uPerms.paths, gPerms[perm].paths, {unique: true});
            uPerms.names = this.arrayProvider.merge(uPerms.names, gPerms[perm].names, {unique: true});
            if (gPerms[perm] && gPerms[perm].parent && gPerms[perm].parent.length > 0) {
                this.setPrentPermissions(gPerms[perm].parent, gPerms, uPerms);
            }
        }
    }
}

export const systemModes = {
    ConfigOnly: "ConfigOnly",
};
