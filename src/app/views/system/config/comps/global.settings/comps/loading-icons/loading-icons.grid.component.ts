import {
    AfterViewInit,
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Inject,
    Injector, OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
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
import { LoadingIconsViewsProvider } from './providers/views.provider';
import { ViewsProvider } from '../../../../../../../modules/search/views/providers/views.provider';
import { LoadingsIconsSlickGridProvider } from './providers/slick.grid.provider';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { LIPageMode } from "./types";
import { LoadingIconsService } from "./providers/loading-icons.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'loading-icons',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        LoadingIconsViewsProvider,
        {provide: ViewsProvider, useClass: LoadingIconsViewsProvider},
        {provide: SlickGridProvider, useClass: LoadingsIconsSlickGridProvider},
    ]
})

export class LoadingIconsGridComponent implements OnInit, OnDestroy, AfterViewInit {

    pageMode: LIPageMode = "list";
    private pageModeSub: Subscription;
    private getVisualAssetGroupSub: Subscription;
    private isLoadingChangedSub: Subscription;
    private loadingIconsChangedSub: Subscription;
    private groupDeleted: Subscription;

    searchForm: FormGroup;

    inputTimeout = null;

    data = {
        tableRows: [],
        tableColumns: []
    };
    isLoading = true;
    // ---
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
    @ViewChild('settingsGroup', {static: false}) private settingsGroup: any;
    @ViewChild('settingsGroupGrid', {static: false}) private settingsGroupGrid: SlickGridComponent;
    private error: boolean = false;
    public destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private loadingIconsService: LoadingIconsService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {

    };

    ngOnInit() {
        this.searchForm = new FormGroup({
            'query': new FormControl('', [Validators.required])
        });

        this.searchForm.get('query').valueChanges
            .subscribe((value) => {
                this.onSubmitSearch();
            });

        this.pageModeSub = this.loadingIconsService.pageModeChanged.subscribe(mode => {
            this.pageMode = mode;
            console.log(mode);
            if (!(this.cdr as any).destroyed) {
                this.cdr.detectChanges();
            }
        });

        this.isLoadingChangedSub = this.loadingIconsService.isLoadingChanged.subscribe(status => {
            this.isLoading = status;
            if (!(this.cdr as any).destroyed) {
                this.cdr.detectChanges();
            }
        });

        this.loadingIconsChangedSub = this.loadingIconsService.loadingIconsChanged.subscribe(() => {
            this.bindDataToGrid();
        });

        this.groupDeleted = this.loadingIconsService.groupDeleted.subscribe(id => {
            this.data.tableRows = this.data.tableRows.filter(el => el.ID !== id)
        })
    }

    ngAfterViewInit() {
        this.data.tableColumns = this.injector.get(LoadingIconsViewsProvider).getCustomColumns();

        this.settingsGroupGrid.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.settingsGroupGrid.provider.onRowMouseDblClick.subscribe((data) => {
                    this.loadingIconsService.pageModeChanged.next('detail');
                    console.log('onRowMouseDblClick');

                });
                this.settingsGroupGrid.provider.onSelectRow.subscribe((data) => {
                    if (data && data.length > 0) {
                        const row = this.settingsGroupGrid.provider.getSelectedRow();
                        console.log('onSelectRow', row);
                        this.loadingIconsService.selectGroup(row);
                    }
                });
            });

        this.bindDataToGrid();
    }

    ngOnDestroy() {
        this.loadingIconsService.isLoadingChanged.next(true);
        this.loadingIconsService.pageModeChanged.next("list");
        this.pageModeSub.unsubscribe();
        this.loadingIconsChangedSub.unsubscribe();
        this.groupDeleted.unsubscribe();
        this.getVisualAssetGroupSub.unsubscribe();
        this.isLoadingChangedSub.unsubscribe();
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    addSettingsGroup() {
        this.loadingIconsService.pageModeChanged.next('new');
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
                if (el.NAME.toLowerCase().search(query) !== -1)
                    return el;
            });
            this.settingsGroupGrid.provider.buildPageByData({Data: uptData});
            this.settingsGroupGrid.provider.resize();
        }, 250);
    }

    onClearQuery() {
       this.searchForm.get('query').setValue('');
    }

    private bindDataToGrid() {
        if (this.settingsGroupGrid && this.settingsGroupGrid.provider) {
            this.getVisualAssetGroupSub = this.loadingIconsService.getVisualAssetGroup().subscribe(groupList => {
                this.data.tableRows = groupList;
                this.settingsGroupGrid.provider.setGlobalColumns(this.data.tableColumns);
                this.settingsGroupGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
                this.settingsGroupGrid.provider.buildPageByData({Data: this.data.tableRows});
                this.settingsGroupGrid.provider.resize();
                this.loadingIconsService.isLoadingChanged.next(false);
            });
        }
    }

}










