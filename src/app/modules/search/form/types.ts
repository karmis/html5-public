/**
 * Created by Sergey Trizna on 06.11.2017.
 */
export type SearchSuggessionType = {
    showAutocompleteDropdown: boolean,
    searching: boolean,
    results?: {
        titles: Array<any>,
        series: Array<any>,
        contributors: Array<any>
    },
    currentItem?: number,
    currentArray?: number,
}