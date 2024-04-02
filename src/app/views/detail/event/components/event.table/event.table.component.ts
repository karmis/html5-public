import {
    AfterViewInit,
    OnChanges,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef, EventEmitter,
    Injector, Input, Output,
    ViewChild, ViewEncapsulation, SimpleChanges, OnInit
} from "@angular/core";
import { ViewsConfig } from "../../../../../modules/search/views/views.config";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../../../../modules/search/slick-grid/slick-grid.config";
import { VersionSearchModalComponent } from "../../../../../modules/version-search-modal/version.search.modal.component";
import { lazyModules } from "../../../../../app.routes";
import { ActivatedRoute, Router } from "@angular/router";
import { SlickGridService } from "../../../../../modules/search/slick-grid/services/slick.grid.service";
import { ErrorModalComponent } from "../../../../../modules/error/modules/error-modal/error";
import { SecurityService } from "../../../../../services/security/security.service";
import { SlickGridRowData } from "../../../../../modules/search/slick-grid/types";
import { IMFXModalEvent } from "../../../../../modules/imfx-modal/types";
import { NotificationService } from "../../../../../modules/notification/services/notification.service";
import { IMFXModalProvider } from "../../../../../modules/imfx-modal/proivders/provider";
import { SlickGridProvider } from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridComponent } from "../../../../../modules/search/slick-grid/slick-grid";
import { TranslateService } from "@ngx-translate/core";
import { IMFXModalComponent } from "../../../../../modules/imfx-modal/imfx-modal";
import { SearchFormProvider } from "../../../../../modules/search/form/providers/search.form.provider";
import { EventTableViewsProvider } from "./providers/event.table.views.provider";
import { ViewsProvider } from "../../../../../modules/search/views/providers/views.provider";
import { EventTableGridProvider } from "./providers/event.table.grid.provider";
import { Subscription } from "rxjs";
import { ETCheckBoxSelected } from "../../types";
import { IMFXModalAlertComponent } from "../../../../../modules/imfx-modal/comps/alert/alert";
import $ from "jquery";
import {UnattachedMediaSearchModalComponent} from "../unattached.media.modal/unattached.media.modal.component";
import {TitlesSearchModalComponent} from "../titles.modal/titles.modal.component";

@Component({
    selector: 'event-table',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        ViewsProvider,
        SlickGridService,
        SearchFormProvider,
        EventTableViewsProvider,
        EventTableGridProvider,
        {provide: ViewsProvider, useClass: EventTableViewsProvider},
        {provide: SlickGridProvider, useClass: EventTableGridProvider},
    ],
})
export class EventTableComponent implements OnInit, AfterViewInit, OnChanges {
    @Input('eventMode') eventMode = 0;
    @Input('data') data = [];

    @Output('onChange') onChangeSub: EventEmitter<any> = new EventEmitter<any>();
    @Output('onSelect') onSelectSub: EventEmitter<any> = new EventEmitter<any>();
    @Output('onCheckBox') onCheckBox: EventEmitter<ETCheckBoxSelected> = new EventEmitter<ETCheckBoxSelected>();

    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;

    // public eventMode = 1;
    // @Input('eventMode') set setConfig(eventMode) {
    //     debugger
    //     this.eventMode = $.extend(true, this.eventMode, eventMode);
    // }

    versionModalRef: IMFXModalComponent;
    mediaModalRef: IMFXModalComponent;
    titleModalRef: IMFXModalComponent;

    checkBoxSub: Subscription;
    checkBoxSelected: ETCheckBoxSelected = {
        status: false,
        rows: [],
    };

    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: EventTableGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                exportPath: 'Version',
                searchType: 'versions',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false
            } as SlickGridConfigModuleSetups,
            plugin: {
                multiSelect: true,
                rowHeight: 40,
                forceFitColumns: true
            } as SlickGridConfigPluginSetups
        })
    });

    constructor(private cdr: ChangeDetectorRef,
                private notificationRef: NotificationService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private injector: Injector,
                private securityService: SecurityService,
                private eventTableGridProvider: EventTableGridProvider,
                private eventTableViewsProvider: EventTableViewsProvider,
    ) {
    }

    ngOnInit() {
        this.eventTableGridProvider.onRowDelete.subscribe((data) => {
            this.onChangeSub.next(this.getData(true));
        })
    }

    ngOnDestroy() {
        this.eventTableGridProvider.onRowDelete.unsubscribe();
    }

    ngAfterViewInit() {
        // debugger
        this.initTable(this.data);
    }

    ngOnChanges(changes: SimpleChanges) {
        // if (changes.data && changes.data.currentValue) {
        //     this.updateTable(changes.data.currentValue);
        // }
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    onChangeMedia() {
        const mp: IMFXModalProvider = this.injector.get(IMFXModalProvider);
        this.mediaModalRef = mp.showByPath(lazyModules.unattached_media_search_modal, UnattachedMediaSearchModalComponent, {
            name: 'unattached-media-search-modal',
            title: 'media.wizard.title',
            size: 'xl',
            footer: 'cancel|ok'
        }, {});
        this.mediaModalRef.load().then((modal: ComponentRef<ErrorModalComponent>) => {
            const comp: UnattachedMediaSearchModalComponent = this.mediaModalRef.getContent();

            comp.rowDbClicked.subscribe((rowData) => {
                this.mediaModalRef.hide('autohide');
                this.addRowsIntoGrid([rowData]);
            });
            this.mediaModalRef.modalEvents.subscribe((event: IMFXModalEvent) => {
                if (event.name == 'ok') {
                    const sgp: SlickGridProvider = comp.slickGridComp.provider;
                    const sR = sgp.getSelectedRows();
                    this.addRowsIntoGrid(sR);
                    this.mediaModalRef.hide('autohide');
                }
            });
        });
    }

    onChangeTitle() {
        const mp: IMFXModalProvider = this.injector.get(IMFXModalProvider);
        this.titleModalRef = mp.showByPath(lazyModules.titles_search_modal, TitlesSearchModalComponent, {
            name: 'titles-search-modal',
            title: 'titles.wizard.title',
            size: 'xl',
            footer: 'cancel|ok'
        }, {});
        this.titleModalRef.load().then((modal: ComponentRef<ErrorModalComponent>) => {
            const comp: TitlesSearchModalComponent = this.titleModalRef.getContent();

            comp.rowDbClicked.subscribe((rowData) => {
                this.titleModalRef.hide('autohide');
                this.addRowsIntoGrid([rowData]);
            });
            this.titleModalRef.modalEvents.subscribe((event: IMFXModalEvent) => {
                if (event.name == 'ok') {
                    const sgp: SlickGridProvider = comp.slickGridComp.provider;
                    const sR = sgp.getSelectedRows();
                    this.addRowsIntoGrid(sR);
                    this.titleModalRef.hide('autohide');
                }
            });
        });
    }

    onChangeVersions(editVersion = false) {
        const mp: IMFXModalProvider = this.injector.get(IMFXModalProvider);
        this.versionModalRef = mp.showByPath(lazyModules.version_search_modal, VersionSearchModalComponent, {
            name: 'version-search-modal',
            title: editVersion ? 'version.wizard.change' : 'version.wizard.title',
            size: 'xl',
            footer: 'cancel|ok'
        }, {});


        this.versionModalRef.load().then((modal: ComponentRef<ErrorModalComponent>) => {
            const comp: VersionSearchModalComponent = this.versionModalRef.getContent();
            if (editVersion) {
                // @ts-ignore
                comp.searchGridConfig.options.plugin.multiSelect = false;
            }
            console.log(comp);
            comp.rowDbClicked.subscribe((rowData) => {
                this.versionModalRef.hide('autohide');
                this.addRowsIntoGrid([rowData]);
            });
            this.versionModalRef.modalEvents.subscribe((event: IMFXModalEvent) => {
                if (event.name == 'ok') {
                    const sgp: SlickGridProvider = comp.slickGridComp.provider;
                    const sR = sgp.getSelectedRows();
                    this.addRowsIntoGrid(sR);
                    this.versionModalRef.hide('autohide');
                }
            });
        });
    }

    onEditTime() {
        const col = this.eventTableGridProvider.getColumns();
        this.checkBoxSelected.status = !col[0].__deps.data.enabled;

        col[0].__deps.data.enabled = this.checkBoxSelected.status;
        this.eventTableGridProvider.setGlobalColumns(col);
        this.eventTableGridProvider.setDefaultColumns(col, [], true);

        this.cdr.detectChanges();
        if (this.checkBoxSelected.status) {
            this.checkBoxSub = this.eventTableGridProvider.formatterCheckBoxOnChange.subscribe(checkData => {
                if (checkData.value) {
                    this.checkBoxSelected.rows.push(checkData.data.data);
                } else {
                    this.checkBoxSelected.rows = this.checkBoxSelected.rows.filter(el => el.ID !== checkData.data.data.ID);
                }
                this.onCheckBox.next(this.checkBoxSelected);
            })
        } else {
            this.checkBoxSelected.rows = [];
            this.checkBoxSub.unsubscribe();
        }
        this.onCheckBox.next(this.checkBoxSelected);
    }

    updateTable(data: any[] = []) {
        if (this.slickGridComp && this.slickGridComp.provider) {
            data = data.map(row => {
                row['TIMES_MULTI-EDIT'] = false;
                return row;
            })
            this.slickGridComp.provider.buildPageByData((<any>{Data: data}));
        }
    }
    initTable(data) {
        if (this.slickGridComp && this.slickGridComp.provider) {
            let globalColsView = this.eventTableViewsProvider.getCustomColumns();
            this.slickGridComp.provider.setGlobalColumns(globalColsView);
            this.slickGridComp.provider.setDefaultColumns(globalColsView, [], true);
            this.slickGridComp.provider.buildPageByData({Data: data});
        }
    }

    getData(withClear = false) {
        return this.eventTableGridProvider.getData();
    }

    addRowsIntoGrid(data) {
        let newData = [];
        newData = data.map(el => {
            return {
                VERSION_ID: el.ID,
                FULLTITLE: el.FULLTITLE,
                VERSION_NAME: el.VERSION,
                VERSIONID1: el.VERSIONID1,
                OWNERS_text: el.OWNERS_text,
                NEXT_TX_DATE: el.N_TX_DT
            }
        });
        this.updateTable(newData);
        this.onChangeSub.next(this.getData(true));
    }

    clearRows(data) {
        return data.map(row => {
            delete row.id;
            delete row['$id'];
            delete row['__contexts'];
            return row;
        })
    }

}
