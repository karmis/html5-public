import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Inject,
    Injector,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { SettingsGroupsService } from '../../../../../../../services/system.config/settings.groups.service';
import { RemoveButtonColumn } from './comps/remove.button/remove.button.component';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../../../../../modules/search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../../../../../../../modules/search/slick-grid/slick-grid';
import { SettingsGroupsViewsProvider } from './providers/views.provider';
import { ViewsProvider } from '../../../../../../../modules/search/views/providers/views.provider';
import { SettingsGroupsSlickGridProvider } from './providers/slick.grid.provider';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import {SettingsGroupGridItemType} from "../../../../types";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'settings-groups-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        SettingsGroupsService,
        ViewsProvider,
        SettingsGroupsViewsProvider,
        {provide: ViewsProvider, useClass: SettingsGroupsViewsProvider},
        {provide: SlickGridProvider, useClass: SettingsGroupsSlickGridProvider},
    ]
})

export class SettingsGroupsGridComponent implements OnInit {
    @ViewChild('overlayGroup', {static: false}) private overlayGroup: any;
    @ViewChild('settingsGroup', {static: false}) private settingsGroup: any;
    @ViewChild('settingsGroupGrid', {static: false}) private settingsGroupGrid: SlickGridComponent;
    @Output() private selectSettingsGroup: EventEmitter<any> = new EventEmitter<{data: any, isClone: boolean}>();

    private settingsGroupGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: "#externalWrapperSettingsGroupsGrid",
                selectFirstRow: false,
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 25,
                fullWidthRows: true,
                rowHeight: 25,
                forceFitColumns: false,

            }
        })
    });
    private data: any = {};
    private selectedData = null;
    private error: boolean = false;
    searchForm: FormGroup;
    inputTimeout = null;
    public destroyed$: Subject<any> = new Subject();
    groupDeleted: Subscription

    constructor(private cdr: ChangeDetectorRef,
                private settingsGroupsService: SettingsGroupsService,
                private settingsGroupsSlickGridProvider: SlickGridProvider,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {

        this.data = {
            tableRows: [],
            tableColumns: []
        };
    };

    ngOnInit() {
        this.searchForm = new FormGroup({
            'query': new FormControl('', [Validators.required])
        });

        this.searchForm.get('query').valueChanges
            .subscribe((value) => {
                this.onSubmitSearch();
            });

        this.groupDeleted = (this.settingsGroupsSlickGridProvider as SettingsGroupsSlickGridProvider).groupDeleted.subscribe(id => {
            this.data.tableRows = this.data.tableRows.filter(el => el.Id !== id);
        })

        //
        // setTimeout(() => self.overlayGroup.show(self.settingsGroup.nativeElement));
    }

    ngAfterViewInit(){
        let self = this;
        this.overlayGroup.show(this.settingsGroup.nativeElement);

        this.data.tableColumns = this.injector.get(SettingsGroupsViewsProvider).getCustomColumns();
        this.settingsGroupsService.getSettingsGroupsList()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                self.onGetSettingsGroups(res);
            });

        this.settingsGroupGrid.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                self.settingsGroupGrid.provider.onRowMouseDblClick.subscribe((data) => {
                    delete data.row.id; // delete duplicated lowerCase property 'id'
                    self.selectSettingsGroup.emit({
                        data: data.row,
                        isClone: false
                    });
                });
                self.settingsGroupGrid.provider.onSelectRow.subscribe((data) => {
                    if (data && data.length > 0) {
                        const row = self.settingsGroupGrid.provider.getSelectedRow();
                        if (row){
                            self.selectedData = {
                                field: "ID",
                                value: row["ID"]
                            };
                        }
                    }
                });
            });
    }

    ngOnDestroy() {
        this.groupDeleted.unsubscribe();
        this.destroyed$.next();
        this.destroyed$.complete();
        this.overlayGroup.hide(this.settingsGroup.nativeElement);
    }

    isError($event) {
        if ($event) {
            this.error = true;
        }
    }

    clickRepeat() {
        this.error = false;
        let self = this;
        this.overlayGroup.show(this.settingsGroup.nativeElement);
        this.settingsGroupsService.getSettingsGroupsList()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
            (res: any) => {
                self.onGetSettingsGroups(res);
            },
            (err) => {
                self.error = true;
                self.overlayGroup.hide(this.settingsGroup.nativeElement);
            });
    }

    onGetSettingsGroups(res) {
        res = res.map((row) => {
            if(row.Id === 0){
                row.IdText = '';
            } else {
                row.IdText = row.Id;
            }
            return row;
        });
        this.data.tableRows = res;
        this.cdr.markForCheck();
        this.bindDataToGrid();
        this.overlayGroup.hide(this.settingsGroup.nativeElement);
    }

    addSettingsGroup() {
        this.selectSettingsGroup.emit({
            data: {},
            isClone: false
        });
    }

    cloneGroup() {
        const data = this.settingsGroupGrid.provider.getSelectedRowData();
        if (data) {
            this.selectSettingsGroup.emit({
                data,
                isClone: true
            });
        }
    }

    private bindDataToGrid() {

        this.settingsGroupGrid.provider.setGlobalColumns(this.data.tableColumns);
        this.settingsGroupGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        this.settingsGroupGrid.provider.buildPageByData({Data: this.data.tableRows});
        this.settingsGroupGrid.provider.resize();
    }

    onSubmitSearch() {
        if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
        }

        this.inputTimeout = setTimeout(() => {
            const query = this.searchForm.get('query').value.toLowerCase();

            if (query.length === 0) {
                this.settingsGroupGrid.provider.buildPageByData({Data: this.data.tableRows});
                this.settingsGroupGrid.provider.resize();
                return;
            }

            const uptData = this.data.tableRows.map(el => {
                if (el.Name.toLowerCase().search(query) !== -1)
                    return el;
            });
            this.settingsGroupGrid.provider.buildPageByData({Data: uptData});
            this.settingsGroupGrid.provider.resize();
        }, 250);
    }

    onClearQuery() {
        this.searchForm.get('query').setValue('');
    }

}










