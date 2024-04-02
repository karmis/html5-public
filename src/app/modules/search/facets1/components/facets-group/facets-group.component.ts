import { Component, Input, OnInit } from '@angular/core';
import { Facet, FacetItem } from '../../models/facet';
import { FacetsStore } from '../../store/facets.store';

@Component({
    selector: 'facets-group',
    templateUrl: './facets-group.component.html',
    styleUrls: ['./facets-group.component.scss']
})
export class FacetsGroupComponent implements OnInit {

    @Input() facet: Facet;
    @Input() store: FacetsStore;
    toggleEmpty = true;

    constructor() { }

    toggleFacet() {
        this.store.toggleFacet(this.facet);
    }

    toggleEmptyFacets(event: any): void {
        event.stopPropagation();
        this.toggleEmpty = !this.toggleEmpty;
    }

    ngOnInit() {
    }

    getHideToggleEmptyFacets() {
        const selected = this.store.getState().selected;
        const openedMultiGroup = selected.length > 1 && !selected.every(el => el.Facet == selected[0].Facet);
        const isAllSelected = this.facet.Facets.every(el => el.isSelected);
        const isSomeSelected = this.facet.Facets.some(el => el.isSelected);

        return !isSomeSelected || isAllSelected || !openedMultiGroup;
    }

    getHideFacetItem(item: FacetItem) {
        const selectedFacets = this.store.getState().selected;
        const openedMultiGroup = selectedFacets.length > 1 && !selectedFacets.every(el => el.Facet == selectedFacets[0].Facet);
        const isSomeSelected = this.facet.Facets.some(el => el.isSelected);

        return  isSomeSelected && this.toggleEmpty && (!openedMultiGroup && !item.Count || openedMultiGroup && !item.isSelected);
    }
}
