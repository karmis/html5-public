import { SearchAdvancedConfig } from '../search.advanced.config';
import {
    AdvancedCriteriaListTypes,
    AdvancedCriteriaObjectsWithModeTypes,
    AdvancedCriteriaType, AdvancedFieldsPreparedObjectType, AdvancedModeTypes,
    AdvancedOperatorsObjectForSelect2Types,
    AdvancedPointerCriteriaType, AdvancedPointerGroupType, AdvancedRESTIdsForListOfFieldsTypes,
    AdvancedSearchDataCriteriaReturnType,
    AdvancedSearchDataForCreatingCriteria, AdvancedSearchGroupRef, AdvancedStructureCriteriaType,
    AdvancedStructureGroupsTypes
} from '../types';
import { Observable } from 'rxjs';
import { SearchTypesType } from '../../../../services/system.config/search.types';
import { AdvancedSearchModel } from '../../../../models/search/common/advanced.search';
import {EventEmitter, Injector} from "@angular/core";
/**
 * Created by Sergey Trizna on 18.10.2017.
 */
export interface SearchAdvancedProviderInterface {
    // new implementation
    onToggle: EventEmitter<boolean>
    injector?: Injector;
    config: SearchAdvancedConfig;
    models: AdvancedCriteriaObjectsWithModeTypes;
    isValidStructureFlag: { 'builder': boolean|null, 'example': boolean };

    /**
     * Clear params for builder
     */
    clearParamsForBuilder(): void;

    /**
     * Clear params for example
     */
    clearParamsForExample(): void;

    /**
     * clear all params
     */
    clearParamsForAll(): void;

    /**
     * Add group
     * @param id
     * @param mode
     * @param struct
     */
    addGroup(
        id: number,
        mode: AdvancedModeTypes,
        struct?: AdvancedSearchDataForCreatingCriteria
    ): void;

    /**
     * Remove group by id
     * @param $event
     */
    removeGroup($event: AdvancedPointerGroupType): void;

    /**
     * Add criteria (and group)
     * @param $event
     * @param struct
     */
    addCriteria(
        $event: AdvancedPointerGroupType,
        struct?: AdvancedSearchDataForCreatingCriteria
    ): void;

    /**
     * Remove criteria
     * @param $event
     */
    removeCriteria($event: AdvancedPointerCriteriaType): void;

    /**
     * Update criteria
     * @param $event
     */
    updateCriteria($event: AdvancedSearchDataCriteriaReturnType): void;

    /**
     * Startup method (preparing all deps)
     */
    init(): Observable<{
        fields: AdvancedFieldsPreparedObjectType,
        operators: AdvancedOperatorsObjectForSelect2Types
    }>;

    /**
     * Return searchType for current view
     */
    getSearchType(): SearchTypesType;

    /**
     * Return current search mode
     */
    getSearchMode(): AdvancedModeTypes;

    /**
     * Return prepared fields and operators
     * @param restId
     */
    getFieldsAndOperators(restId: AdvancedRESTIdsForListOfFieldsTypes): Observable<{
        fields: AdvancedFieldsPreparedObjectType,
        operators: AdvancedOperatorsObjectForSelect2Types
    }>;

    /**
     * Return criteria structure with value of field by number
     * @param struct
     */
    getCriteriaStructure(
        struct?: AdvancedSearchDataForCreatingCriteria
    ): AdvancedStructureCriteriaType;

    /**
     * Get data by mode
     * @param mode
     */
    getDataByMode(mode: AdvancedModeTypes): AdvancedStructureGroupsTypes;

    /**
     * Set data by mode
     * @param data
     * @param mode
     */
    setDataByMode(data: AdvancedStructureGroupsTypes, mode: AdvancedModeTypes): void;

    /**
     * Get model for request
     */
    getModels(): Array<AdvancedSearchModel>;

    /**
     * Build structure use AdvancedSearchGroupRef
     * @param structs
     */
    buildStructure(structs: Array<AdvancedSearchGroupRef>): void;

    /**
     * Validate model by pointer
     * @param pointer
     */
    validateModel(pointer: AdvancedPointerCriteriaType): void;

    /**
     * Is valid current structure
     */
    isValidStructure(): boolean|null;

    /**
     * Validate models by current mode
     */
    validateModels(): void;

    /**
     * Validate builder models
     */
    validateBuilderModels(): void;

    /**
     * Validate example models
     */
    validateExampleModels(): void;

    /**
     * Get models prepared to request
     * @param mode
     */
    getModelsPreparedToRequest(mode?: AdvancedModeTypes): AdvancedCriteriaListTypes;


    /**
     * Convert list of criterias to list of structure
     * @param crits
     * @param _mode
     * @returns {Array<AdvancedSearchGroupRef>}
     */
    turnCriteriasToStructures(
        crits: AdvancedCriteriaListTypes,
        _mode?: AdvancedModeTypes
    ): Array<AdvancedSearchGroupRef>;

    /**
     * Convert criteria to AdvancedSearchDataFromControlType
     * @param crit
     * @returns {{selectedField: string, selectedOperator: string, value: AdvancedSearchDataFromControlType}}
     */
    turnCriteriaToStructure(crit: AdvancedCriteriaType): AdvancedSearchDataForCreatingCriteria;

    /**
     * Is open adv panel
     */
    isOpenPanel(): boolean;

    /**
     * Is advanced search apply?
     */
    withAdvChecking(): boolean;

    /**
     * Open adv panel
     */
    openPanel(): void;

    /**
     * Close adv panel
     */
    closePanel(): void;

    /**
     * Set state for adv panel
     * @param state
     */
    setStateForPanel(state: boolean): void;

    /**
     * Return state for panel
     * @param state
     */
    getStateForPanel(): boolean;

    getIsReady(): boolean;

    /**
     * Set mode for adv
     * @param mode
     */
    setMode(mode: AdvancedModeTypes): void;

    /**
     * Update state for search button
     */
    updateStateForSearchButton(): void;

    onInit(structs: AdvancedSearchGroupRef[]);

    getStructure(): Observable<AdvancedSearchGroupRef[]>;

    sendSubmit();
}
