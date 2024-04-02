import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Inject,
    Injector,
    TemplateRef,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/services/notification.service';
import { ItemTableComponent } from './comps/item.table/item.table.component';
import { AdvancedCriteriaType } from '../search/advanced/types';
import { ChooseItemModalProvider, MediaTypesWizard } from './providers/choose.item.modal.provider';
import { IMFXControlsLookupsSelect2Component } from '../controls/select2/imfx.select2.lookups';
import { Subject, Subscription } from 'rxjs';
import { ItemTableSlickGridProvider } from './comps/item.table/providers/item.table.slick.grid.provider';
import { SlickGridRowData } from '../search/slick-grid/types';


@Component({
    selector: 'choose-item-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ChooseItemModalProvider
    ]
})
export class ChooseItemModalComponent implements AfterViewInit {
    @ViewChild('itemTableGrid', {static: false}) public itemTableGrid: ItemTableComponent;
    @ViewChild('controlUsageTypes', {static: false}) private controlUsageTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlMediaTypeFiles', {static: false}) private controlMediaTypeFiles: IMFXControlsLookupsSelect2Component;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    private modalRef: IMFXModalComponent;
    public routerEventsSubscr: Subscription;
    public typeGrid: 'media' | 'versions' | 'carriers' | 'titles' | 'series' | 'source' | 'production';

    public addedNewItem: Subject<SlickGridRowData[]> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                public provider: ChooseItemModalProvider,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        // @ts-ignore
        if(this.modalRef._data.data.IsDoubleSelected) {
            // @ts-ignore
            this.itemTableGrid.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
                this.addMediaToList();
            })
        }
        // @ts-ignore
        if(this.modalRef._data.data.isDisabledMultiSelected) {
            // @ts-ignore
            this.itemTableGrid.searchGridConfig.options.plugin.multiSelect = false;
        }
    }

    ngOnChanges() {
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    onShow() {
        this.itemTableGrid.getSearchGridProvider().buildPage(this.provider.getSearchModel());
        (<ItemTableSlickGridProvider>this.itemTableGrid.slickGridComp.provider).models = this.provider.models;
    }

    /**
     * Update model by field
     * @param field
     * @param value
     */
    updateModel(field, value, select2Control?: string): void {
        if (select2Control) {
            value = this[select2Control].getSelected().join('|');
        }
        this.provider.updateModel(field, value);
        this.itemTableGrid.getSearchGridProvider().buildPage(this.provider.getSearchModel());
    }

    /**
     * Get model by field
     * @param field
     * @returns {AdvancedCriteriaType}
     */
    getModel(field): AdvancedCriteriaType {
        return this.provider.getModel(field);
    }

    /**
     * Get available media types
     * @returns {VersionMediaTypesWizard}
     */
    getMediaTypes(): MediaTypesWizard {
        return this.provider.getMediaTypes();
    }

    /**
     * Hide modal
     */
    closeModal() {
        this.modalRef.hide();
        this.provider.modalIsOpen = false;
    }

    /**
     * Hide modal
     */
    showModal() {
        this.provider.showModal();
    }

    addMediaToList() {
        const item = this.itemTableGrid.getSelectedRows();
        item.map(el => {
            delete el['id']
            delete el['$id']
            delete el['__contexts'];
            // @ts-ignore
            delete el.EntityKey;
        })
        this.addedNewItem.next(item);
        // @ts-ignore
        if (this.modalRef._data.data.isDisabledAutoClose !== true) {
            this.closeModal();
        }
    }

    getRows(): Array<any> {
        return this.provider.getRows();
    }
}
