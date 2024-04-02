import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ConfigTablesService} from "./services/settings.config-tables.service";
import {Subject, Subscriber} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ViewsProvider} from "../../../../../modules/search/views/providers/views.provider";
import {CommonTablesGridViewsProvider} from "../common.tables.grid/providers/views.provider";
import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {CommonTablesSlickGridProvider} from "../common.tables.grid/providers/slick.grid.provider";
import {CommonTablesGridComponent} from "../common.tables.grid/common.tables.grid.component";

@Component({
    selector: 'settings-config-tables-wrapper',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ConfigTablesService,
        {provide: ViewsProvider, useClass: CommonTablesGridViewsProvider},
        {provide: SlickGridProvider, useClass: CommonTablesSlickGridProvider},
    ]
})

export class SettingsConfigTablesComponent implements OnInit {

    @ViewChild('tablesFilter', {static: false}) tablesFilter: ElementRef;
    private configTablesIdList = [];
    private selectedTable = null;
    private filteredTables = [];
    private destroyed$: Subject<any> = new Subject<any>();
    @ViewChild('overlayTables', {static: true}) private overlayTables: any;
    @ViewChild('overlayTablesTarget', {static: true}) private overlayTablesTarget: ElementRef;
    @ViewChild('commonTablesGridComponent', {static: true}) private commonTablesGridComponent: CommonTablesGridComponent;


    constructor(private cdr: ChangeDetectorRef,
                private tablesService: ConfigTablesService) {
        this.filteredTables = this.configTablesIdList;
    };

    ngOnInit() {
        this.overlayTables.show(this.overlayTablesTarget.nativeElement);
        this.tablesService.getConfigTables().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            for (let item in res) {
                this.configTablesIdList.push(res[item]);
            }
            this.cdr.detectChanges();
            this.overlayTables.hide(this.overlayTablesTarget.nativeElement);
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    };

    selectConfigTable(tableId) {
        this.selectedTable = tableId;
        this.doSelect(tableId);
    }

    filterTables(filter) {
        this.filteredTables = this.configTablesIdList.filter(x => {
            return x.Label.toLowerCase().includes(filter.trim().toLowerCase())
        });
    }

    clearTablesFilter() {
        $(this.tablesFilter.nativeElement).val("");
        this.filterTables("");
    }

    getConfigTable(tableId, isReload = false) {
        this.selectedTable = tableId;
        this.commonTablesGridComponent.getTableAsync(
            this.tablesService.getConfigTable(tableId).map(res => res),
            isReload
        );
    }

    doSelect(tableId) {
        this.commonTablesGridComponent.breakRequest();
        this.getConfigTable(tableId);
    }

    onModalOk($event) {
        this.getConfigTable(this.selectedTable, true);
    }

    onDeleteItem($event) {
        const itemToDelete = $event.itemToDelete;
        const observer: Subscriber<any> = $event.observer;

        // observer.next([]);
        // return;
        this.tablesService.changeConfigTableItem(this.selectedTable, itemToDelete).subscribe((res: any) => {
            observer.next(res);
            observer.complete();
            this.getConfigTable(this.selectedTable);
        }, (err) => {
            observer.error(err);
        }, () => {
            observer.complete();
        });
    }

    onChangeItem($event) {
        const itemToSave = $event.itemToSave;
        const observer: Subscriber<any> = $event.observer;

        // observer.next([]);
        // return;
        this.tablesService.changeConfigTableItem(this.selectedTable, itemToSave).subscribe((res: any) => {
            observer.next(res);
            observer.complete();
            this.getConfigTable(this.selectedTable);
        }, (err) => {
            observer.error(err);
        }, () => {
            observer.complete();
        });
    }
}
