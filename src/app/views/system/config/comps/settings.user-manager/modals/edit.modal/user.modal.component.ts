import {
    Component,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef,
    ElementRef,
    ComponentRef,
    OnInit, AfterViewInit
} from '@angular/core';
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {LookupService} from "../../../../../../../services/lookup/lookup.service";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {TranslateService} from '@ngx-translate/core';
import {UserManagerService} from "../../services/settings.user-manager.service";
import {SettingsUserManagerResponsibilitiesTreeComponent} from "../../comps/responsibilities_tree/comp";
import {AddLocationModalComponent} from "../add-location.modal/add-location";
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {SettingsGroupsService} from "../../../../../../../services/system.config/settings.groups.service";
import {lazyModules} from "../../../../../../../app.routes";
import {HttpErrorResponse} from '@angular/common/http';
import {IMFXControlsSelect2Component} from "../../../../../../../modules/controls/select2/imfx.select2";
import {NamesAuthoringModalComponent} from "../names-authoring.modal/names-authoring";

@Component({
    selector: 'manager-user-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        UserManagerService,
        SettingsGroupsService
    ]
})

export class ManagerUserModalComponent implements OnInit, AfterViewInit {

    @ViewChild('selectLangEl', {static: false}) selectLangEl: IMFXControlsSelect2Component;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalUsersOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;
    @ViewChild('responsibilitiesTree', {static: false}) private responsibilitiesTree: SettingsUserManagerResponsibilitiesTreeComponent;

    private locationModal: IMFXModalComponent;
    private namesAuthoringModal: IMFXModalComponent;
    private modalRef: IMFXModalComponent;
    private rowData;
    private context;
    private userData;
    private isNew = false;
    private inChange = false;
    private readonly isClone = false;
    private lookupsMap = {};
    private passwordConfirm = "";
    private changedPassword = "";
    private selectedLanguage = null;
    private hasCustomUIOptions = false;
    private initialSpecificData = {
        DBA_MODE: 0,
        FLGS: 0,
        STATUS: 'OPEN'
    };

    constructor(protected injector: Injector,
                protected service: UserManagerService,
                protected cd: ChangeDetectorRef,
                protected settingsGroupsService: SettingsGroupsService,
                @Inject(LookupService) protected lookupService: LookupService,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService,
                protected modalProvider: IMFXModalProvider,
                protected lokupService: LookupService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.isNew = d.rowData == null;
        this.isClone = d.clone;
        this.rowData = d.rowData;
        this.context = d.context;
        if (this.isNew) {
            this.userData = {
                CHANNELS: [],
                PRESETS: [],
                RESPONSIBILITIES: [],
                SCHEDULE_AREAS: [],
                USR_TYPES: 0,
                DBA_MODE: 0,
                FLGS: 0,
                REPORTS: [],
                STATUS: 'OPEN',
                GROUPS: [],
                NA_PARENT_ENTITY_ID: null,
                NA_PARENT_ENTITY_NAME: null,
                USER_ID: null,
                FORENAME: null,
                SURNAME: null,
                PHONE: null,
                PH_EXT: null,
                PH_SPED: null,
                PH_MOB: null,
                PC_ID: null,
                OKTA_ID: null,
                SETTINGS_GROUP_ID: null,
                PASSWORD: null,
                PUBLIC_API_KEY: null,
                ALT_USERNAME: null,
                ExpiryDate: null
            }
        }

        this.lookupService.getLookups("Departments").subscribe((res: any) => {
            if (res != null)
                this.lookupsMap['DEPT_ID'] = res.map((x) => {
                    return {id: x["ID"], text: x["NAME"]};
                });
        });
        this.lookupService.getLookups("Devices").subscribe((res: any) => {
            if (res != null)
                this.lookupsMap['DEFAULT_DEVICE'] = res.map((x) => {
                    return {id: x["Id"], text: x["Name"]};
                });
        });
        this.lookupsMap['LANGUAGES'] = null;
        this.settingsGroupsService.getLanguageList().subscribe(res => {
            const ar = []
            this.hasCustomUIOptions = true;
            if (res.text) {
                res.text.forEach(ln => {
                    ar.push({
                        id: ln,
                        text: ln
                    })
                })
                this.lookupsMap['LANGUAGES'] = ar;
            }
        });

        this.service.getChannels().subscribe((res: any) => {
            this.lookupsMap['CHANNELS_LOOKUP'] = res;
            this.cd.detectChanges();
        });
    }

    GetBit(val, index) {
        const bit = (val & (1 << index)) != 0;
        return bit;
    }

    SetBit(val, index) {
        const mask = (1 << index);
        return val | mask;
    }

    ResetBit(val, index) {
        const mask = ~(1 << index);
        return val & mask;
    }

    onUserIDInput() {
        this.userData.USER_ID = this.userData.USER_ID.toUpperCase();
    }

    changeInProgress = false;

    toggleChangePassword(show) {
        this.changedPassword = "";
        this.inChange = show;
    }

    changePassword() {
        this.changeInProgress = true;
        if (this.changedPassword.trim().length > 0) {
            const changePassObject = {
                UserId: this.userData.USER_ID,
                OldPassword: null,
                NewPassword: this.changedPassword
            };
            this.service.changePassword(changePassObject).subscribe((res: any) => {
                this.changeInProgress = false;
                this.inChange = false;
                this.changedPassword = "";
                this.notificationService.notifyShow(1, "Password changed", true, 1000);
            });
        } else {
            this.changeInProgress = false;
            this.notificationService.notifyShow(2, "Password empty", true, 3000);
        }
    }

    getPasThru() {
        return (this.userData.FLGS & 0x01) != 0;
    }

    setPasThru(on) {
        if (on) {
            this.userData.FLGS = this.SetBit(this.userData.FLGS, 0);
        } else {
            this.userData.FLGS = this.ResetBit(this.userData.FLGS, 0);
        }
    }

    // getDisabled() {
    //     return (this.userData.USR_TYPES & 0x40000000) != 0;
    // }
    //
    // setDisabled(on) {
    //     if(on) {
    //         if(this.userData.USER_ID && this.userData.USER_ID.toUpperCase() == "TMDDBA")
    //             return;
    //         this.userData.USR_TYPES = this.userData.USR_TYPES | 0x40000000;
    //     }
    //     else {
    //         this.userData.USR_TYPES = this.userData.USR_TYPES & ~0x40000000;
    //     }
    // }

    toggleOverlay(show) {
        if (show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    genreatePublicAPIKey() {
        this.userData.PUBLIC_API_KEY = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    ngOnInit() {
        if (!this.isNew) {
            let synch = 0;
            this.service.getUserById(this.rowData["ID"]).subscribe((res: any) => {
                this.userData = res;
                this.userData.USER_ID = this.userData.USER_ID.toUpperCase();
                this.initialSpecificData.DBA_MODE = this.userData.DBA_MODE;
                this.initialSpecificData.FLGS = this.userData.FLGS;
                this.initialSpecificData.STATUS = this.userData.STATUS;

                if (this.isClone) {
                    this.isNew = true;
                    delete this.userData.ID;
                    this.userData.USER_ID = null;
                    this.userData.PASSWORD = null;
                    this.userData.PUBLIC_API_KEY = null;
                    this.userData.ALT_USERNAME = null;
                }
                synch++;
                if (synch == 2)
                    this.toggleOverlay(false);
                this.setLangSelector();
            });
            this.settingsGroupsService.getSettingsGroupsList().subscribe(
                (res: any) => {
                    this.setSettingsGroupsLookup(res);
                    synch++;
                    if (synch == 2)
                        this.toggleOverlay(false);
                });
        } else {
            this.settingsGroupsService.getSettingsGroupsList().subscribe(
                (res2) => {
                    this.setSettingsGroupsLookup(res2);
                    this.toggleOverlay(false);
                });
        }
    }

    ngAfterViewInit() {

    }

    setLangSelector() {
        this.settingsGroupsService.getLanguageSelected(this.rowData["ID"])
            .subscribe(res => {
                if (res && this.selectLangEl) {
                    this.selectedLanguage = res.text
                    this.selectLangEl.setSelected(res.text);
                }
            });

    }

    setSettingsGroupsLookup(groups) {
        this.lookupsMap['SETTINGS_GROUP_ID'] = groups.map((x) => {
            return {id: x["Id"], text: x["Name"]};
        });
    }

    closeModal() {
        this.modalRef.hide();
    }

    onAddGroup(data) {
        this.toggleOverlay(true);
        this.userData.GROUPS = this.userData.GROUPS.concat(data);
        const groupsIDs = this.userData.GROUPS.map(field => field["ID"]);
        this.service.getMergedUserGroupsData(groupsIDs).subscribe((res: any) => {
            this.userData.CHANNELS = res.CHANNELS;
            this.userData.RESPONSIBILITIES = res.RESPONSIBILITIES;
            this.userData.SCHEDULE_AREAS = res.SCHEDULE_AREAS == null ? [] : res.SCHEDULE_AREAS;
            this.userData.PRESETS = res.PRESETS;
            this.responsibilitiesTree.setResponsibilities(res.RESPONSIBILITIES);
            this.responsibilitiesTree.renderTree();
            this.responsibilitiesTree.setSchedules(this.userData.SCHEDULE_AREAS);
            this.responsibilitiesTree.renderSchedulesTree();
            this.cd.detectChanges();
            this.toggleOverlay(false);
        });
    }

    onDeleteGroup(data) {
        this.toggleOverlay(true);
        if (data.length == 0) {
            this.userData.GROUPS = [];
        } else {
            this.userData.GROUPS = this.userData.GROUPS.filter((x) => {
                for (let i = 0; i < data.length; i++) {
                    if (x.ID == data[i]) {
                        return true;
                    }
                }
                return false;
            });
        }
        this.service.getMergedUserGroupsData(data).subscribe((res: any) => {
            this.userData.CHANNELS = res.CHANNELS;
            this.userData.RESPONSIBILITIES = res.RESPONSIBILITIES;
            this.userData.PRESETS = res.PRESETS;
            this.userData.SCHEDULE_AREAS = res.SCHEDULE_AREAS == null ? [] : res.SCHEDULE_AREAS;
            this.responsibilitiesTree.setResponsibilities(res.RESPONSIBILITIES);
            this.responsibilitiesTree.renderTree();
            this.responsibilitiesTree.setSchedules(this.userData.SCHEDULE_AREAS);
            this.responsibilitiesTree.renderSchedulesTree();
            this.cd.detectChanges();
            this.toggleOverlay(false);
        });
    }

    onSelect(data, fieldId) {
        this.userData[fieldId] = data.params.data[0].id;
    }

    onChangeDate(value, fieldId) {
        this.userData.ExpiryDate = value;
    }

    onChangeLang(val) {
        this.selectedLanguage = val.params.data[0].text;
    }

    validate(): boolean {
        let result = true;
        if (this.userData.USER_ID == null ||
            this.userData.USER_ID != null && this.userData.USER_ID.trim().length == 0 ||
            this.userData.USER_ID != null && this.userData.USER_ID.trim().length > 0 && this.userData.USER_ID.trim().match(/[^A-Z0-9_.]/) != null) {
            this.notificationService.notifyShow(2, "Data not valid, User ID required.", true, 1000);
            result = false;
        }
        if (this.isNew && (this.userData.PASSWORD == null ||
            this.userData.PASSWORD != null && this.userData.PASSWORD.length == 0)) {
            this.notificationService.notifyShow(2, "Data not valid, Password required.", true, 1000);
            result = false;
        }
        if (this.userData.PASSWORD != null && this.userData.PASSWORD.length > 0 && this.isNew && this.passwordConfirm != this.userData.PASSWORD) {
            this.notificationService.notifyShow(2, "Data not valid, Password and confirmation password do not match.", true, 1000);
            result = false;
        }
        return result;
    }

    saveLanguage() {
        this.settingsGroupsService.saveLanguage(this.userData.ID, this.selectedLanguage).subscribe(() => {
            },
            (err: HttpErrorResponse) => {
                this.saveError(err);
            });
    }

    //private allRequestsDoone;
    saveData() {
        //this.allRequestsDoone = 3;
        this.toggleOverlay(true);
        if (!this.validate()) {
            this.toggleOverlay(false);
            return;
        }
        this.onUserIDInput();

        if (!this.isNew && this.hasCustomUIOptions) {
            this.saveLanguage();
        }

        this.service.editUser(this.userData, this.isNew).subscribe((res: any) => {
            if (res != null) {
                this.userData.ID = res;
                if (this.selectedLanguage && this.hasCustomUIOptions) {
                    this.saveLanguage();
                }
            }
            let checker = 0;
            if (this.initialSpecificData.DBA_MODE != this.userData.DBA_MODE || this.isNew || this.isClone) {
                checker++;
                this.service.changeDba(this.userData.ID, this.userData.DBA_MODE).subscribe((res: any) => {
                    checker--;
                    if (checker == 0)
                        this.Finalize();
                    this.notificationService.notifyShow(1, this.translate.instant("user_management.users.modal.dba_changed"));
                }, (err: HttpErrorResponse) => {
                    checker--;
                    if (checker == 0)
                        this.Finalize();
                    this.toggleOverlay(false);
                    this.notificationService.notifyShow(2, this.translate.instant("user_management.users.modal.save_error") + err.error.Message);
                });
            }

            if (this.initialSpecificData.FLGS != this.userData.FLGS || this.isNew || this.isClone) {
                checker++;
                this.service.changePastru(this.userData.ID, this.userData.FLGS).subscribe((res: any) => {
                    checker--;
                    if (checker == 0)
                        this.Finalize();
                    this.notificationService.notifyShow(1, this.translate.instant("user_management.users.modal.pas_thru_changed"));
                }, (err: HttpErrorResponse) => {
                    checker--;
                    if (checker == 0)
                        this.Finalize();
                    this.toggleOverlay(false);
                    this.notificationService.notifyShow(2, this.translate.instant("user_management.users.modal.save_error") + err.error.Message);
                });
            }

            if (this.initialSpecificData.STATUS != this.userData.STATUS || this.isNew || this.isClone) {
                checker++;
                this.service.changeLock(this.userData.USER_ID, this.userData.STATUS != 'OPEN').subscribe((res: any) => {
                    checker--;
                    if (checker == 0)
                        this.Finalize();
                    this.notificationService.notifyShow(1, this.translate.instant("user_management.users.modal.status_changed"));
                }, (err: HttpErrorResponse) => {
                    checker--;
                    if (checker == 0)
                        this.Finalize();
                    this.toggleOverlay(false);
                    this.notificationService.notifyShow(2, this.translate.instant("user_management.users.modal.save_error") + err.error.Message);
                });
            }

            if (checker == 0)
                this.Finalize();
        }, (err: HttpErrorResponse) => {
            this.saveError(err);
        });
    }

    private saveError(err: HttpErrorResponse) {
        this.toggleOverlay(false);
        const message = (err.error && err.error.Message) ? err.error.Message : (err.error && err.error.Error) ? err.error.Error : '';
        this.notificationService.notifyShow(2, this.translate.instant("user_management.users.modal.save_error") + message);
    }

    private Finalize() {
        this.notificationService.notifyShow(1, this.translate.instant("user_management.users.modal.save_success"));
        this.modalRef.emitClickFooterBtn('ok');
        this.modalRef.hide();
    }

    /*checkRequests() {
        if(this.allRequestsDoone == 0) {

        }
    }*/

    showNamesAuthoringModal() {
        this.namesAuthoringModal = this.modalProvider.showByPath(lazyModules.names_authoring_modal, NamesAuthoringModalComponent, {
            size: "md",
            title: 'user_management.users.modal.names_authoring',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this});

        this.namesAuthoringModal.load().then((cr: ComponentRef<NamesAuthoringModalComponent>) => {
            this.namesAuthoringModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    if (res.$event) {
                        this.userData.NA_PARENT_ENTITY_ID = res.$event.ID;
                        this.userData.NA_PARENT_ENTITY_NAME = res.$event.NAME;
                    } else {
                        this.userData.NA_PARENT_ENTITY_ID = null;
                        this.userData.NA_PARENT_ENTITY_NAME = null;
                    }
                }
            });
        });
    }

    showLocationModal() {
        this.locationModal = this.modalProvider.showByPath(lazyModules.add_location_modal, AddLocationModalComponent, {
            size: "md",
            title: 'user_management.users.modal.add_location',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, itemData: this.userData.AREA_ID, withHighlight: true});

        this.locationModal.load().then((cr: ComponentRef<AddLocationModalComponent>) => {
            this.locationModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    if (res.$event && res.$event.length > 0) {
                        let root;
                        for (let i = 0; i < res.$event.length; i++) {
                            if (res.$event[i].PAR_ID == 0) {
                                root = res.$event[i];
                                break;
                            }
                        }
                        if (!root) {
                            root = res.$event[0];
                        }
                        const result = this.getLocation(root, res.$event);
                        this.userData.AREA_ID = result.ID;
                        this.userData.SITE_ID = root.ID;
                        this.userData.LocationText = result.TEXT;
                    } else {
                        this.userData.AREA_ID = null;
                        this.userData.SITE_ID = null;
                        this.userData.LocationText = "";
                    }
                }
            });
        });
    }

    getLocation(root, data) {
        let text = root.NAM;
        const lastChid = this.getLastChild(root, data);
        text += ", " + lastChid.NAM;
        return {ID: lastChid.ID, TEXT: text};
    }

    getLastChild(item, data) {
        let lastChild = item;
        for (let i = 0; i < data.length; i++) {
            if (data[i].PAR_ID == item.ID) {
                lastChild = this.getLastChild(data[i], data);
                break;
            }
        }
        return lastChild;
    }
}
