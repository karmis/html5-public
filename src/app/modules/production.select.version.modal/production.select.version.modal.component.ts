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
import { AdvancedCriteriaType } from '../search/advanced/types';
import { ChooseItemModalProvider, MediaTypesWizard } from './providers/choose.item.modal.provider';
import { IMFXControlsLookupsSelect2Component } from '../controls/select2/imfx.select2.lookups';
import { Subject, Subscription } from 'rxjs';
import { SlickGridRowData } from '../search/slick-grid/types';
import { ProductionSelectVersionModalService } from './services/production.select.version.modal.service';
import { IMFXModalProvider } from '../imfx-modal/proivders/provider';
import { lazyModules } from '../../app.routes';
import { VersionAlreadyComponent } from './comps/version.already/version.already.component';
import { ItemTableComponent } from '../choose.item.modal/comps/item.table/item.table.component';
import { ItemTableSlickGridProvider } from '../choose.item.modal/comps/item.table/providers/item.table.slick.grid.provider';


@Component({
    selector: 'production-select-version-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ChooseItemModalProvider,
        ProductionSelectVersionModalService
    ]
})
export class ProductionSelectVersionModalComponent implements AfterViewInit {
    @ViewChild('itemTableGrid', {static: false}) public itemTableGrid: ItemTableComponent;
    @ViewChild('controlUsageTypes', {static: false}) private controlUsageTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlMediaTypeFiles', {static: false}) private controlMediaTypeFiles: IMFXControlsLookupsSelect2Component;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    private modalRef: IMFXModalComponent;
    public routerEventsSubscr: Subscription;
    public typeGrid: 'media'|'versions'|'carriers'|'titles';

    public addedNewItem: Subject<SlickGridRowData[]> = new Subject();
    isValid = false;
    isDoubleClick = false;

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                public provider: ChooseItemModalProvider,
                private router: Router,
                private selectVersionService: ProductionSelectVersionModalService,
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
        this.itemTableGrid.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
            this.isDoubleClick = true;
            this.addMediaToList();
        })
        this.itemTableGrid.slickGridComp.provider.onSelectRow.subscribe((data) => {
            this.isDoubleClick = false;
            this.checkVersions()
        })

    }

    ngOnChanges() {
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    checkVersions() {
        let isValid = true;
        const items = this.itemTableGrid.getSelectedRows();
        items.forEach(version => {
            // @ts-ignore
            if (!version.__CHECK) {
                this.selectVersionService.checkVersion(version.ID).subscribe(data => {
                    // @ts-ignore
                    version.__CHECK = data;
                    if (data.Rows !== 0) {
                        isValid = false;
                        // @ts-ignore
                        // this.itemTableGrid.slickGridComp.provider.removeSelectedRows([version.id]);
                        this.showVersionAlreadyModal(version);
                    }
                })
                // @ts-ignore
            } else if(version.__CHECK.Rows !== 0) {
                // @ts-ignore
                // this.itemTableGrid.slickGridComp.provider.removeSelectedRows([version.id]);
                this.showVersionAlreadyModal(version);
            }

        })
        this.isValid = isValid;
        this.cdr.detectChanges();
    }

    showVersionAlreadyModal(version) {
        if (this.isDoubleClick) {
            return
        }
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.production_version_already, VersionAlreadyComponent, {
            title: 'Version in Productions',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate',

        });
        modal.load().then((cr) => {
            let modalContent: VersionAlreadyComponent = cr.instance;
            modalContent.data = version.__CHECK.Data
            modalContent.version = version
        })
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
            delete el['__CHECK'];
            // @ts-ignore
            delete el.EntityKey;
        })
        this.addedNewItem.next(item);
        this.closeModal();
    }

    getRows(): Array<any> {
        return this.provider.getRows();
    }
}
