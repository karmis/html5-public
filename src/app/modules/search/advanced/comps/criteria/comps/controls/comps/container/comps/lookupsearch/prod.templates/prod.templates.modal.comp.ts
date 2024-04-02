import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ComponentRef, EventEmitter,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import { AdvancedSearchDataForControlType, AdvancedSearchDataFromControlType } from 'app/modules/search/advanced/types';
import { IMFXModalComponent } from 'app/modules/imfx-modal/imfx-modal';
import { SearchAdvancedCriteriaProvider } from 'app/modules/search/advanced/comps/criteria/providers/provider';
import { IMFXModalProvider } from 'app/modules/imfx-modal/proivders/provider';
import { ProductionTemplatesService } from 'app/modules/search/prod.templates/services/service';
import { lazyModules } from 'app/app.routes';
import { IMFXModalEvent } from 'app/modules/imfx-modal/types';
import { ProductionTemplatesComponent } from 'app/modules/search/prod.templates/prod.templates';
import { ProductionTemplateType } from 'app/modules/search/prod.templates/types';

@Component({
    selector: 'advanced-criteria-control-lookupsearch-production-template-modal',
    templateUrl: 'tpl/index.html',
    providers: [
        ProductionTemplatesService,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IMFXAdvancedCriteriaControlLookupSearchProductionTemplatesModalComponent {
    public data: AdvancedSearchDataForControlType;
    private modal: IMFXModalComponent;
    private result: AdvancedSearchDataFromControlType;
    private selectedRow: ProductionTemplateType = null;
    private onReady: EventEmitter<void> = new EventEmitter<void>();
    private lookupData: ProductionTemplateType[] = null;

    constructor(
        private injector: Injector,
        private transfer: SearchAdvancedCriteriaProvider,
        private cdr: ChangeDetectorRef,
        private ptService: ProductionTemplatesService,
        private modalProvider: IMFXModalProvider
    ) {
        this.data = this.injector.get('data');
    }

    ngAfterViewInit() {
        // set value from recent search
        if (this.data.criteria.data.value && this.data.criteria.data.value.dirtyValue) {
            this.fillResult(this.data.criteria.data.value.dirtyValue);
        } else
        if (this.data.criteria.data.value && this.data.criteria.data.value.value) {
            this.onReady.subscribe(() => {
                this.getDataAndTransfer(this.data.criteria.data.value.value);
            });
        }

        this.ptService.getProductionTemplatesService().subscribe((res: any) => {
            this.lookupData = res;
            this.onReady.emit();
        });
    }

    getDataAndTransfer(val){
        const res = this.lookupData;
        if (!res || res.length == 0)
            return;

        let filterFunc = (el) => {
            return el.ID == val - 0;
        };

        let result = res.find(filterFunc);

        this.fillResult(result);
    }

    fillResult(val: ProductionTemplateType = null) {
        this.selectedRow = val;
        let humanValue = val && val.Name || null;
        let value = val && val.ID || null;
        let dirtyValue = val || null;

        this.result = {
            dirtyValue: dirtyValue,
            value: value,
            humanValue: humanValue
        };

        this.transferData(<AdvancedSearchDataFromControlType>this.result);
        this.cdr.detectChanges();
    }

    /**
     * Send data to parent comp
     */
    transferData(res: AdvancedSearchDataFromControlType) {
        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>res);
        // this.cdr.markForCheck();
    }

    showModal() {
        let self = this;

        this.modal = this.modalProvider.showByPath(lazyModules.prod_templates_modal, ProductionTemplatesComponent, {
            size: 'md',
            title: 'ng2_components.ag_grid.select_prod_template',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {
            compContext: this,
            lookupData: this.lookupData
        });

        this.modal.load().then((cr: ComponentRef<ProductionTemplatesComponent>) => {
            this.selectedRow && cr.instance.setSelectedRowById(this.selectedRow.ID);
            this.modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    const row = cr.instance.getSelectedRow();
                    self.fillResult(row);

                    self.modal.hide();
                }
            });
        })
    }

    ngOnDestroy() {
        // this.data.selected = null;
    }
}
