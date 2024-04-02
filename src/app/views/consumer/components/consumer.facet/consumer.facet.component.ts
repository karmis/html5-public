/**
 * Created by Sergey Klimeko on 09.02.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';

import { AdvancedSearchModel } from '../../../../models/search/common/advanced.search';
import { ConsumerCriteriaModificationType, ConsumerSearchType } from '../../consumer.search.component';
import { ConsumerSearchProvider } from '../../consumer.search.provider';

export type FacetItemType = {
    Count: number,
    Facet: string,
    Field: string,
    FieldKey:string
}

export type FacetType = {
    FacedName: string,
    FacetId: string,
    FacetItems: FacetItemType[],
}

@Component({
    selector: 'consumer-facet-component',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * Consumer item
 */
export class ConsumerFacetComponent {
    @Input() facet: FacetType;
    @Output() selected: EventEmitter<ConsumerCriteriaModificationType[]> = new EventEmitter();

    constructor(public cdr: ChangeDetectorRef,private csp: ConsumerSearchProvider) {
    }

    collectSearchCriteria(facetItem: FacetItemType) {
        const cst: ConsumerSearchType = this.csp.getConsumerSearchType();
        if(!cst || !cst.model || !this.facet){
            return;
        }
        // filed name to beauty  string
        // let beautyFieldName = facetItem.Field&&facetItem.Field != '[none]'?facetItem.Field.replace(/\s\(\d+\)/, ''):facetItem.Facet.toUpperCase();
        // beautyFieldName = this.facet.FacedName + '['+beautyFieldName+']';
        const asm: AdvancedSearchModel = new AdvancedSearchModel({
            DBField: facetItem.Facet,
            Operation: '=',
            Value: facetItem.FieldKey,
            Field: this.facet.FacedName,
        });
        asm.setHumanValue(facetItem.Field);
        const mode = cst.model.hasAdvancedItem(asm)?'remove':'add';
        // this.cdr.detectChanges();
        this.selected.emit([{
            mode: mode,
            model: asm
        } as ConsumerCriteriaModificationType]);
    }

    isActiveFacet(facet: FacetType, item: FacetItemType){
        const cst = this.csp.getConsumerSearchType();
        return cst.model.findAdvancedItem({
            dbField: facet.FacetId, operation: '=', value: item.FieldKey
        }) !== null
    }

    toggleFacet(facet) {
        if(!this.csp.isExpandedFacet(facet)) {
            this.csp.addExpandedFacet(facet)
        } else {
            this.csp.removeExpandedFacet(facet)
        }
        this.cdr.markForCheck();
    }

    clearFacets() {
        this.csp.clearExpandedFacets()
    }

    markForCheck() {
        this.cdr.markForCheck();
    }
}
