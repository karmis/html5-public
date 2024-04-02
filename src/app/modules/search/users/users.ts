/**
 * Created by Sergey Trizna on 10.01.2016.
 */
import {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver, ElementRef,
    EventEmitter,
    Injector,
    Input,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { LookupSearchUsersService } from '../../../services/lookupsearch/users.service';
import * as $ from 'jquery';
import {Observable} from "rxjs";
import { UserLookupType, UsersListLookupTypes } from '../../../services/lookupsearch/types';
import { AdvancedCriteriaControlLookupUsersModalDataType } from '../advanced/comps/criteria/comps/controls/comps/container/comps/lookupsearch/users.modal/types';
import {TranslateService} from '@ngx-translate/core';
import { SlickGridProvider } from '../slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../slick-grid/slick-grid.config';
import { SlickGridColumn } from '../slick-grid/types';
import { CheckBoxFormatter } from '../slick-grid/formatters/checkBox/checkbox.formatter';
import { Router } from '@angular/router';
import {AdvancedSearchDataForControlType} from "../advanced/types";
import {LookupSearchService} from "../../../services/lookupsearch/common.service";

@Component({
    selector: 'users-list',
    templateUrl: 'tpl/index.html',
    styleUrls: ['styles/index.scss'],
    providers: [
        SlickGridProvider,
        SlickGridService,
    ],
    entryComponents: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class UsersComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    public data: any;
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    public onSelectEvent: EventEmitter<any> = new EventEmitter<any>();
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    public users: UsersListLookupTypes = [];
    private compRef = this;
    private paramsOfSearch = '';
    @ViewChild('filterInput', {static: false}) private filterInput: ElementRef;
    @Input('isModal') private isModal: boolean = true;
    private selectedUsers: number[] = [];
    /**
     * Grid
     * @type {SlickGridConfig}
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
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                forceFitColumns: true,
                multiSelect: false
            }
        })
    });

    private users_dataTable = {
        tableRows: [],
        tableColumns: <SlickGridColumn[]>[
            {
                id: '0',
                name: this.translate.instant('ng2_components.ag_grid.tbl_header_user_id'),
                field: 'UserId',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
            {
                id: '1',
                name: this.translate.instant('ng2_components.ag_grid.tbl_header_surname'),
                field: 'Forename',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
            {
                id: '2',
                name: this.translate.instant('ng2_components.ag_grid.tbl_header_forename'),
                field: 'Surname',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
        ]
    };
    private company_dataTable = {
        tableRows: [],
        tableColumns: <SlickGridColumn[]>[
            {
                id: '0',
                // name: this.translate.instant('ng2_components.ag_grid.tbl_header_user_id'),
                name: 'Title',
                field: 'TITLE',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
            {
                id: '1',
                name: 'Address',
                // name: this.translate.instant('ng2_components.ag_grid.tbl_header_surname'),
                field: 'ADDR',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
        ]
    };
    private na_dataTable = {
        tableRows: [],
        tableColumns: <SlickGridColumn[]>[
            {
                id: '0',
                name: 'Name', //this.translate.instant('ng2_components.ag_grid.tbl_header_user_id'),
                field: 'Name',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
            {
                id: '1',
                name: 'Type',//this.translate.instant('ng2_components.ag_grid.tbl_header_surname'),
                field: 'Type',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
        ]
    };

    private checkboxes: boolean = false;
    private lookupSearchTypeVal:string = 'users';
    constructor(private injector: Injector,
                private lookupSearchService: LookupSearchService,
                private cdr: ChangeDetectorRef,
                private translate: TranslateService) {
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }

    ngOnInit() {

    }

    private propFiled;
    ngAfterViewInit() {
        this.data = this.injector.get('modalRef');
        this.lookupSearchTypeVal = this.data.getData().lookupSearchTypeVal;
        this.propFiled = this.lookupSearchTypeVal+ '_dataTable';
        this.getLookup(this.lookupSearchTypeVal).subscribe((users: UsersListLookupTypes) => {
            this.users = users;
            this[this.propFiled].tableRows = this.users;
            this.bindDataToGrid();
            this.cdr.markForCheck();
        });
        if (this.isModal) {
            this.selectedUsers = this.data.getData().selectedUsersIds;
            this.checkboxes = this.data.getData().checkboxes;
            if (this.checkboxes) {
                this[this.propFiled].tableColumns.push(<SlickGridColumn>{
                    id: -1,
                    name: '',
                    field: '*',
                    resizable: true,
                    sortable: true,
                    formatter: CheckBoxFormatter,
                    multiColumnSort: false,
                    cssClass: 'imfx-slickgrid-checkboxes',
                    isCustom: true,
                    width: 60,
                    __deps: {
                        injector: this.injector,
                        data: {
                            enabled: true,
                            enabledList: this.selectedUsers
                        }
                    }
                });
            }
        }
        this.filterInput.nativeElement.focus();
    }

    bindDataToGrid() {
        this.onReady.subscribe(() => {
            if (this.selectedUsers && this[this.propFiled].tableColumns[0].cssClass === 'imfx-slickgrid-checkboxes') {
                this[this.propFiled].tableColumns[0].__deps.data.enabledList = this.selectedUsers;
            }
            this.slickGridComp.provider.initColumns(this[this.propFiled].tableColumns, [], true);
            // self.dataTable.tableRows = self.dataTable.tableRows.map((item) => {
            //     if (self.selectedUsers.indexOf(item.Id) > -1) {
            //         item.__checked = true;
            //     }
            //
            //     return item;
            // });
            this.slickGridComp.provider.buildPageByData({Data: this[this.propFiled].tableRows});
            this.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
                this.onSelect(data);
            });
        });
    }

    onSelect(user) {
        delete user.__contexts;
        if (this.isModal) {
            this.onSelectEvent.emit(
                <AdvancedCriteriaControlLookupUsersModalDataType>{
                    user: user.row,
                    paramsOfSearch: this.paramsOfSearch,
                    users: this.users,
                });

            this.closeModal();
        }
    }

    setData(userData: AdvancedCriteriaControlLookupUsersModalDataType) {
        this.filterInput.nativeElement.value = userData.paramsOfSearch;
        this.cdr.detectChanges();
    }

    findUserByUserId(id: number): UserLookupType | boolean {
        let res: UserLookupType;
        id = id - 0;
        $.each(this.users, (key, user) => {
            if (id === user.Id) {
                res = user;
                return;
            }
        });

        return res || false;
    }

    public getLookup(val): Observable<UsersListLookupTypes> {
        return new Observable((observer: any) => {
            this.lookupSearchService.getLookup(val).subscribe(
                (users: any[]) => {
                    setTimeout(() => {
                        this.onReady.emit();
                    });
                    observer.next(users);
                },
                (error: any) => {
                    console.error('Failed', error);
                    observer.error(error);
                }, () => {
                    observer.complete();
                }
            );
        });

    }

    private onFilter() {
        this.paramsOfSearch = this.filterInput.nativeElement.value;
        let filter = this.users.filter((el) => {

            // for loans select user
            if (el.Name) {
                let foreNameVal = el.Name;
                let value = this.paramsOfSearch.toLowerCase();
                if ((foreNameVal && foreNameVal.toLowerCase().indexOf(value) !== -1)) {
                    return true;
                }
            }

            let userIdVal = el.UserId;
            let foreNameVal = el.Forename;
            let sureNameVal = el.Surname;
            let value = this.paramsOfSearch.toLowerCase();
            if ((userIdVal && userIdVal.toLowerCase().indexOf(value) !== -1) ||
                (foreNameVal && foreNameVal.toLowerCase().indexOf(value) !== -1) ||
                (sureNameVal && sureNameVal.toLowerCase().indexOf(value) !== -1)) {
                return true;
            }
            return false;
        });
        if (filter.length === 0) {
            this.slickGridComp.provider.clearData(true);
        } else {
            this[this.propFiled].tableRows = filter;
            this.slickGridComp.provider.setData(this[this.propFiled].tableRows, true);
            this.cdr.detectChanges();
        }
    }
    private selectUser() {
        if (this.isModal) {
            let user = this.slickGridComp.provider.getSelectedRowData();
            this.onSelectEvent.emit(
                <AdvancedCriteriaControlLookupUsersModalDataType>{
                    user: user,
                    paramsOfSearch: this.paramsOfSearch,
                    users: this.users,
                });

                this.closeModal();
        }
    }
    private closeModal() {
        if (this.isModal) {
            this.data.hide();
        }
    }
}
