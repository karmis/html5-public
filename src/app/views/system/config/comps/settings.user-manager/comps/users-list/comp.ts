import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../../../../../modules/search/slick-grid/slick-grid.config';
import {SlickGridColumn} from '../../../../../../../modules/search/slick-grid/types';
import {TranslateService} from '@ngx-translate/core';
import {SlickGridProvider} from '../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../../../../../../modules/search/slick-grid/services/slick.grid.service';
import {SlickGridComponent} from '../../../../../../../modules/search/slick-grid/slick-grid';
import {UsersComponent} from '../../../../../../../modules/search/users/users';
import {IMFXModalComponent} from '../../../../../../../modules/imfx-modal/imfx-modal';
import {IMFXModalProvider} from '../../../../../../../modules/imfx-modal/proivders/provider';
import {IMFXModalEvent} from '../../../../../../../modules/imfx-modal/types';
import {UserLookupType} from '../../../../../../../services/lookupsearch/types';
import {UsersGroupType} from "../../modals/group.modal/group.modal.component";
import * as _ from "lodash";
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'settings-group-users-list',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
    ],
    styleUrls: [
        './styles/styles.scss'
    ],
})
export class SettingGroupUsersListComponent {
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    public onSelectEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() public onUpdateUsers: EventEmitter<UsersGroupType[]> = new EventEmitter<UsersGroupType[]>();
    private originalUsers: UsersGroupType[] = [];
    private users: UsersGroupType[] = [];
    @ViewChild('filterInput', {static: false}) private filterInput: any;
    @ViewChild('slickGridComp', {static: false}) private slickGridComp: SlickGridComponent;
    /**
     * Grid
     * @type {GridConfig}
     */
    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                },
            },
            plugin: <SlickGridConfigPluginSetups>{
                forceFitColumns: true,
                multiSelect: true,
                topPanelHeight: 20
            }
        })
    });
    private tableColumns: SlickGridColumn[] = <SlickGridColumn[]>[
        {
            id: '0',
            name: this.translate.instant('ng2_components.ag_grid.tbl_header_user_id'),
            field: 'USER_ID',
            width: 100,
            resizable: true,
            sortable: true,
            headerCssClass: "group-modal-users-header",
            multiColumnSort: false
        },
        {
            id: '1',
            name: this.translate.instant('ng2_components.ag_grid.tbl_header_surname'),
            field: 'FORENAME',
            width: 100,
            resizable: true,
            sortable: true,
            headerCssClass: "group-modal-users-header",
            multiColumnSort: false
        },
        {
            id: '2',
            name: this.translate.instant('ng2_components.ag_grid.tbl_header_forename'),
            field: 'SURENAME',
            width: 100,
            resizable: true,
            sortable: true,
            headerCssClass: "group-modal-users-header",
            multiColumnSort: false
        },
    ];
    private paramsOfSearch: string = "";
    private checkedIds: number[] = [];
    private checked = null;

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private modalProvider: IMFXModalProvider,
                private translate: TranslateService) {
    }

    @Input('users') set setUsers(users: UsersGroupType[]) {
        this.users = _.cloneDeep(users);
        this.originalUsers = _.cloneDeep(users);
        this.checkedIds = this.originalUsers.map((user: any) => {
            return user.ID;
        });
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.slickGridComp.whenGridReady(() => {
            this.slickGridComp.provider.initColumns(this.tableColumns, [], true);
            this.slickGridComp.provider.buildPageByData({Data: this.users});
        });
    }

    onSelect(user) {
    }

    changeUsers() {
        if (this.checked !== null) {
            this.checkedIds = this.checked;
        }
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.users_modal, UsersComponent, {
            size: 'md',
            title: 'List of users',
            position: 'center',
            footer: 'cancel|ok',
        }, {selectedUsersIds: this.checkedIds, checkboxes: true});

        modal.load().then((cr: ComponentRef<UsersComponent>) => {
            const usersModal: UsersComponent = cr.instance;
            setTimeout(() => {
                usersModal.slickGridComp.provider.setCheckedRows(this.checkedIds);
            });
            modal.modalEvents.unsubscribe();
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.checked = usersModal.slickGridComp.provider.getCheckedRows();
                    let checkedUsers = [];
                    usersModal.users.forEach((user: UserLookupType | any) => {
                        if (this.checked.indexOf(user.Id) > -1) {
                            user.USER_ID = user.UserId;
                            user.SURNAME = user.Surname;
                            user.FORENAME = user.Forename;
                            checkedUsers.push(user);
                        }
                    });
                    this.users = checkedUsers;
                    this.slickGridComp.provider.buildPageByData({Data: checkedUsers});
                    this.originalUsers = this.slickGridComp.provider.getClearDataAsArray();
                    // console.log(this.slickGridComp.provider, this, checkedUsers);

                    this.onUpdateUsers.emit(this.originalUsers);
                    // debugger;
                    modal.hide();
                }
            });
        });
    }

    private onFilter() {
        let self = this;
        this.paramsOfSearch = this.filterInput.nativeElement.value;
        let filter = [];
        $.each(this.originalUsers, (k, el) => {
            let userIdVal = el.USER_ID;
            let foreNameVal = el.FORENAME;
            let sureNameVal = el.SURNAME;
            let value = self.paramsOfSearch.toLowerCase();
            if ((userIdVal && userIdVal.toLowerCase().indexOf(value) !== -1) ||
                (foreNameVal && foreNameVal.toLowerCase().indexOf(value) !== -1) ||
                (sureNameVal && sureNameVal.toLowerCase().indexOf(value) !== -1)) {
                filter.push(el);
            }
        });


        if (filter.length === 0) {
            this.slickGridComp.provider.clearData(true);
        } else {
            this.slickGridComp.provider.buildPageByData({Data: filter});
            this.cdr.markForCheck();
        }
    }
}
