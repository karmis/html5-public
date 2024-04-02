import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ElementRef,
    EventEmitter,
    Injector, TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ProductionTemplatesService } from './services/service';
import {IMFXModalEvent} from "../../imfx-modal/types";
import {IMFXModalComponent} from "../../imfx-modal/imfx-modal";
import { ProductionTemplateType } from './types';
@Component({
    selector: 'production-templates',
    templateUrl: 'tpl/index.html',
    styleUrls: ['styles/index.scss'],
    providers: [
        ProductionTemplatesService,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductionTemplatesComponent {
    @ViewChild('dataFilter', {static: false}) dataFilter: ElementRef;
    @ViewChild('prodTemplatesTable', {static: false}) prodTemplatesTableEl: ElementRef;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    // public data: any;
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    protected modalRef: IMFXModalComponent;
    protected context;
    protected lookupData: ProductionTemplateType[] = [];
    protected rows;
    protected selectedRow: ProductionTemplateType = null;
    protected filteredRows;
    // protected lastClickedRow: number = undefined;

    // protected returnField;
    protected displayField = 'Name';
    protected primaryKeyField: string = 'ID';

    constructor(
        private injector: Injector,
        private cdr: ChangeDetectorRef,
        private service: ProductionTemplatesService
    ) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.lookupData = d.lookupData;
        this.context = d.context;

        this.rows = this.lookupData;
        this.filteredRows = this.lookupData;
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.scrollToSelected();
        });
    }

    scrollToSelected() {
        const table = this.prodTemplatesTableEl && this.prodTemplatesTableEl.nativeElement || null;
        if (table && this.selectedRow) {
            const i = this.lookupData.indexOf(this.selectedRow);
            const table = this.prodTemplatesTableEl.nativeElement;

            table.scrollTop = ((table.children[0].offsetHeight * i) - table.clientHeight/2);
        }
    }

    closeModal() {
        this.modalRef.hide();
    }

    clearFilter() {
        $(this.dataFilter.nativeElement).val("");
        this.filterData("", 0);
    }

    clearSelection() {
        this.selectedRow = null;
        this.cdr.detectChanges();
    }

    setSelectedRowById(id: any) {
        this.selectedRow = this.rows.find((el) => el.ID == id) || null;
    }

    getSelectedRow() {
        return this.selectedRow;
    }

    filterData(filterValue, timeout = 500) {
        this.filteredRows = this.rows.filter((x) => {
            return x[this.displayField]
                .toString()
                .toLowerCase()
                .includes(filterValue.trim().toLowerCase());
        });
        this.cdr.detectChanges();
    }

    onClickByItem(item, $event, i) {
        this.selectedRow = item;
    }

    onDblClickByItem(item, $event, i) {
        this.modalRef.modalEvents.emit(
            {
                'name': 'ok',
                '$event': $event
            });
    }

    onOk($event) {
        this.modalRef.modalEvents.emit(
            {
                'name': 'ok',
                '$event': $event
            });
    }

    // processRowClick(item, $event, i) {
    //     this.lastClickedRow = i;
    //     if (this.selectedRow == null) {
    //         this.selectedRow = item;
    //     } else {
    //
    //         if (this.selectedRow && this.selectedRow[this.primaryKeyField] == item[this.primaryKeyField]) {
    //             this.selectedRow = null;
    //         } else {
    //             this.selectedRow = item;
    //         }
    //     }
    // }

    // setData(rows, displayField, returnField = null) {
    //     this.returnField = returnField;
    //     this.displayField = displayField;
    //     this.rows = rows;
    //     this.filteredRows = rows;
    //     this.toggleOverlay(false);
    // }
}
