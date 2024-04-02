import {FacetsState} from './facets.store';
import {Action} from '../utility';

const isDevServer = (() => {
    return false;
    // return (<any>window).IMFX_VERSION.indexOf('dev') > -1;
})();

export const reducer = (state: FacetsState, action: Action): FacetsState => {
    if (isDevServer) {
        console.group(`Action - ${action.type}`);
        console.log('Payload');
        console.dir(action.payload);
        console.log('Prev State:');
        console.dir(state);
    }

    switch (action.type) {
        case 'set facets':
        case 'set facets success':
            return {
                ...state,
                facets: action.payload
            };
        case 'toggle expand':
        case 'toggle expand success':
            return {
                ...state,
                facets: action.payload[0],
                toggleAll: action.payload[1]
            };
        case 'toggle facet':
        case 'toggle facet success':
            return {
                ...state,
                facets: action.payload
            };
        case 'click facets':
        case 'click facets success':
            return {
                ...state,
                selected: action.payload
            };
        case 'build search model':
        case 'build search model success':
            return {
                ...state,
                searchModel: action.payload
            };
        case 'clear facets':
        case 'clear facets success':
            return {
                ...state,
                selected: []
            };
        case 'set info':
        case 'set info success':
            return {
                ...state,
                info: action.payload
            };
        case 'new search':
        case 'new search success':
            return {
                ...state,
                newSearch: action.payload
            };
        case 'set new search facets state':
        case 'set new search facets state success':
            return {
                ...state,
                newSearchFacets: action.payload
            };
        default:
            return state;
    }
};
