import { Injectable } from '@angular/core';
import { SessionStorageService } from "ngx-webstorage";
import { HttpService } from '../../../../../../services/http/http.service';
import { LookupService } from '../../../../../../services/lookup/lookup.service';
import { UserGroupType } from '../modals/group.modal/group.modal.component';
import { map } from 'rxjs/operators';
import {Observable, Subscription} from "rxjs";


@Injectable()
export class UserManagerService {
    private prefixStorageUserManager = 'settings.user-manager';

    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService,
                private lookupService: LookupService) {

    }

    resetPassword(userId) {
        return new Observable((observer: any) => {
                this.httpService
                    .put(
                        '/api/v3/config/user/' + userId + '/reset-password',
                        "",
                        {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    reset2fa(userId) {
        return new Observable((observer: any) => {
                this.httpService
                    .put(
                        '/api/v3/config/user/' + userId + '/reset-2fa',
                        "",
                        {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    changePassword(data): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .put(
                        '/api/v3/config/user/password',
                        JSON.stringify(data),
                        {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    rebuildGroupView(userIds) {
        return this.httpService
            .post(
                '/api/v3/config/user-group/rebuild-view',
                JSON.stringify(userIds)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    rebuildUserView(userIds) {

        return this.httpService
            .post(
                '/api/v3/config/user/rebuild-view',
                JSON.stringify(userIds),
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    saveLocations(data) {

        return this.httpService
            .post(
                '/api/v3/config/location-views',
                JSON.stringify(data)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getLocationsConfigsDefaults() {
        return this.httpService
            .get(
                '/api/v3/config/location-views'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getNotificationsDefaults() {
        return this.httpService
            .get(
                '/api/v3/config/notifications'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));

    }

    editSubscription(data) {

        return this.httpService
            .post(
                '/api/v3/config/notification/subscriber',
                JSON.stringify(data)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }


    editNotification(data) {

        return this.httpService
            .post(
                '/api/v3/config/notification',
                JSON.stringify(data)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getMergedUserGroupsData(groupIdArray: any[]) {

        return this.httpService
            .put(
                '/api/v3/config/user-group/merged',
                JSON.stringify(groupIdArray)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getUsers(withDisabled = false) {
        return this.httpService
            .get(
                '/api/v3/config/users' + (withDisabled ? "?showDisabled=true" : "")
            )
            .pipe(map((res: any) => {
                return res.body;
            }));

    }

    getUserById(id) {
        return this.httpService
            .get(
                '/api/v3/config/user/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    editUser(item, isNew) {

        if (isNew) {
            return this.httpService
                .post(
                    '/api/v3/config/user',
                    JSON.stringify(item)
                )
                .pipe(map((res: any) => {
                    return res.body;
                }));
        } else {
            return this.httpService
                .put(
                    '/api/v3/config/user/' + item['ID'],
                    JSON.stringify(item)
                )
                .pipe(map((res: any) => {
                    return res.body;
                }));
        }

    }

    changeDba(userId, mode) {

        return this.httpService
            .put(
                '/api/v3/config/user/' + userId + '/dba/' + mode,
                '{}'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    changePastru(userId, flags) {

        return this.httpService
            .put(
                '/api/v3/config/user/' + userId + '/passthru/' + flags,
                '{}'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    changeLock(userId, isLocking) {

        return this.httpService
            .put(
                '/api/v3/config/user/' + userId + '/lock/' + isLocking,
                '{}'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    changeUserItem(id, item) {
        return this.httpService
            .post(
                '/api/v3/user/' + id,
                item
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getGroups() {
        return this.httpService
            .get(
                '/api/v3/config/user-groups?filter='
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getGroupById(id) {
        return this.httpService
            .get(
                '/api/v3/config/user-group/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    insertGroup(item: UserGroupType) {

        return this.httpService
            .post(
                '/api/v3/config/user-group/',
                JSON.stringify(item)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    updateGroupById(id: number, item: UserGroupType | any) {

        return this.httpService
            .put(
                '/api/v3/config/user-group/' + id,
                JSON.stringify(item)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    changeGroupItem(id, item) {
        return this.httpService
            .post(
                '/api/v3/user-group/' + id,
                item
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    clearSettingsConfigTablesById(id: number) {
        this.sessionStorage.clear(this.prefixStorageUserManager + '.' + id);
    }

    saveSessionStorage(id, resp) {
        let storageKey = this.prefixStorageUserManager + '.' + id;
        this.sessionStorage.store(storageKey, resp);
    }

    getChannels() {
        return this.httpService
            .get(
                '/api/v3/config/user-groups/channels'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getPresets() {
        return this.httpService
            .get(
                '/api/lookup/presets'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getResponsibilities() {
        return this.httpService
            .get(
                '/api/v3/config/user-groups/resps'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getReportsPermissions() {
        return this.httpService
            .get(
                '/api/v3/config/user-groups/reports'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    deleteGroup(id: number) {
        return this.httpService
            .delete(
                '/api/v3/config/user-group/' + id,
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getAllLocations() {
        return this.httpService
            .get(
                '/api/lookup/locations/all',
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
    deleteUser(userId) {
        return new Observable((observer: any) => {
                this.httpService
                    .delete(
                        '/api/v3/config/user/' + userId
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }
}
