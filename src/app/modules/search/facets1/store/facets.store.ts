import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, forkJoin, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { Action, buildAdvanceSearchItems, mergeOnlyFacets, ofType, selectState, getGroupsWithSelectedFacets } from '../utility';
import { exhaustMap, filter, map, publishReplay, refCount, scan, startWith, take, tap, } from 'rxjs/operators';
import { reducer } from './facets.reducer';
import { Facet } from '../models/facet';
import { SearchModel } from '../../../../models/search/common/search';

export interface CustomSearchModel extends SearchModel{
    type: string;
}
// TODO lekaving: it's really bad model but we need to keep legacy work
export interface FacetsState {
    facets: any[];
    selected: any[];
    searchModel: CustomSearchModel;
    toggleAll: boolean;
    info: string;
    newSearch: boolean;
    newSearchFacets: any[];
}

export const defaultState: FacetsState = {
    facets: [],
    selected: [],
    searchModel: null as CustomSearchModel,
    toggleAll: true,
    info: '',
    newSearch: false,
    newSearchFacets: []
};

@Injectable()
export class FacetsStore implements OnDestroy {
    state$: BehaviorSubject<FacetsState> = new BehaviorSubject<FacetsState>(defaultState);
    actions$: Subject<Action> = new Subject<Action>();
    type: any;

    // TODO lekaving: very dirty hack
    searchForm;

    private subscription: Subscription;

    constructor() {
        this.isDevServer && console.log('Facets.Store Init');
        this.subscription = this.initStateStorage();
    }

    private get isDevServer(): boolean {
        return false;
        // return (<any>window).IMFX_VERSION.indexOf('dev') > -1;
    }

    private setFacets$: Observable<Action> =
        this.actions$.pipe(
            ofType('set facets'),
            exhaustMap((payload) => {
                return forkJoin(
                    this.state$.pipe(
                        take(1),
                        map(({facets, newSearch, newSearchFacets}) => ({facets, newSearch, newSearchFacets}))
                    ),
                    of(payload)
                );
            }),
            map(([{facets, newSearch, newSearchFacets}, {payload}]) => {
                // if (payload.isNewSearch) {
                if (newSearch) {
                    this.clearFacets();
                    this.setNewSearchFacetsState(payload);
                    return payload;
                } else if (facets.length) {
                    for (let group of facets) {
                        for (let item of group.Facets) {
                            item.showZero = false;
                        }
                    }
                    // TODO lekaving: add type

                    const selectedGroups = getGroupsWithSelectedFacets(facets);
                    if(selectedGroups.length == 1) {
                        //set facets state with initial state (it's stored in newSearchFacets)
                        facets = mergeOnlyFacets(facets as any, newSearchFacets);
                    }

                    facets = mergeOnlyFacets(facets as any, payload);

                    return facets;
                } else {
                    return payload;
                }
            }),
            map((facets) => {
                facets = facets || [];
                facets.forEach((val) => !val.isClose ? val.isClose = false : val.isClose);
                return facets;
            }),
            map((payload) =>  ({type: 'set facets success', payload})),
        );

    private toggleAll$: Observable<Action> =
        this.actions$.pipe(
            ofType('toggle all'),
            exhaustMap((payload) => forkJoin(
                this.state$.pipe(
                    take(1),
                    map(({facets, toggleAll}) => ({facets, toggleAll}))
                ),
                of(payload))),
            map(([{facets, toggleAll}, {payload}]) => {
                toggleAll = payload !== undefined ? payload.payload : !toggleAll;
                facets.forEach((facet) => {
                    facet.isClose = payload !== undefined ? payload.payload : !toggleAll;
                });
                return [facets, toggleAll];
            }),
            map((payload) => ({type: 'toggle expand success', payload}))
        );

    private toggleFacet$: Observable<Action> =
        this.actions$.pipe(
            ofType('toggle facet'),
            exhaustMap((payload) => forkJoin(this.state$.pipe(take(1), map(({facets}) => facets)), of(payload))),
            map(([facets, {payload}]) => {
                return facets.map((facet) => {
                    const condition = facet.FieldName === payload.FieldName &&
                        facet.FieldId === payload.FieldId &&
                        facet.SearchField === payload.SearchField;
                    if (condition) {
                        facet.isClose = !facet.isClose;
                    }
                    return facet;
                });
            }),
            map((payload) => ({type: 'toggle facet success', payload}))
        );

    private clickFacets$: Observable<Action> =
        this.actions$.pipe(
            ofType('click facets'),
            exhaustMap((payload) => forkJoin(
                this.state$.pipe(
                    take(1),
                    map(({facets, selected}) => ({facets, selected}))
                ),
                of(payload))),
            map(([{facets, selected}, {payload}]) => {
                payload.isSelected = !payload.isSelected ? true : null;
                // TODO lekavign: some legacy code
                // it's not a checking convert to number(like $.isNumeric). It's a checking value to exact represent the number by string.
                const convertCondition = (!isNaN(payload.FieldKey - 0) && ((payload.FieldKey - 0) + '').length === (payload.FieldKey + '').length);
                const resultFieldKey = convertCondition ? parseFloat(payload.FieldKey) : payload.FieldKey;

                const facet = facets.find((val) => val.FieldId.toLowerCase() === payload.Facet.toLowerCase());
                const selectedFacet = selected.find((val) => val.Field === facet.FieldName && val.Facet === payload.Facet && val.value === resultFieldKey);
                const result = [...selected];

                if (!!selectedFacet) {
                    result.splice(result.indexOf(selectedFacet),1);
                } else {
                    result.push({
                        Facet: payload.Facet,
                        dbField: facet.SearchField || payload.Facet,
                        value: resultFieldKey,
                        operator: '=',
                        Field: facet.FieldName,
                        humanValue: payload.Field
                    });
                }

                //for ui show/hide more button
                facet.isSelected = facet.Facets.some(el => el.isSelected) && !facet.Facets.every(el => el.isSelected);

                return result;
            }),
            // tap(() => this.newSearch(false)), // define new search within sgp.afterRequestData
            tap((selected) => this.buildSearchModel(selected)),
            map((payload) => ({type: 'click facets success', payload}))
        );

    private buildSearchModel$: Observable<Action> =
        this.actions$.pipe(
            ofType('build search model'),
            map(({payload}) => {
                const searchModel = this.searchForm.getModel();
                // TODO lekaving: add types
                const advanceItems = buildAdvanceSearchItems(searchModel, payload as any);
                searchModel.addAdvancedItems(advanceItems);
                return searchModel;
            }),
            map((payload) => ({type: 'build search model success', payload}))
        );

    private clearFacets$: Observable<Action> =
        this.actions$.pipe(
            ofType('clear facets'),
            exhaustMap(() => this.state$.pipe(take(1), map(({facets}) => facets))),
            tap((facets) => {
                facets.forEach((fac) => {
                    fac.isSelected = null;
                    fac.Facets.forEach((item) => item.isSelected = null);
                });
            }),
            exhaustMap(() => this.state$.pipe(take(1), map(({newSearch}) => newSearch))),
            // tap((newSearch) => {
            //     if (newSearch) {
            //         this.buildSearchModel([]);
            //     }
            // }),
            map(() => ({type: 'clear facets success'}))
        );

    private setInfo$: Observable<Action> =
        this.actions$.pipe(
            ofType('set info'),
            map(({payload}) => ({type: 'set info success', payload}))
        );

    // @ts-ignore
    private newSearch$: Observable<Action> =
        this.actions$.pipe(
            ofType('new search'),
            map(({payload}) => ({type: 'new search success', payload}))
        );

    private setNewSearchFacetsState$: Observable<Action> =
        this.actions$.pipe(
            ofType('set new search facets state'),
            map(({payload}) => {
                return {type: 'set new search facets state success', payload: $.extend(true, [], payload)};
            })
        );

    private dispatcher$: Observable<Action> =
        merge(
            this.setFacets$,
            this.toggleFacet$,
            this.toggleAll$,
            this.clickFacets$,
            this.buildSearchModel$,
            this.clearFacets$,
            this.setInfo$,
            this.newSearch$,
            this.setNewSearchFacetsState$
        );

    stateObs$: Observable<FacetsState> =
        this.dispatcher$.pipe(
            startWith(defaultState),
            scan(reducer),
            tap((some) => {
                if(this.isDevServer) {
                    console.log('Next State:');
                    console.dir(some);
                    console.groupEnd();
                }
            }),
            publishReplay(1),
            refCount(),
        );

    // @ts-ignore
    facets$: Observable<Facet[]> = this.state$.pipe(selectState('facets'));
    // @ts-ignore
    info$: Observable<string> = this.state$.pipe(selectState('info'));
    // @ts-ignore
    // newSearch$: Observable<boolean> = this.state$.pipe(selectState('newSearch'));
    toggle$: Observable<boolean> =
        this.state$.pipe(map((state: FacetsState) => state.toggleAll));
    // @ts-ignore
    searchModel$: Observable<SearchModel> = this.state$.pipe(
        // @ts-ignore
        selectState('searchModel'),
        filter(state => state !== null),
    );

    setFacets(payload) { this.dispatch({type: 'set facets', payload}); }

    setInfo(payload) { this.dispatch({type: 'set info', payload}); }

    toggleAll(payload?) { this.dispatch({type: 'toggle all', payload}); }

    toggleFacet(payload) { this.dispatch({type: 'toggle facet', payload}); }

    clickFacets(payload) { this.dispatch({type: 'click facets', payload}); }

    buildSearchModel(payload) { this.dispatch({type: 'build search model', payload}); }

    clearFacets() { this.dispatch({type: 'clear facets'}); }

    newSearch(payload) { this.dispatch({type: 'new search', payload}); }

    setNewSearchFacetsState(payload) { this.dispatch({type: 'set new search facets state', payload}); }

    initStateStorage() {
        this.isDevServer && console.log('Facets.Store Init');
        return this.stateObs$.subscribe((data) => {
            this.state$.next(data);
        });
    }

    getState(): FacetsState {
        return this.state$.getValue();
    }

    private dispatch(action: Action): void {
        this.actions$.next(action);
    }

    ngOnDestroy(): void {
        this.actions$.complete();
        this.state$.complete();
        this.subscription.unsubscribe();
    }
}
