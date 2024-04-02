/**
 * Created by Sergey Klimenko on 08.03.2017.
 */
import * as $ from "jquery";
import {EventEmitter, Injectable, Injector} from "@angular/core";
import {SearchAdvancedConfig} from "../search.advanced.config";
import {AdvancedSearchModel} from "../../../../models/search/common/advanced.search";
import {SearchTypesType} from "../../../../services/system.config/search.types";
import {
    AdvancedCriteriaListTypes,
    AdvancedCriteriaObjectsWithModeTypes,
    AdvancedCriteriaRestoreType,
    AdvancedCriteriaType,
    AdvancedFieldsPreparedObjectType,
    AdvancedFieldType,
    AdvancedGroupListTypes,
    AdvancedModeTypes,
    AdvancedOperatorsObjectForSelect2Types,
    AdvancedPointerCriteriaType,
    AdvancedPointerGroupType,
    AdvancedRESTIdsForListOfFieldsTypes,
    AdvancedSearchDataCriteriaReturnType,
    AdvancedSearchDataForCreatingCriteria,
    AdvancedSearchDataFromControlType,
    AdvancedSearchGroupRef,
    AdvancedStructureCriteriaDataType,
    AdvancedStructureCriteriaType,
    AdvancedStructureGroupsTypes,
    AdvancedStructureGroupType
} from "../types";
import {forkJoin, Observable} from 'rxjs';
import {Select2ItemType, Select2ListTypes} from "../../../controls/select2/types";
import {isUndefined} from "util";
import {CoreSearchComponent} from "../../../../core/core.search.comp";
import {SearchViewsComponent} from "../../views/views";
import {takeUntil} from 'rxjs/operators';

@Injectable()
export class SearchAdvancedProvider {
    public onToggle: EventEmitter<boolean> = new EventEmitter();
    // new implementation
    config: SearchAdvancedConfig;
    isValidStructureFlag = {
        'builder': null,
        'example': false
    };

    constructor(public injector?: Injector) {
    }

    private _models: AdvancedCriteriaObjectsWithModeTypes = {};

    get models(): AdvancedCriteriaObjectsWithModeTypes {
        return this._models;
    }

    set models(value: AdvancedCriteriaObjectsWithModeTypes) {
        this._models = value;
    }

    onInit(structs: AdvancedSearchGroupRef[]) {
        // overwrite
    }

    getStructure(): Observable<AdvancedSearchGroupRef[]> {
        return new Observable((observer: any) => {
            let data: AdvancedSearchGroupRef[] = this.config.options.service.getStructure();
            observer.next(data);
            observer.complete();
        });
    }

    /**
     * Add group
     * @param id
     * @param mode
     */
    addGroup(id: number = null,
             mode: AdvancedModeTypes = 'builder',
             struct?: AdvancedSearchDataForCreatingCriteria): void {
        let data = this.getDataByMode(mode);
        let groupId = data.groups.length;
        if (id === null) {
            id = groupId;
        }
        let crits = [];
        // if (!struct) {
        //     struct = this.defaultStructForCriteria;
        // }
        let crit: AdvancedStructureCriteriaType = this.getCriteriaStructure(struct);
        if (crit && crit.data && $.isEmptyObject(crit.data.field)) {
            return;
        }
        crits.push(crit);
        data.groups.push({
            id: id,
            criterias: crits
        });
    }

    /**
     * Add criteria (and group)
     * @param $event
     * @param struct
     */
    addCriteria($event: AdvancedPointerGroupType,
                struct?: AdvancedSearchDataForCreatingCriteria): void {
        let data = this.getDataByMode($event.mode);
        let groups = data.groups;

        if (!groups[$event.groupId]) {
            this.addGroup($event.groupId, $event.mode, struct);
        } else {
            // if (!struct) {
            //     struct = this.defaultStructForCriteria;
            // }
            let crit: AdvancedStructureCriteriaType = this.getCriteriaStructure(struct);
            if (crit && crit.data && $.isEmptyObject(crit.data.field)) {
                return;
            }
            let group = groups[$event.groupId];
            crit.id = group.criterias.length;
            group.criterias.push(crit);
            let critPointer: AdvancedPointerCriteriaType = {
                groupId: $event.groupId,
                mode: $event.mode,
                criteriaId: crit.id
            };
            critPointer.criteriaId = crit.id;
            this.validateModels();
            // this.config.moduleContext.updateViewReferences();
        }
    }

    /**
     * Remove group by id
     * @param $event
     * @param fromCrit
     */
    removeGroup($event: AdvancedPointerGroupType, fromCrit: boolean = false): void {
        // clear struct
        let data = this.getDataByMode($event.mode);
        let groups = data.groups;
        groups.splice($event.groupId, 1);
        if (this._models[$event.mode] && this._models[$event.mode][$event.groupId]) {
            delete this._models[$event.mode][$event.groupId];
        }
        groups.forEach((el: AdvancedStructureGroupType, idx) => {
            if (parseInt((el.id as string)) !== idx) {
                this._models[$event.mode][idx] = $.extend(true, {}, this._models[$event.mode][el.id]);
                $.each(this._models[$event.mode][idx], (k, crit) => {
                    crit.GroupId = idx;
                });
                delete this._models[$event.mode][el.id];
                el.id = idx;
            }
        });
        this.updateStateForSearchButton();
        this.validateModels();
    }

    /**
     * Remove criteria
     * @param $event
     */
    removeCriteria($event: AdvancedPointerCriteriaType): void {
        let data = this.getDataByMode($event.mode);
        let groups = data.groups;
        let group = groups[$event.groupId];
        if (group) {
            group.criterias.splice(group.criterias.indexOf($event.criteria), 1);
            if (this._models[$event.mode]
                && this._models[$event.mode][$event.groupId]
                && this._models[$event.mode][$event.groupId][$event.criteriaId]) {
                delete this._models[$event.mode][$event.groupId][$event.criteriaId];
            }
            group.criterias.forEach((el, idx) => {
                if (el.id !== idx && this._models[$event.mode]) {
                    this._models[$event.mode][$event.groupId][idx] = $.extend(
                        true,
                        {},
                        this._models[$event.mode][$event.groupId][el.id]
                    );
                    if (this._models[$event.mode][$event.groupId] && this._models[$event.mode][$event.groupId][el.id]) {
                        delete this._models[$event.mode][$event.groupId][el.id];
                    }

                    el.id = idx;
                }

            });
            if (group.criterias.length === 0) {
                this.removeGroup({
                    groupId: $event.groupId,
                    mode: $event.mode,
                });

            }
            // this.config.moduleContext.updateViewReferences();
        }

        this.validateModels();
    }

    /**
     * Update criteria
     * Fired every time on change criteria
     * @param $event
     */
    updateCriteria($event: AdvancedSearchDataCriteriaReturnType): void {
        let advModel = new AdvancedSearchModel();
        let updatedCriteriaModel = $event.model;
        let updatedCriteriaData = $event.data;
        advModel.setDBField(updatedCriteriaModel.DBField);
        advModel.setField(updatedCriteriaModel.Field);
        advModel.setOperation(updatedCriteriaModel.Operation);
        advModel.setGroupId(updatedCriteriaModel.GroupId);
        if (updatedCriteriaData) {
            advModel.setValue(updatedCriteriaModel.Value);
            advModel.setHumanValue(updatedCriteriaData.humanValue);
            advModel.setDirtyValue(updatedCriteriaData.dirtyValue);
        } else {
            advModel.setValue('');
            advModel.setHumanValue('');
            advModel.setDirtyValue({});
        }
        this.updateModelInStruct($event.pointer.mode, $event.pointer.groupId, $event.pointer.criteriaId, advModel);
        const dataSelector = this.getSearchMode() === 'builder' ? 'builderData' : 'exampleData';
        let groups: AdvancedGroupListTypes = this.config.options[dataSelector].groups;
        if (groups[$event.pointer.groupId]) {
            groups[$event.pointer.groupId].criterias[$event.pointer.criteriaId].data.value = $event.data;
        }
    }

    /**
     * Return searchType for current view
     */
    getSearchType(): SearchTypesType {
        let svc: SearchViewsComponent = (<CoreSearchComponent>this.config.componentContext).viewsComp;

        return svc ? (<SearchTypesType>svc.provider.config.options.type) : null;
    }

    // private createEmptyModelInStruct(mode: AdvancedModeTypes, groupId: number, critId: number) {
    //     this.updateModelInStruct(mode, groupId, critId, (new AdvancedSearchModel()));
    // }

    /**
     * Return current search mode
     * @returns {AdvancedModeTypes}
     */
    getSearchMode(): AdvancedModeTypes {
        return this.config ? this.config.options.advancedSearchMode : 'builder';
    }

    /**
     * Prepare all deps
     * @returns {Observable<{
     *       fields: AdvancedFieldsPreparedObjectType,
     *       operators: AdvancedOperatorsObjectForSelect2Types
     *   }>}
     */
    init(): Observable<{
        fields: AdvancedFieldsPreparedObjectType,
        operators: AdvancedOperatorsObjectForSelect2Types
    }> {
        return new Observable((observer: any) => {
            this.getFieldsAndOperators(
                this.config.options.restIdForParametersInAdv
            ).pipe(
                takeUntil(this.config.moduleContext.destroyed$)
            ).subscribe((preparedFieldsAndOperatos: {
                fields: AdvancedFieldsPreparedObjectType,
                operators: AdvancedOperatorsObjectForSelect2Types
            }) => {
                observer.next(preparedFieldsAndOperatos);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    /**
     * Return prepared fields and operators
     * @param restId
     */
    getFieldsAndOperators(restId: AdvancedRESTIdsForListOfFieldsTypes): Observable<{
        fields: AdvancedFieldsPreparedObjectType,
        operators: AdvancedOperatorsObjectForSelect2Types
    }> {
        return new Observable((observer: any) => {
            forkJoin(
                [this.config.options.service.getFields(restId),
                    this.config.options.service.getOperators('SearchSupportedOperators')]
            ).pipe(
                takeUntil(this.config.moduleContext.destroyed$)
            ).subscribe((arr: Array<AdvancedOperatorsObjectForSelect2Types | AdvancedFieldsPreparedObjectType>) => {
                observer.next({
                    fields: arr[0],
                    operators: arr[1]
                });
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });

        });
    }

    /**
     * Return criteria structure with value of field by number
     * @param struct
     */
    getCriteriaStructure(struct?: AdvancedSearchDataForCreatingCriteria): AdvancedStructureCriteriaType {
        let mc = this.config.moduleContext;
        let commonData = mc.config.options.commonData;
        // field
        let field: AdvancedFieldType;
        if (struct) {
            field = $.extend(true, {}, commonData.props[struct.selectedField]);
        } else {
            field = commonData.props[Object.keys(commonData.props)[0]];

        }
        if (!field) {
            return;
        }
        // operators
        let operators: Select2ListTypes = commonData.operators[field.SearchEditorType] || [];

        if (!operators) {
            return;
        }
        // selected operator
        let operator: Select2ItemType = operators[0];
        if (struct && struct.selectedOperator) {
            $.each(operators, (k, o) => {
                if (struct.selectedOperator === o.text) {
                    operator = o;
                    return false;
                }
            });
        }

        let data: AdvancedStructureCriteriaDataType = {
            field: field,
            operators: operators,
            operator: operator
        };


        // value
        if (struct && struct.value) {
            data.value = struct.value;
        }

        // onlyRead
        if (struct && struct.isDisabled) {
            data.isDisabled = struct.isDisabled;
        }

        return <AdvancedStructureCriteriaType>{
            id: 0,
            data: data
        };
    }

    /**
     * Get data by mode
     * @param mode
     * @returns {any}
     */
    getDataByMode(mode: AdvancedModeTypes = 'builder'): AdvancedStructureGroupsTypes {
        let mc = this.config.moduleContext;
        let data = mode === 'builder' ?
            mc.config.options.builderData :
            mc.config.options.exampleData;

        return data;
    }

    /**
     * Is valid structure adv
     * @returns {boolean}
     */
    isValidStructure(): boolean | null {
        return this.isOpenPanel() ? this.isValidStructureFlag[this.getSearchMode()] : null;
    }

    /**
     * Validate model by pointer
     * @param pointer
     */
    validateModel(pointer: AdvancedPointerCriteriaType): void {
        if (pointer.mode === 'builder') {
            console.log('pointer', pointer);
            let m: AdvancedSearchModel;
            if (
                this._models[pointer.mode]
                &&
                this._models[pointer.mode][pointer.groupId]
                &&
                this._models[pointer.mode][pointer.groupId][pointer.criteriaId]
            ) {
                m = this._models[pointer.mode][pointer.groupId][pointer.criteriaId];
                let v = m.getValue();
                this.isValidStructureFlag['builder'] = !(isUndefined(v) || v === '');
            } else {
                this.isValidStructureFlag['builder'] = false;
            }
        } else {
            this.validateExampleModels();
        }
    }

    /**
     * Validate models by current mode
     */
    validateModels(): void {
        let mode = this.getSearchMode();
        if (mode === 'builder') {
            this.validateBuilderModels();
        } else {
            this.validateExampleModels();
        }

        this.updateStateForSearchButton();
    }

    /**
     * Validate builder models
     */
    validateBuilderModels(): void {
        if ($.isEmptyObject(this._models['builder'])) {
            this.isValidStructureFlag['builder'] = null;
        } else {
            this.isValidStructureFlag['builder'] = true;
            $.each(this._models['builder'], (grId, groups) => {
                $.each(groups, (critId, crit) => {
                    const val = crit.getValue();
                    if (Array.isArray(val) && !val.length) {
                        this.isValidStructureFlag['builder'] = this.config.moduleContext.config.options.allowEmptyForBuilder;
                        return false;
                    } else if (val === undefined || val === '' || val === null) {
                        this.isValidStructureFlag['builder'] = this.config.moduleContext.config.options.allowEmptyForBuilder;
                        return false;
                    }
                });
            });
        }
    }

    /**
     * Validate example models
     */
    validateExampleModels(): void {
        this.isValidStructureFlag['example'] = false;
        $.each(this._models['example'], (grId, groups) => {
            $.each(groups, (critId, crit) => {
                if (crit.getValue() !== undefined && crit.getValue() !== '') {
                    this.isValidStructureFlag['example'] = this.config.moduleContext.config.options.allowEmptyForExample;
                    return false;
                }
            });
        });
    }

    /**
     * Set data by mode
     * @param data
     * @param mode
     */
    setDataByMode(data: AdvancedStructureGroupsTypes = {groups: []},
                  mode: AdvancedModeTypes = 'builder'): void {
        let mc = this.config.moduleContext;
        let _data = mode === 'builder' ?
            mc.config.options.builderData :
            mc.config.options.exampleData;
        _data = data;
    }

    /**
     * Get model for search
     * @returns {Array}
     */
    getModels(mode?: AdvancedModeTypes): Array<AdvancedSearchModel> {
        let _models = this._models[mode || this.getSearchMode()] || [];
        let models = [];
        $.each(_models, (grId, crits) => {
            $.each(crits, (critId, model) => {
                models.push(model);
            });
        });

        return models;
    }

    /**
     * Get models prepared to request
     * @param mode
     * @param options
     */
    getModelsPreparedToRequest(mode?: AdvancedModeTypes, options: { skipValidation: boolean } = {
        skipValidation: false
    }): AdvancedCriteriaListTypes {
        let models = this.getModels(mode || this.getSearchMode());
        let preparedModels = [];
        $.each(models, (k, m: AdvancedSearchModel) => {
            if ((m.getValue() !== undefined && m.getValue() !== '') || options.skipValidation === true) {
                preparedModels.push(m._toJSON());
            }

        });

        return preparedModels;
    }

    /**
     * Clear params of search for query builder
     */
    clearParamsForBuilder() {
        let m = this.config.moduleContext;
        m.config.options.builderData.groups = [];
        this._models['builder'] = {};
        // this.buildStructure(this.config.options.service.getStructure());
    }

    /**
     * Clear params of search for query by example
     */
    clearParamsForExample(toState: 'empty' | 'default' = 'default') {
        let m = this.config.moduleContext;
        m.config.options.exampleData.groups = [];
        let structs = this.config.options.service.getStructure();
        this._models['example'] = {};
        // if (toState === 'default') {
        // }
        // this.buildStructure(structs);

    }

    /**
     * Clear params of search for qbe and qba
     */
    clearParamsForAll() {
        this.clearParamsForBuilder();
        this.clearParamsForExample();
    }

    /**
     * Build structure use AdvancedSearchGroupRef
     * @param structs
     */
    buildStructure(structs: Array<AdvancedSearchGroupRef>): void {
        $.each(structs, (gKey, group) => {
            $.each(group.criterias, (cKey, criteriaStruct) => {
                this.addCriteria(<AdvancedPointerGroupType>{
                    groupId: group.id,
                    mode: group.mode
                }, criteriaStruct);
            });
        });
        setTimeout(() => {
            this.config.moduleContext.updateViewReferences();
            this.validateModels();
            this.updateStateForSearchButton();
        });
    }

    /**
     * Convert list of criterias to list of structure
     * @param crits
     * @param _mode
     * @returns {Array<AdvancedSearchGroupRef>}
     */
    turnCriteriasToStructures(crits: AdvancedCriteriaListTypes,
                              _mode: AdvancedModeTypes = null, excludeCrits: string[] = []): Array<AdvancedSearchGroupRef> {
        let mode = _mode !== null ? _mode : this.getSearchMode();
        let structs = <Array<AdvancedSearchGroupRef>>[];
        let _crits: any = {};
        // this.updateModelInStruct(mode, $event.pointer.groupId, $event.pointer.criteriaId, advModel); /// implement it
        // collect criterias
        $.each(crits, (i, crit: AdvancedCriteriaRestoreType) => {
            if (excludeCrits.indexOf(crit.DBField) > -1) {
                return true;
            }
            if (!_crits[crit.GroupId]) {
                _crits[crit.GroupId] = [];
            }
            let advModel = (new AdvancedSearchModel()).fillByJSON(crit);
            advModel.setDirtyValue(crit.dirtyValue);

            this.updateModelInStruct(mode, (<number>crit.GroupId), null, advModel);
            _crits[crit.GroupId].push(this.turnCriteriaToStructure(crit));
        });

        // create struct
        $.each(_crits, (groupId: number, critItem: Array<AdvancedSearchDataForCreatingCriteria>) => {
            let struct = <AdvancedSearchGroupRef>{
                id: groupId,
                mode: mode,
                criterias: critItem
            };
            structs.push(struct);
        });

        return structs;
    }

    /**
     * Convert criteria to AdvancedSearchDataFromControlType
     * @param crit
     * @returns {{selectedField: string, selectedOperator: string, value: AdvancedSearchDataFromControlType}}
     */
    turnCriteriaToStructure(crit: AdvancedCriteriaType): AdvancedSearchDataForCreatingCriteria {
        return {
            selectedField: crit.DBField,
            selectedOperator: crit.Operation,
            value: <AdvancedSearchDataFromControlType>{
                value: crit.Value,
                // humanValue: (<any>crit).HumanValue,
                dirtyValue: (<any>crit).dirtyValue
            }
        };
    }

    /**
     * Is open adv panel
     */
    isOpenPanel(): boolean {
        return this.getStateForPanel();
    }

    /**
     * Is advanced search apply?
     */
    withAdvChecking(): boolean {
        return this.isOpenPanel();
    }

    /**
     * Open adv panel
     */
    openPanel(): void {
        this.setStateForPanel(true);
    }

    /**
     * Close adv panel
     */
    closePanel(): void {
        this.setStateForPanel(false);
    }

    /**
     * Set state for adv panel
     * @param state
     */
    setStateForPanel(state: boolean) {
        if (!this.config) {
            return;
        }
        this.config.componentContext.searchAdvancedConfig.options.isOpen = state;
        if (this.config && this.config.componentContext && this.config.componentContext.cdr) {
            this.config.componentContext.cdr.detectChanges();
        } else {
            console.warn('No cdr for SearchAdvancedProvider', this);
        }
        this.config.moduleContext.cdr.detectChanges();
        this.onToggle.emit(state);
    }

    getStateForPanel(): boolean {
        let res: boolean = false;
        if (this.config && this.config.componentContext.searchAdvancedConfig.options.isOpen) {
            res = this.config.componentContext.searchAdvancedConfig.options.isOpen;
        }

        return res;
    }

    getIsReady(): boolean {
        return (this.config) ? this.config.moduleContext.isReady : false;
    }


    /**
     * Set mode for adv
     * @param mode
     */
    setMode(mode: AdvancedModeTypes = 'builder'): void {
        if (!this.config.options.advancedSearchMode ||
            this.config.options.advancedSearchMode !== mode) {
            this.config.options.advancedSearchMode = mode;
        }
    }

    updateStateForSearchButton(): void {
        if (this.config.componentContext.searchFormConfig) {
            this.config.componentContext.searchFormConfig.options.provider.config.moduleContext.cdr.detectChanges();
        }
    }

    sendSubmit() {
        if (this.config.componentContext.searchFormConfig) {
            this.config.componentContext.searchFormProvider.submit();
        }
    }

    getCustomModels(): AdvancedSearchModel[] {
        return [];
    }

    private updateModelInStruct(mode: AdvancedModeTypes, groupId: number, critId: number | null, advModel: AdvancedSearchModel = null) {
        if (!this._models[mode]) {
            this._models[mode] = {};
        }
        if (!this._models[mode]) {
            this._models[mode] = {};
        }
        if (!this._models[mode][groupId]) {
            this._models[mode][groupId] = {};
        }
        if (critId === null) {
            critId = Object.keys(this._models[mode][groupId]).length;
        }
        if (!advModel) {
            this._models[mode][groupId][critId] = new AdvancedSearchModel();
        } else {
            this._models[mode][groupId][critId] = advModel;
        }
        this.validateModels();
    }
}


