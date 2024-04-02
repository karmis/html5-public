import { Injectable } from "@angular/core";
import { LIPageMode, LITypeImages, LITypeImagesServer, LIVisualAsset, LIVisualAssetGroup } from "../types";
import { BehaviorSubject, forkJoin, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { HttpService } from "../../../../../../../../services/http/http.service";
import { HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "ngx-webstorage";
import { ConfigService } from "../../../../../../../../services/config/config.service";

@Injectable({
    providedIn: "root"
})
export class LoadingIconsService {
    pageModeChanged = new BehaviorSubject<LIPageMode>("list");
    isLoadingChanged = new BehaviorSubject<boolean>(true);
    loadingIconsChanged = new Subject();
    groupSelected: { ID: string, NAME: string };
    headers = new HttpHeaders({'Content-Type': 'application/json'});
    assetsGroupIdProfile = null;
    groupDeleted = new Subject<number>();


    constructor(private httpService: HttpService,
                private localStorage: LocalStorageService) {
    }

    selectGroup(group) {
        this.groupSelected = group;
    }

    setAssetsGroupIdProfile(id) {
        this.assetsGroupIdProfile = id;
    }

    saveGroup(payload: { files: LITypeImages, name: string }) {
        // save group
        const payloadSaveGroup = {
            // ID:
            NAME: payload.name
        };
        let id = null;
        return new Observable((obs) => {
            this.httpService
                .post(
                    '/api/v3/visual-asset-group',
                    JSON.stringify(payloadSaveGroup),
                    {headers: this.headers}
                )
                .pipe(map((res: any) => {
                    const saveImageObs = [];
                    id = res.body;
                    for (const number in payload.files) {
                        payload.files[number].GROUP_ID = id;
                        saveImageObs.push(
                            this.httpService
                                .post(
                                    `/api/v3/visual-asset`,
                                    JSON.stringify(payload.files[number]),
                                    {headers: this.headers}
                                ));

                    }
                    if (saveImageObs.length > 0) {
                        forkJoin(saveImageObs)
                            .pipe(
                                map((res) => {
                                    res.forEach((httpRes: any, i) => {
                                        payload.files[i].ID = httpRes.body;
                                    });
                                })
                            )
                            .subscribe(() => {
                                obs.next(id);
                            }, error => {
                                obs.error(error);
                            }, () => {
                                obs.complete();
                            });
                    }

                    return res.body;
                }))
                .subscribe(() => {

                }, error => {
                    obs.error(error);
                });

        });

    }

    editGroup(payload: { files: LITypeImages, name: string }) {
        // save group
        const payloadSaveGroup = {
            ID: this.groupSelected.ID,
            NAME: payload.name
        };

        return new Observable((obs) => {
            const reqObs = [
                this.httpService
                    .put(
                        '/api/v3/visual-asset-group',
                        JSON.stringify(payloadSaveGroup),
                        {headers: this.headers}
                    )
            ];

            for (const number in payload.files) {
                if (!payload.files[number].GROUP_ID) {
                    payload.files[number].GROUP_ID = this.groupSelected.ID;
                    reqObs.push(
                        this.httpService
                            .post(
                                `/api/v3/visual-asset`,
                                JSON.stringify(payload.files[number]),
                                {headers: this.headers}
                            )
                    );
                    continue;
                }
                reqObs.push(
                    this.httpService
                        .put(
                            `/api/v3/visual-asset`,
                            JSON.stringify(payload.files[number]),
                            {headers: this.headers}
                        )
                );
            }


            forkJoin(reqObs).subscribe(() => {
                    obs.next();
                },
                error => {
                    obs.error(error);
                },
                () => {
                    obs.complete();
                });

        });


    }

    getGroup(groupId?: number): Observable<LIVisualAsset[]> {
        const id = groupId ? groupId : this.groupSelected.ID;
        return this.httpService
            .get(
                `/api/v3/visual-asset/group/${id}`,
                {headers: this.headers}
            ).pipe(map((res: any) => {
                return res.body;
            }));

    }

    getVisualAssetGroup(): Observable<LIVisualAssetGroup[]> {
        return this.httpService
            .get(
                '/api/v3/visual-asset-group',
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    deleteVisualAssetGroup(id) {
        return this.httpService
            .delete(
                `/api/v3/visual-asset-group/${id}`,
            )
            .pipe(map((res: any) => {
                this.groupDeleted.next(id);
                return res.body;
            }));
    }

    //     0: 'small logo (light theme) ',
    //     1: 'small logo (dark theme)  ',
    //     2: 'search logo (light theme)',
    //     3: 'search logo (dark theme) ',
    // : Observable<{ smallLogo: string, bigLogo: string }>
    getImage(theme: 'default' | 'dark', type: 'profile' | 'group'): Observable<{ smallLogo, bigLogo }> {
        const time = new Date().getTime();
        let req = [];
        return new Observable(obs => {
            let groupId = null;
            let obg = {smallLogo: null, bigLogo: null};

            if (type === 'profile') {
                if (this.assetsGroupIdProfile) {
                    groupId = this.assetsGroupIdProfile;
                } else {
                    obs.next(obg);
                    obs.complete();
                }
            } else {
                if (this.groupSelected && this.groupSelected.ID) {
                    groupId = this.groupSelected.ID;
                } else {
                    // console.error('groupId not found');
                    obs.next(obg);
                    obs.complete();
                }
            }
            const url = ConfigService.getAppApiUrl();
            if (theme === 'default') {
                obg = {
                    smallLogo: `${url}/api/v3/visual-asset/group/${groupId}/0/image`,
                    bigLogo: `${url}/api/v3/visual-asset/group/${groupId}/2/image`
                };

            } else {
                obg = {
                    smallLogo: `${url}/api/v3/visual-asset/group/${groupId}/1/image`,
                    bigLogo: `${url}/api/v3/visual-asset/group/${groupId}/3/image`
                };
            }
            obs.next(obg);
            obs.complete();
        });
    }

    getImageLogo(theme: 'default' | 'dark', groupId) {
        const time = new Date().getTime();
        return new Observable(obs => {
            let img = null;
            const url = ConfigService.getAppApiUrl();
            if (theme === 'default') {
                img = `${url}/api/v3/visual-asset/group/${groupId}/2/image`;
            } else {
                img = `${url}/api/v3/visual-asset/group/${groupId}/3/image`;
            }
            obs.next(img);
            obs.complete();
        });
    }

    getImageV2(theme: 'default' | 'dark') {

        let req = [];
        let groupId = null;
        const images = this.localStorage.retrieve('logo.images');

        const themeSettings = {
            default: {
                bigLogo: '',
                smallLogo: '',
            },
            dark: {
                bigLogo: '',
                smallLogo: '',
            }

        };
        return new Observable((obs) => {
            if (this.groupSelected && this.groupSelected.ID) {
                groupId = this.groupSelected.ID;
            } else {
                obs.error('groupId not found');
                return null;
            }
            if (!images) {
                this.getGroup(groupId).subscribe(gr => {
                    gr.forEach(el => {
                        switch (el.TYPE_ID) {
                            case 0:
                                themeSettings.default.smallLogo = 'data:image/png;base64,' + el.DATA_BASE64;
                                break;
                            case 1:
                                themeSettings.dark.smallLogo = 'data:image/png;base64,' + el.DATA_BASE64;
                                break;
                            case 2:
                                themeSettings.default.bigLogo = 'data:image/png;base64,' + el.DATA_BASE64;
                                break;
                            case 3:
                                themeSettings.dark.bigLogo = 'data:image/png;base64,' + el.DATA_BASE64;
                                break;
                            default:
                                obs.error('TYPE_ID not founded');
                        }
                    });
                    this.localStorage.store('logo.images', themeSettings);
                    obs.next(themeSettings[theme]);
                    obs.complete();
                });
            } else {
                obs.next(images[theme]);
                obs.complete();
            }
        });

    }
}
