import {
    Component, Inject, Injector, TemplateRef, ViewChild, ViewEncapsulation, ChangeDetectorRef, ElementRef, ComponentRef
} from '@angular/core';
import {IMFXModalProvider} from "../../../../../../../../../modules/imfx-modal/proivders/provider";
import {NotificationService} from "../../../../../../../../../modules/notification/services/notification.service";
import {IMFXModalComponent} from "../../../../../../../../../modules/imfx-modal/imfx-modal";
import { TranslateService } from "@ngx-translate/core";
import {TabDataUsersModalComponent} from "../../../users_tab/modals/tabs.add-data-users.modal/tab.add-data-users.modal.component";
import {IMFXModalEvent} from "../../../../../../../../../modules/imfx-modal/types";
import {ChoosingRowsModalComponent} from "../../../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component";
import {UserManagerService} from "../../../../services/settings.user-manager.service";
import {ResponsibilitiesUsersType} from "../../../../modals/group.modal/group.modal.component";
import {lazyModules} from "../../../../../../../../../app.routes";

@Component({
    selector: 'notifications-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        UserManagerService
    ]
})

export class NotificationsEditModalComponent  {

    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalUsersOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;

    private modalRef: IMFXModalComponent;
    private readonly data;
    private context;
    private readonly notificationEdit;
    private usersNames = [];
    private usersForenames = [];
    private usersSurnames = [];
    private readonly isNew;
    private lookupData = [
        {key: 1, name: "User Data - Instant Message"},
        {key: 2, name: "User Data - SMS"},
        {key: 3, name: "User Data - Email"},
        {key: 4, name: "Custom - Instant Message"},
        {key: 5, name: "Custom - SMS"},
        {key: 6, name: "Custom - Email"}
    ];

    private readonly subscriptionData;
    private readonly notificationData;
    private selectedUser;

    constructor(protected injector: Injector,
                protected cd: ChangeDetectorRef,
                protected translate: TranslateService,
                @Inject(UserManagerService) protected userManagerService: UserManagerService,
                protected notificationService: NotificationService,
                protected modalProvider: IMFXModalProvider) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.data = d.data;
        this.context = d.context;
        this.notificationEdit = d.notificationEdit;
        this.usersNames = d.usersNames;
        this.usersForenames = d.usersForenames;
        this.usersSurnames = d.usersSurnames;
        this.isNew = d.isNew;

        if(this.isNew && !this.notificationEdit) {
            this.subscriptionData = {
                ID: 0,
                NOTIF_CODE: "",
                NOTIF_NAME: "",
                ParentId: this.data ? this.data.data.dirtyObj.ID : null
            };
        }
        else if(!this.notificationEdit) {
            this.subscriptionData = {
                ID: this.data.data.dirtyObj.ID,
                NOTIF_CODE: this.data.data.dirtyObj.NOTIF_CODE,
                NOTIF_NAME: this.data.data.dirtyObj.NOTIF_NAME,
                ParentId: this.data.data.dirtyObj.ParentId
            };
        }
        else if(this.notificationEdit) {
            this.notificationData = {
                ID: this.data.ID,
                NOTIFICATION_ID: this.data.NOTIFICATION_ID,
                USER_ID: this.data.USER_ID,
                SUBS_TYPE: this.data.SUBS_TYPE,
                SUBS_INFO: this.data.SUBS_INFO
            };
        }
    }

    toggleOverlay(show) {
        if(show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        }
        else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    ngOnInit() {
        if(this.notificationEdit && this.notificationData.USER_ID != null) {
            this.userManagerService.getUserById(this.notificationData.USER_ID).subscribe((res: any) =>{
                this.selectedUser = res;
                this.toggleOverlay(false);
            })
        }
        else {
            this.toggleOverlay(false);
        }
    }

    closeModal() {
        this.modalRef.hide();
    }

    onChangeType() {
        if(this.selectedUser) {
            this.updateSubInfo();
        }
    }

    updateSubInfo() {
        if(this.notificationData.SUBS_TYPE == 1)
            this.notificationData.SUBS_INFO = null;
        if(this.notificationData.SUBS_TYPE == 2)
            this.notificationData.SUBS_INFO = this.selectedUser["PH_MOB"];
        if(this.notificationData.SUBS_TYPE == 3)
            this.notificationData.SUBS_INFO = this.selectedUser["PC_ID"];
    }

    changeUser() {
         const changeUserModal = this.modalProvider.showByPath(lazyModules.tab_add_data_users_modal, TabDataUsersModalComponent, {
            size: "md",
            title: 'user_management.notifications.modal.fields.user',
            position: 'center',
            footerRef: 'modalFooterTemplate',
             usePushState: false
        }, {context: this});

        changeUserModal.load().then((cr: ComponentRef<TabDataUsersModalComponent>) => {
            changeUserModal.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    if(res.$event.length > 0) {
                        this.notificationData.USER_ID = res.$event[0]["ID"];
                        this.selectedUser = res.$event[0];
                        this.updateSubInfo();
                    }
                }
            });

            const content: /*ChoosingRowsModalComponent*/ TabDataUsersModalComponent = cr.instance;
            this.userManagerService.getUsers().subscribe((res: ResponsibilitiesUsersType[]) => {
                let result = res.map((item: ResponsibilitiesUsersType) => {
                    item.__FULLNAME = this.getFullName(item);
                    return item;
                });
                content.setData(result, "__FULLNAME");
                setTimeout(() => {
                    content.toggleOverlay(false);
                });
            });
        })



    }

    private getFullName(item: ResponsibilitiesUsersType){
        return item.USER_ID + (item.SURNAME?' ' + item.SURNAME:'') + (item.FORENAME?' '+item.FORENAME:'');
    }

    validate(): boolean {
        var result = true;
        //this.notificationService.notifyShow(2, "Not valid!", true, 1000);
        return result;
    }

    saveData() {
        var saveData = {
            IsNotification: this.notificationEdit,
            IsNew: this.isNew,
            Data: this.notificationEdit ? this.notificationData : this.subscriptionData
        }
        if(!this.notificationEdit && (saveData.Data.NOTIF_CODE.length == 0 || saveData.Data.NOTIF_NAME.length == 0)) {
            if(saveData.Data.NOTIF_CODE.length == 0 )
                this.notificationService.notifyShow(2, "Code is required field", true, 1000);
            if(saveData.Data.NOTIF_NAME.length == 0 )
                this.notificationService.notifyShow(2, "Name is required fields", true, 1000);
        }
        else if(this.notificationEdit && (saveData.Data.USER_ID == null || saveData.Data.SUBS_TYPE == null || saveData.Data.SUBS_INFO == null && saveData.Data.SUBS_TYPE != null && saveData.Data.SUBS_TYPE >= 4 ||
            (saveData.Data.USER_ID != null && saveData.Data.USER_ID.length == 0 ||
                saveData.Data.SUBS_TYPE != null && saveData.Data.SUBS_TYPE.length == 0 ||
                saveData.Data.SUBS_INFO != null && saveData.Data.SUBS_INFO.length == 0 && saveData.Data.SUBS_TYPE != null && saveData.Data.SUBS_TYPE >= 4))) {
            if(saveData.Data.USER_ID == null || saveData.Data.USER_ID != null && saveData.Data.USER_ID.length == 0 )
                this.notificationService.notifyShow(2, this.translate.instant("user_management.notifications.modal.fields.user") + " is required field", true, 1000);
            if(saveData.Data.SUBS_TYPE == null || saveData.Data.SUBS_TYPE != null && saveData.Data.SUBS_TYPE.length == 0 )
                this.notificationService.notifyShow(2, this.translate.instant("user_management.notifications.modal.fields.subscription_type") + " is required field", true, 1000);
            if(saveData.Data.SUBS_TYPE != null && saveData.Data.SUBS_TYPE >= 4 && (saveData.Data.SUBS_INFO == null || saveData.Data.SUBS_INFO != null && saveData.Data.SUBS_INFO.length == 0 ))
                this.notificationService.notifyShow(2, this.translate.instant("user_management.notifications.modal.fields.subscription_contacts") + " is required field", true, 1000);
        }
        else {
            this.modalRef.emitClickFooterBtn('ok', saveData);
            this.modalRef.hide();
        }

        //this.toggleOverlay(false);
        //this.notificationService.notifyShow(2, this.translate.instant("user_management.users.modal.save_error") + err.error.Message);
    }
}
