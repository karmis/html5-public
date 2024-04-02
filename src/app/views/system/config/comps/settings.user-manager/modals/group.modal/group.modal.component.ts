import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import {UserManagerService} from "../../services/settings.user-manager.service";
import {OverlayComponent} from '../../../../../../../modules/overlay/overlay';
import {
    SchedulesAreasType,
    SettingsUserManagerResponsibilitiesTreeComponent
} from '../../comps/responsibilities_tree/comp';
import * as _ from "lodash";

export type ChannelType = {
    ID?: number,
    CH_CODE?: string,
    CH_FULL?: string,
    Name?: string
};
export type UserGroupType = {
    CHANNELS: ChannelType[] | null,
    NAME: string,
    DESCRIPTION: string | null,
    PRESETS: ResponsibilitiesPresetsType[] | null,
    RESPONSIBILITIES: any[] | null,
    REPORTS_PERMISSIONS: any[] | null,
    SCHEDULE_AREAS: any[] | null,
    USERS: ResponsibilitiesUsersType[] | null
};
export type UsersGroupType = {
    [key: string]: any
}

export type ReportsPermissionsType = {
    ID: number
    IS_SELECTED: boolean,
    NAME: string,
    PARENT_ID: number
}

export type ResponsibilitiesType = {
    RESPONSIBILITY_ID: number
    DESCRIPTION: string,
    GROUP_ID: number,
    IS_SELECTED: boolean,
    NAME: string,
    PARENT_ID: number,
    PERMISSION: ResponsibilitiesPermissionsType,
}

export type ResponsibilitiesPermissionsType = {
    MASK: number,
    VALUE: number
}

export type ResponsibilitiesPresetsType = {
    NAME: string,
    ID: number
}

export type ResponsibilitiesUsersType = {
    ID: number,
    SURNAME: string,
    FORENAME:string,
    USER_ID:string,
    __FULLNAME?: string,
}

@Component({
    selector: 'manager-group-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        UserManagerService,
    ]
})

export class ManagerGroupModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    public onSaveGroup: EventEmitter<void> = new EventEmitter<void>();
    // @ViewChild('modalOverlayWrapper') private modalOverlayWrapper: OverlayComponent;
    @ViewChild('modalOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;
    @ViewChild('modalWrapper', {static: false}) private modalWrapperEl: ElementRef;
    @ViewChild('responsibilitiesTree', {static: false}) private responsibilitiesTree: SettingsUserManagerResponsibilitiesTreeComponent;
    @ViewChild('reportsPermissionsTree', {static: false}) private reportsPermissionsTree: SettingsUserManagerResponsibilitiesTreeComponent;
    private modalRef: IMFXModalComponent;
    private readonly rowId;
    private context;
    private channelsLookup;
    private originalGroupData: UserGroupType;
    private changedGroupData: UserGroupType;
    private isNew: boolean = true;
    private groupUsers: UsersGroupType[] = [];
    private presetsIsSelectedAll: boolean = false;
    private newGroupData = {
        CHANNELS: [],
        NAME: '',
        DESCRIPTION: '',
        PRESETS: [],
        RESPONSIBILITIES: [],
        REPORTS_PERMISSIONS: [],
        SCHEDULE_AREAS: [],
        USERS: []
    };
    private isSaving: boolean = false;

    constructor(protected injector: Injector,
                protected service: UserManagerService,
                protected cdr: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.rowId = d.rowId;
        this.context = d.context;
    }

    toggleOverlay(show) {
        if(show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        }
        else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.cdr.detectChanges();
    }

    ngAfterViewInit() {
        this.isSaving = true;
        if (this.rowId) {
            this.isNew = false;
            this.toggleOverlay(true);
            this.service.getGroupById(this.rowId).subscribe((res: UserGroupType) => {
                this.service.getChannels().subscribe((channelsLookup: any) => {
                    this.channelsLookup = channelsLookup;
                    if(res.PRESETS.length === 1 && res.PRESETS[0].ID === 0){
                        this.presetsIsSelectedAll = true;
                    }
                    this.originalGroupData = res;
                    this.changedGroupData = _.cloneDeep(res);
                    this.isSaving = false;
                    this.cdr.detectChanges();
                    this.toggleOverlay(false);
                });
            });
        } else {
            this.isSaving = true;
            this.isNew = true;
            this.toggleOverlay(true);
            this.service.getResponsibilities().subscribe((res: ResponsibilitiesType[]) => {
                this.newGroupData.RESPONSIBILITIES = res;
                this.service.getReportsPermissions().subscribe((res2: ResponsibilitiesType[]) => {
                    this.service.getChannels().subscribe((channelsLookup: any) => {
                        this.channelsLookup = channelsLookup;
                        this.newGroupData.REPORTS_PERMISSIONS = res2;
                        this.originalGroupData = this.newGroupData;
                        this.changedGroupData = _.cloneDeep(this.newGroupData);
                        this.isSaving = false;
                        this.cdr.detectChanges();
                        this.toggleOverlay(false);
                    });
                });
            });
        }
    }

    onAddChannels($event) {
        this.changedGroupData.CHANNELS = this.changedGroupData.CHANNELS.concat($event);
    }

    onDeleteChannels($event: ChannelType[]) {
        let indexesCh: { [key: string]: ChannelType } = {};
        $event.forEach((rCh: ChannelType) => {
            indexesCh[rCh.CH_CODE] = rCh;
        });

        this.changedGroupData.CHANNELS = this.changedGroupData.CHANNELS.filter((ch: ChannelType) => {
            return !indexesCh[ch.CH_CODE];
        });
    }

    onAddPresets($event: ResponsibilitiesPresetsType[]){
        this.changedGroupData.PRESETS = this.changedGroupData.PRESETS.concat($event);
    }

    onDeletePresets($event: ResponsibilitiesPresetsType[]){
        let indexesCh: { [key: string]: ResponsibilitiesPresetsType } = {};
        $event.forEach((rCh: ResponsibilitiesPresetsType) => {
            indexesCh[rCh.ID] = rCh;
        });

        this.changedGroupData.PRESETS = this.changedGroupData.PRESETS.filter((ch: ResponsibilitiesPresetsType) => {
            return !indexesCh[ch.ID];
        });
    }

    onSetPresets(preset:ResponsibilitiesPresetsType[] = []) {
        this.changedGroupData.PRESETS = preset;
    }

    closeModal() {
        this.modalRef.hide();
    }

    onUpdateReportsPermissions(permissions: ReportsPermissionsType[]) {
        this.changedGroupData.REPORTS_PERMISSIONS = permissions;
    }

    onUpdateResponsibility(responsibilities: ResponsibilitiesType[]) {
        this.changedGroupData.RESPONSIBILITIES = responsibilities;
    }

    onUpdateSchedules(schedules: SchedulesAreasType[]) {
        this.changedGroupData.SCHEDULE_AREAS = schedules;
    }

    onAddUsers(users: ResponsibilitiesUsersType[]) {
        this.changedGroupData.USERS = this.changedGroupData.USERS.concat(users.map((item: ResponsibilitiesUsersType) => {
            delete item.__FULLNAME;
            return item
        }));
    }

    onDeleteUsers($event: ResponsibilitiesUsersType[]) {
        let indexesCh: { [key: string]: ResponsibilitiesUsersType } = {};
        $event.forEach((rCh: ResponsibilitiesUsersType) => {
            indexesCh[rCh.ID] = rCh;
        });

        this.changedGroupData.USERS = this.changedGroupData.USERS.filter((ch: ResponsibilitiesUsersType) => {
            return !indexesCh[ch.ID];
        });
    }

    selectRoots() {
        for(var i = 0; i < this.changedGroupData.REPORTS_PERMISSIONS.length; i++) {
            if(this.changedGroupData.REPORTS_PERMISSIONS[i].IS_FOLDER) {
                this.changedGroupData.REPORTS_PERMISSIONS[i].IS_SELECTED = false;
            }
        }
        for(var i = 0; i < this.changedGroupData.REPORTS_PERMISSIONS.length; i++) {
            if(this.changedGroupData.REPORTS_PERMISSIONS[i].IS_SELECTED) {
                this.selectParent(this.changedGroupData.REPORTS_PERMISSIONS[i]);
            }
        }
    }

    selectParent(child) {
        if(child.PARENT_ID == null || child.PARENT_ID == child.ID)
            return;
        var res = this.changedGroupData.REPORTS_PERMISSIONS.filter((x)=>{
            return x.ID == child.PARENT_ID;
        });
        for(var i = 0; i < res.length; i++) {
            res[i].IS_SELECTED = true;
            if(res[i].PARENT_ID != null) {
                this.selectParent(res[i]);
            }
        }
    }

    saveData() {
        this.isSaving = true;
        this.toggleOverlay(true);
        this.selectRoots();
        this.removeChilds(this.changedGroupData);
        if (this.isNew) {
            this.service.insertGroup(this.changedGroupData).subscribe((res:any) => {
                this.onSaveGroup.emit();
                this.modalRef.hide();
            }, (err) => {
                this.isSaving = false;
                this.toggleOverlay(false);
                this.notificationService.notifyShow(2, this.translate.instant("user_management.groups.modal.save_error") + err.Message);
            });
        } else {
            this.service.updateGroupById(this.rowId, this.changedGroupData).subscribe((res:any) => {
                this.onSaveGroup.emit();
                this.modalRef.hide();
            }, (err) => {
                this.isSaving = false;
                this.toggleOverlay(false);
                this.notificationService.notifyShow(2, this.translate.instant("user_management.groups.modal.save_error") + err.Message);
            });
        }
    }

    removeChilds(obj) {
        for(let prop in obj) {
            if (prop === '_children')
                delete obj[prop];
            else if (typeof obj[prop] === 'object')
                this.removeChilds(obj[prop]);
        }
    }
}
