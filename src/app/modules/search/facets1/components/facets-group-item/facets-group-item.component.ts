import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Facet, FacetItem } from '../../models/facet';
import { FacetsStore } from '../../store/facets.store';

@Component({
    selector: 'facets-group-item',
    templateUrl: './facets-group-item.component.html',
    styleUrls: ['./facets-group-item.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FacetsGroupItemComponent implements OnInit {

    @Input() item: FacetItem;
    @Input() group: Facet;
    @Input() store: FacetsStore;

    constructor() { }

    onClick() {
        this.store.clickFacets(this.item);
    }

    ngOnInit() {
    }

    getItemCount(item: FacetItem) {
        const selected = this.store.getState().selected;

        const openedMultiGroup = selected.length > 1 && !selected.every(el => el.Facet == selected[0].Facet);
            // this.store.getState().facets
            // .filter((el) => {
            //     return el.Facets.some(subEl => subEl.isSelected);
            // }).length > 1;
        const isSomeSelected = this.group.Facets.some(el => el.isSelected);

        return (openedMultiGroup && !item.isSelected && isSomeSelected)
            ? '?'
            : !!item.showZero
                ? '0'
                : item.Count;
    }
}
