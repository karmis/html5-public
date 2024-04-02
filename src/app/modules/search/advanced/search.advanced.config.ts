/**
 * Created by Sergey Trizna on 15.03.2017.
 */
import { SearchAdvancedService } from './services/search.advanced.service';
import {
    AdvancedModeTypes,
    AdvancedRESTIdsForListOfFieldsTypes,
    AdvancedSearchSettingsCommonData,
    AdvancedStructureGroupsTypes
} from './types';
import { SearchAdvancedProvider } from './providers/search.advanced.provider';

export class SearchAdvancedSettings {
    /**
     * Service for working module
     */
    service?: SearchAdvancedService;

    enabledSavedSearches?: boolean;
    /**
     * Provider for working with module
     */
    provider?: SearchAdvancedProvider;

    /**
     * Enabled query by example
     */
    enabledQueryByExample?: boolean;

    /**
     * Enable query builder
     */
    enabledQueryBuilder?: boolean;

    /**
     * Enable add group button for creating several groups
     */
    enabledAddMultipleGroups?: boolean;

    /**
     * Advanced search active mode
     */
    advancedSearchMode?: AdvancedModeTypes;

    /**
     * Data for query builder
     */
    builderData?: AdvancedStructureGroupsTypes;

    /**
     * Data for query by example
     */
    exampleData?: AdvancedStructureGroupsTypes;

    /**
     * Common data for adv
     */
    commonData?: AdvancedSearchSettingsCommonData;
    // commonData?: any = {
    //
    //     // criteriaModelStandard: { // standard model of criteria
    //     //     id: 0,
    //     //     data: {
    //     //         name: null,
    //     //         lookupType: '',
    //     //         lookupSearchType: '',
    //     //         operators: [],
    //     //         operator: {
    //     //             id: 0,
    //     //             text: ''
    //     //         },
    //     //         value: null
    //     //     }
    //     // }
    // };

    /**
     * Rest id for search info
     */
    restIdForParametersInAdv: AdvancedRESTIdsForListOfFieldsTypes;

    /**
     * State of adv panel (opened/closed)
     */
    isOpen?: boolean;

    buildExampleUIByModel?: boolean;
    buildBuilderUIByModel?: boolean;
    allowSaveSearchParams?: boolean;
    allowClearSearchParams?: any;
}

export class SearchAdvancedConfig {
    /**
     * Context of top component
     */
    public componentContext: any;

    public moduleContext?: any;

    /**
     * Model of settings
     * @type {{}}
     */
    public options: SearchAdvancedSettings = {
        allowClearSearchParams: undefined,
        allowSaveSearchParams: false,
        enabledSavedSearches: true,
        restIdForParametersInAdv: '',
        isOpen: false
    };
}
