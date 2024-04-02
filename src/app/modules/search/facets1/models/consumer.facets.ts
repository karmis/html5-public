// TODO lekaving: split and serialize two interface for REST and for
// TODO lekaving: serialize all properties to string

// TODO lekaving: remove legacy
export interface Facet {
    FieldId?: string; // "media_type"
    FieldName?: string; // "Media Type"
    SearchField?: string; // "MEDIA_TYPE_text";
    Facets?: FacetItem[];
    _isOpen?: boolean; // legacy
    _selected?: boolean; // legacy
    height?: number; // legacy
}

// TODO lekaving: fix unnecessary prop
// TODO lekaving: remove _modify
export interface FacetItem {
    dbField?: string; // "SER_EP_NUM"
    humanValue?: string; // "2"
    operator?: string; // "="
    value?: string | number; // 'some | some | some'
    Count?: number | string; // 455
    Facet?: string;
    Field?: string;
    FieldKey?: string;
    _selected?: boolean; // legacy
    _modify?: boolean;
}

// TODO lekaving: it's dirty hack
export const convertPropertyToString = (prop) => {
    return typeof prop === 'number' ? prop.toString() : prop;
};

export interface ConsumerSearchFacets {
    FacetItems: FacetItem[];
    FacedName: string;
    FacetId: string;
}

export const facetConsumerMapper = (consumerFacets: ConsumerSearchFacets[]): Facet[] => {
    consumerFacets.map((facet) => {
        Object.keys(facet).forEach((key) => {
            if (key === 'FacedName') {
                facet['FieldName'] = facet[key];
                delete facet[key];
            } else if (key === 'FacetItems') {
                facet['Facets'] = facet[key];
                delete facet[key];
            } else if (key === 'FacetId') {
                facet['FieldId'] = facet[key];
                delete facet[key];
            }
        });
    });
    return consumerFacets as Facet[];
};
