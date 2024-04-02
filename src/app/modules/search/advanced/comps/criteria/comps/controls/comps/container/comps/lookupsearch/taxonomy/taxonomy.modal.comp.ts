/**
 * Created by Sergey Trizna on 22.11.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ComponentRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    LookupSearchLocationService
} from '../../../../../../../../../../../../services/lookupsearch/location.service';
import { LocationComponent } from '../../../../../../../../../../location/location';
// import { ModalConfig } from '../../../../../../../../../../../modal/modal.config';
import {
    AdvancedSearchDataForControlType,
    AdvancedSearchDataFromControlType
} from '../../../../../../../../../types';
import { SearchAdvancedCriteriaProvider } from '../../../../../../../providers/provider';
import {
    TreeStandardListOfPointersToNodesTypes,
    TreeStandardPointerToNodeType
} from '../../../../../../../../../../../controls/tree/types';
// import { ModalComponent } from '../../../../../../../../../../../modal/modal';
import { TaxonomyComponent } from '../../../../../../../../../../taxonomy/taxonomy';
import { TaxonomyService } from '../../../../../../../../../../taxonomy/services/service';
import { IMFXModalProvider } from '../../../../../../../../../../../imfx-modal/proivders/provider';
import { IMFXModalEvent } from '../../../../../../../../../../../imfx-modal/types';
import { IMFXModalComponent } from '../../../../../../../../../../../imfx-modal/imfx-modal';
import {lazyModules} from "../../../../../../../../../../../../app.routes";

@Component({
    selector: 'advanced-criteria-control-hierarchical-lookupsearch-taxonomy-modal',
    templateUrl: 'tpl/index.html',
    providers: [
        TaxonomyService,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IMFXAdvancedCriteriaControlHierarchicalLookupSearchTaxonomyModalComponent {
    public data: AdvancedSearchDataForControlType;
    private modal: IMFXModalComponent;
    private result: AdvancedSearchDataFromControlType;
    private selectedNodes: any[] = [];

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider,
                private cdr: ChangeDetectorRef,
                private taxonomyService: TaxonomyService,
                private modalProvider: IMFXModalProvider) {
        this.data = this.injector.get('data');
    }

    private selected: any[] = [];
    onSelect(nodes: any[] = []) {
        this.selectedNodes = nodes;
        // this.fillResult(nodes);
    }

    fillResult(nodes) {
        this.selectedNodes = nodes;
        let humanValue = [];
        let value = [];
        let dirtyValue: TreeStandardListOfPointersToNodesTypes = [];
        this.selectedNodes.forEach((obj: any) => {
            dirtyValue.push(<TreeStandardPointerToNodeType>{key: obj.key});
            humanValue.push(obj.title);
            value.push(obj.key);
        });

        this.result = {
            dirtyValue: dirtyValue,
            value: value.join('|'),
            humanValue: humanValue.join('|')
        };

        this.transferData(<AdvancedSearchDataFromControlType>this.result);

        this.cdr.detectChanges();
    }

    ngAfterViewInit() {
        // set value from recent search
        if (this.data.criteria.data.value && this.data.criteria.data.value.value) {
            this.getDataAndTransfer(this.data.criteria.data.value.value);
        }
        // if (this.data.criteria.data.value && this.data.criteria.data.value.dirtyValue) {
        //     this.transferData(this.data.criteria.data.value.dirtyValue);
        //
        // } else if (this.data.criteria.data.value && this.data.criteria.data.value.value) {
        //     this.getDataAndTransfer(this.data.criteria.data.value.value);
        // }
    }

    getDataAndTransfer(values){
        const vals: number[] = values.split('|').map((v) => {
            return parseInt(v);
        });
        this.taxonomyService.getTaxonomy().subscribe((res: any) => {

            if (!res || res.length == 0)
                return;

            const nodes = [];
            vals.forEach((val) => {
                let recursiveFunc = (arr) => {
                    let result = arr.Children.filter((el) => {
                        return el.ID == val;
                    });
                    if (result.length == 0) {
                        for (let item of arr.Children) {
                            if (item.Children && item.Children !=0) {
                                result = result.concat(recursiveFunc(item));
                            }
                        }
                    }

                    return result;
                };
                nodes.push(recursiveFunc(res[0]).map((el) => {
                    return {
                        key: el.ID,
                        title: el.Name
                    }
                }));
            })

            this.fillResult(nodes.map((nodeArr) => {return nodeArr[0];}));
        });
    }


    afterViewInit() {
        const value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        const content: LocationComponent = this.modal.contentView.instance;
        const _ids = this.selectedNodes.map((node) => node.key);
        if (value) {
            // let dv = value.dirtyValue;
            // if (!dv) {
            //     _ids = (<string>value.value).split('|');
            // } else {
            //     $.each(dv, (i, o) => {
            //         _ids.push(o.key);
            //     });
            // }

            content.onReady.subscribe(() => {
                content.setSelectedByIds(_ids);
                // this.onSelect(this.selectedNodes);
            });
        }
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

        this.modal = this.modalProvider.showByPath(lazyModules.taxonomy_modal, TaxonomyComponent, {
            size: 'lg',
            class: 'stretch-modal',
            title: 'ng2_components.ag_grid.select_value',
            position: 'center',
            footer: 'ok'
        }, {compContext: this, classes: 'adv-modal-taxonomy'});

        this.modal.load().then((cr: ComponentRef<TaxonomyComponent>) => {
            const content = cr.instance as TaxonomyComponent;
            this.modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.fillResult(content.tree.getSelected());
                    self.modal.hide();
                }
            });

            this.afterViewInit();
        })
    }

    ngOnDestroy() {
        // this.data.selected = null;
    }
}
