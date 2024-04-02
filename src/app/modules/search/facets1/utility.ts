import { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Facet, FacetItem } from './models/facet';
import { SearchModel } from '../../../models/search/common/search';
import { AdvancedSearchModel } from '../../../models/search/common/advanced.search';
import * as _ from 'lodash';

export interface Action<T = any> {
    type: string;
    payload?: T;
}

export function ofType<T extends Action>(type: string): MonoTypeOperatorFunction<T> {
    return filter((_) => type === _.type);
}

export function hasEditedObjectValue(previous: any, current: any) {
    if (Array.isArray(previous) && Array.isArray(current)) {
        return JSON.stringify(previous) === JSON.stringify(current);
    } else if (typeof previous === 'object' && typeof current === 'object') {
        return Object.keys(current).reduce((acc, key) => {
            if (current[key] !== previous[key]) {
                acc = false;
            }
            return acc;
        }, true);
    } else {
        return previous === current;
    }
}

export function selectState<R>(stateName: string): OperatorFunction<string, R> {
    return input$ => input$.pipe(
        map(state => state[stateName]),
        filter(state => state !== null),
        distinctUntilChanged((previous, current) => hasEditedObjectValue(previous, current)),
    );
}

// it's not full merge of all facets. It's merge only inner collection without parent's properties
export const mergeOnlyFacets = (target: Facet[], source: Facet[]) => {
    const arrSelectedGroups = getGroupsWithSelectedFacets(target);

    // refresh Count value for items which are clicked
    for (let selectedFacetGroupTarget of arrSelectedGroups) {
        const facetGroupSource = source.find(sourceFacet => selectedFacetGroupTarget.FieldName == sourceFacet.FieldName);
        if (facetGroupSource) {
            if(!selectedFacetGroupTarget.Facets.some(el => el.isSelected)) {
                selectedFacetGroupTarget.Facets = facetGroupSource.Facets;
            } else {
                for(let facetItemFromTarget of selectedFacetGroupTarget.Facets) {
                    const facetItemFromSource = facetGroupSource.Facets.find((el: FacetItem) => facetItemFromTarget.FieldKey === el.FieldKey);
                    if(facetItemFromSource) {
                        facetItemFromTarget.Count = facetItemFromSource.Count;
                    }
                    else  {
                        if (arrSelectedGroups.length > 1) {
                            facetItemFromTarget.showZero = true;
                        }
                    }
                }
            }
        } else {
            for (let facetGroup of arrSelectedGroups) {
                for (let facetItem of facetGroup.Facets) {
                    if (facetItem.isSelected) {
                        facetItem.Count = 0;
                    }
                }
            }
        }
    }

    // get other (not clicked) groups which are received from server
    const subSource = source.filter((sourceFacet: Facet) => {
        return !arrSelectedGroups.some((selectedFacetGroupTarget: Facet) => {
            return selectedFacetGroupTarget.FieldName == sourceFacet.FieldName
        });
    });

    const result: Facet[] = [...arrSelectedGroups, ...subSource];
    return result;
};

export const getGroupsWithSelectedFacets = (facets: Facet[]) => {
    return facets.filter(el => el.Facets.some(subEl => subEl.isSelected));
};

export const buildAdvanceSearchItems = (searchModel: SearchModel, facets: FacetItem[]): AdvancedSearchModel[] => {
    const advancedItems: AdvancedSearchModel[] = [];
    const formattedFacets = formatFacets(facets);
    formattedFacets.forEach((facet: FacetItem) => {
        const advSearchModel = new AdvancedSearchModel();
        // @ts-ignore
        advSearchModel.setValue(facet.value);
        // @ts-ignore
        advSearchModel.setOperation(facet.operator);
        // @ts-ignore
        advSearchModel.setDBField(facet.dbField);
        advSearchModel.setField(facet.Field);
        // @ts-ignore
        advSearchModel.setHumanValue(facet.humanValue);
        advancedItems.push(advSearchModel);
    });
    return advancedItems;
};

const formatFacets = (facets: FacetItem[]): FacetItem[] => {
    // @ts-ignore
    const sortedFacets = _.cloneDeep(_.sortBy(facets, (facet) => facet.dbField));
    const resultFacets = [];

    // @ts-ignore
    sortedFacets.reduce((prev: FacetItem, next: FacetItem) => {
        if (!Object.keys(prev).length) {
            resultFacets.push(next);
            return next;
        }
        // @ts-ignore
        if (prev.dbField === next.dbField) {
            // @ts-ignore
            const repeatedFacet = _.find(resultFacets, (i) => i.dbField === prev.dbField);
            // @ts-ignore
            repeatedFacet.value = repeatedFacet.value.toString().concat(`|${next.value.toString()}`);
            // @ts-ignore
            repeatedFacet.humanValue = repeatedFacet.humanValue.toString().concat(`|${next.humanValue.toString()}`);
            return next;
        }
        resultFacets.push(next);
        return next;
    }, {});
    return resultFacets;
};
