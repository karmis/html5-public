import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {IMFXModalComponent} from '../../imfx-modal/imfx-modal';
import {IMFXModalEvent} from '../../imfx-modal/types';

@Component({
    selector: 'choosing-rows-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class ChoosingRowsModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('dataFilter', {static: false}) dataFilter: ElementRef;
    @ViewChild('modalDataOverlayWrapper', {static: true}) protected modalOverlayWrapper: ElementRef;
    protected isSelectAll: boolean = false;
    protected isSelectedAll: boolean = false;
    protected isMultiSelect: boolean = true;
    protected modalRef: IMFXModalComponent;
    protected returnField;
    protected displayField;
    protected rows;
    protected filteredRows;
    protected context;
    protected inputTimeout;
    protected selectedRows = [];
    protected lastClickedRow: number = undefined;
    protected primaryKeyField: string = 'ID';

    constructor(protected injector: Injector,
                protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;
        this.isSelectAll = (typeof d.isSelectAll == 'boolean') ? d.isSelectAll : this.isSelectAll;
        this.isSelectedAll = (typeof d.isSelectedAll == 'boolean') ? d.isSelectedAll : this.isSelectedAll;
        this.isMultiSelect = (typeof d.isMultiSelect == 'boolean') ? d.isMultiSelect : this.isMultiSelect;
        this.primaryKeyField = (typeof d.primaryKeyField == 'string') ? d.primaryKeyField : this.primaryKeyField;
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.toggleOverlay(true);
        this.dataFilter.nativeElement.focus();
    }

    closeModal() {
        this.modalRef.hide();
    }

    clearFilter() {
        $(this.dataFilter.nativeElement).val("");
        this.filterData("", 0);
    }

    filterData(filterValue, timeout = 500) {
        //clearTimeout(this.inputTimeout);
        //this.inputTimeout = setTimeout(() => {
        this.filteredRows = this.rows.filter((x) => {

            return x[this.displayField].toString().toLowerCase().includes(filterValue.trim().toLowerCase());
        });
        this.cd.detectChanges();
        //}, timeout);
    }

    setData(rows, displayField, returnField = null) {
        this.returnField = returnField;
        this.displayField = displayField;
        this.rows = rows;
        this.filteredRows = rows;
        this.toggleOverlay(false);
    }

    clearSelection() {
        this.selectedRows = [];
    }

    processRowClick(item, $event, i) {
        if (this.isSelectedAll === true) {
            this.changeIsSelectedAll(false);
        }

        if (this.isMultiSelect && $event.shiftKey) {
            let selRows = [];
            if (this.lastClickedRow > i) {
                selRows = this.selectedRows.length > 0 ? this.selectedRows.slice(0, 1) : this.selectedRows;
                this.selectedRows = selRows.concat(this.rows.slice(i, this.lastClickedRow));
            } else {
                selRows = this.selectedRows.length > 0 ? this.selectedRows.slice(this.selectedRows.length, 1) : this.selectedRows;
                this.selectedRows = selRows.concat(this.rows.slice(this.lastClickedRow, i + 1));
            }


            return;
        }
        this.lastClickedRow = i;
        if (this.selectedRows.length == 0) {
            this.selectedRows.push(item);
        } else {
            if (this.isMultiSelect && ($event.ctrlKey || $event.metaKey)) {
                if (this.selectedRows.indexOf(item) > -1) {
                    this.selectedRows.splice(this.selectedRows.indexOf(item), 1);
                } else {
                    this.selectedRows.push(item)
                }
            } else {
                if (this.selectedRows.length == 1 && this.selectedRows[0][this.primaryKeyField] == item[this.primaryKeyField]) {
                    this.selectedRows = [];
                } else {
                    this.selectedRows = [];
                    this.selectedRows.push(item);
                }
            }
        }
    }

    saveData() {
        this.toggleOverlay(true);
        if (this.isSelectedAll === true) {
            this.modalRef.modalEvents.emit(<IMFXModalEvent>{
                name: 'isSelectedAll',
                state: this.isSelectedAll
            })
        } else {
            if (this.returnField != null) {
                this.modalRef.emitClickFooterBtn('ok', this.selectedRows.map(field => field[this.returnField]));
            } else {
                this.modalRef.emitClickFooterBtn('ok', this.selectedRows);
            }
        }

        this.closeModal();
    }

    changeIsSelectedAll(isSelectedAll) {
        this.isSelectedAll = isSelectedAll;
        if (this.isSelectedAll === true) {
            this.selectedRows = this.rows;
        } else {
            this.selectedRows = [];
        }
    }

    setSelectedRows(rows: any[]) {
        this.selectedRows = rows;
    }

    getSelectedRowById(Id) {
        return this.selectedRows.find(el => el[this.primaryKeyField] == Id);
    }
}
