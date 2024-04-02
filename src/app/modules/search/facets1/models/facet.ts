export interface FacetItem {
    Count: number | string;
    Field: string;
    FieldKey: string;
    // TODO leka ving: for view ui
    isSelected?: boolean;
    showZero?: boolean;
}

export interface Facet {
    FieldName: string;
    Facets: FacetItem[];
    // TODO leka ving: for view ui
    isClose?: boolean;
    isSelected?: boolean;
}
