/**
 * Created by Sergey Trizna on 17.01.2016.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import {LookupSearchLocationService} from '../../../../../../../../../../../../services/lookupsearch/location.service';
import {LocationComponent} from '../../../../../../../../../../location/location';
import {AdvancedSearchDataForControlType, AdvancedSearchDataFromControlType} from '../../../../../../../../../types';
import {SearchAdvancedCriteriaProvider} from '../../../../../../../providers/provider';
import {
    TreeStandardListOfPointersToNodesTypes,
    TreeStandardPointerToNodeType
} from '../../../../../../../../../../../controls/tree/types';
import {IMFXModalProvider} from '../../../../../../../../../../../imfx-modal/proivders/provider';
import {IMFXModalComponent} from '../../../../../../../../../../../imfx-modal/imfx-modal';
import {IMFXModalEvent} from '../../../../../../../../../../../imfx-modal/types';
import { LookupSearchService } from '../../../../../../../../../../../../services/lookupsearch/common.service';
import {lazyModules} from "../../../../../../../../../../../../app.routes";

@Component({
    selector: 'advanced-criteria-control-hierarchical-lookupsearch-location-modal',
    templateUrl: 'tpl/index.html',
    providers: [
        LookupSearchLocationService,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class IMFXAdvancedCriteriaControlHierarchicalLookupSearchLocationModalComponent {
    public data: AdvancedSearchDataForControlType;
    private result: AdvancedSearchDataFromControlType;
    private selectedNodes: any[] = [];
    private modalRef: any;
    private modal: IMFXModalComponent;
    private modalService;


    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider,
                private cdr: ChangeDetectorRef,
                private lookupSearckService: LookupSearchService,
                private modalProvider: IMFXModalProvider) {
        this.data = this.injector.get('data');
    }

    onSelect(nodes: any[]) {
        this.fillResult(nodes);
    }


    fillResult(nodes) {
        this.selectedNodes = nodes;
        let humanValue = [];
        let value = [];
        let dirtyValue: TreeStandardListOfPointersToNodesTypes = [];
        nodes.forEach((obj: any) => {
            dirtyValue.push(<TreeStandardPointerToNodeType>{key: obj.key});
            humanValue.push(obj.title);
            value.push(`${obj.key},${obj.title}`);
        });

        this.result = {
            dirtyValue: dirtyValue,
            value: value.join(';'),
            humanValue: humanValue.join('|')
        };

        this.transferData(<AdvancedSearchDataFromControlType>this.result);
        this.cdr.detectChanges();
    }

    ngAfterViewInit() {
        // set value from recent search
        // if (this.data.criteria.data.value && this.data.criteria.data.value.dirtyValue) {
        //     this.transferData(this.data.criteria.data.value);
        // } else if (this.data.criteria.data.value && this.data.criteria.data.value.value) {
        //     this.getDataAndTransfer(this.data.criteria.data.value.value);
        // }

        if (this.data.criteria.data.value && this.data.criteria.data.value.value) {
            this.getDataAndTransfer(this.data.criteria.data.value.value);
        }

    }

    getDataAndTransfer(val){
        let valArr = this.getIdsFromValue(<string>val);
        this.lookupSearckService.getLookup('locations').subscribe((res: any) => {

            if (!res || res.length == 0)
                return;

            let filterFunc = (el) => {
                return valArr.some((el2) => {
                    return el.ID == el2 - 0;
                });
            };

            let reqursiveFunc = (arr) => {
                let result = arr.filter(filterFunc);
                // if (result.length == 0) {
                    for (let item of arr) {
                        if (item.Children && item.Children !=0) {
                            result = result.concat(reqursiveFunc(item.Children));
                        }
                    }
                // }
                return result;
            };



            let nodes = reqursiveFunc(res).map((el) => {
                return {
                    key: el.ID,
                    title: el.NAM
                }
            });

            this.fillResult(nodes);
        });
    }

    getIdsFromValue(val: string = '') {
        let ids
            ,VRegExp = new RegExp(/[,][^,;]*[;]?/);
        ids = val.split(VRegExp);
        if (ids.indexOf('') != -1) {
            ids.pop(); // exclute last "" elem
        }
        return ids;
    }

    afterViewInit() {
        let self = this;
        let value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        let valueCriteria = this.transfer.data;
        let content: LocationComponent = this.modal.contentView.instance;
        let _ids = [];
        if (value) {
            let dv = value.dirtyValue;
            if (!dv) {
                this.getIdsFromValue(<string>value.value);
            } else {
                $.each(dv, (i, o) => {
                    _ids.push(o.key);
                });
            }
        } else if (valueCriteria) {
            let dv = valueCriteria.dirtyValue;
            $.each(dv, (i, o) => {
                _ids.push(o.key);
            });
        }


        content.onReady.subscribe(() => {
            if (_ids.length !== 0) {
                content.setSelectedByIds(_ids);
                self.onSelect(content.getSelected());
                // content.setCheckboxByObj(content.getSelected());
            }
            content.onSelectEvent.subscribe((selected) => {
                content.setSelectedByObject(selected);
                self.onSelect(selected);
            });

        });




    }

    /**
     * Send data to parent comp
     */
    transferData(res: AdvancedSearchDataFromControlType) {
        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>res);
        this.cdr.markForCheck();
    }

    showModal() {
        let self = this;

        this.modal = this.modalProvider.showByPath(lazyModules.location_module_modal, LocationComponent, {
            size: 'lg',
            class: 'stretch-modal',
            title: 'ng2_components.ag_grid.select_location',
            position: 'center',
            footer: 'ok'
        });
        this.modal.load().then((cr: ComponentRef<LocationComponent>) => {
            this.modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    self.modal.hide();
                }
            });

            this.afterViewInit();
        });
    }

    ngOnDestroy() {
        // this.data.selected = null;
    }
}
