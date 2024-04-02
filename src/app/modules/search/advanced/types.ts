/**
 * Created by Sergey Trizna on 22.09.2017.
 */
import { Select2ItemType, Select2ListTypes } from '../../controls/select2/types';
import {LookupsTypes, SearchTypesType} from '../../../services/system.config/search.types';
import { AdvancedSearchModel } from '../../../models/search/common/advanced.search';
export type AdvancedModeTypes = 'builder' | 'example';

/**
 * Search criteria field (item of list available the parameters of search (first select in adv))
 */
export type AdvancedFieldType = {
    FriendlyName: string,
    LookupSearchType: AdvancedLookupSearchTypes,
    LookupType: LookupsTypes,
    Name: string,
    Parameter: number,
    SearchEditorType: AdvancedSearchEditorTypes
};


// export type AdvancedCriteriaSearchItem = {
//     DBField: string,
//     Field: string,
//     Operation: string,
//     GroupId: number,
//     Value: string|number
// }

// export type AdvancedCriteriaSearchList = Array<AdvancedCriteriaSearchItem>;


// Object with criteria fields and name
export type AdvancedFullFieldsObjectTypes = {
    Name: string,
    FieldNameAndType: AdvancedFieldsListTypes
};

// List of fields by lookupd
export type AdvancedFieldsListBySearchTypeTypes = {
    [key: string]: AdvancedFieldsListTypes
};
// List of fields
export type AdvancedFieldsListTypes = Array<AdvancedFieldType>;

// Object of fields
export type AdvancedFieldsObjectTypes = {
    [key: number]: AdvancedFieldType
};

// List of fields and list of fields turned ti select2 (id and text)
export type AdvancedFieldsPreparedObjectType = {
    items: Select2ListTypes,
    props: AdvancedFieldsObjectTypes
};


export type AdvancedFieldsAndOperators = {
    fields: AdvancedFieldsPreparedObjectType,
    operators: AdvancedOperatorsObjectForSelect2Types
}


// export type AdvancedCriteriaFieldType = {
//     name: string,
//     lookupType: string,
//     lookupSearchType: string,
//     operators: Array<string>,
//     operator: AdvancedCriteriaFieldOperatorType,
//     value: string|number
// }
// // Type for operators in criteria field
// export type AdvancedCriteriaFieldOperatorType = {
//     id: number,
//     text: string
// }
//
// // for array of AdvancedCriteriaFieldType
// export type AdvancedCriteriaFieldListType = Array<AdvancedCriteriaFieldType>;


/**
 * Criteria types (Saved search or Criteria of search for example)
 */
// Params for search
export type AdvancedCriteriaType = {
    'Field'?: string,
    'DBField'?: any,
    'Operation'?: string,
    'Value'?: string | number,
    'GroupId'?: string | number,
    'LookupValue'?: string | number,
    'Parameter'?: string | number
};

export type ConsumerAdvancedCriteriaType = {
    'Field'?: string,
    'FieldId'?: any,
    'Operation'?: string,
    'Value'?: string | number,
    'GroupId'?: string | number,
    'LookupValue'?: string | number,
    'Parameter'?: string | number
};

export type AdvancedCriteriaRestoreType = AdvancedCriteriaType & {
    dirtyValue: any;
};

// list of criteria
export type AdvancedCriteriaListTypes = Array<AdvancedCriteriaType>;
// objects of criteria
export type AdvancedCriteriaObjectsWithModeTypes = {
    [key: string]: AdvancedCriteriaObjectsWithGroupTypes
};
export type AdvancedCriteriaObjectsWithGroupTypes = {
    [key: string]: AdvancedCriteriaObjectsWithCritTypes
};
// object with adv models by mode
export type AdvancedCriteriaObjectsWithCritTypes = {
    [key: string]: AdvancedSearchModel
};
export type  AdvancedCriteriaObjectsTypes = {
    [key: string]: AdvancedSearchModel
};

/**
 * REST ids for list getting list of fields
 */
export type AdvancedRESTIdsForListOfFieldsTypes =
    'Media'
    | 'CacheManagerSearch'
    | 'Version'
    | 'AutomatedTask'
    | '-4008'
    | 'Job'
    | 'Names'
    | 'Tape'
    | 'TitleSearch'
    | 'task'
    | 'ResourceReq'
    | 'UserLoans'
    | 'productionmanager'
    | 'production'
    | 'eventreqs'
    | 'MediaPortal'
    | 'ProductionMadeItems'
    | 'eventreqdetails'
    | '';

/**
 * Lookup search types
 */
export type AdvancedLookupSearchTypes = 'Empty' | 'Users' | 'XmlFields' | 'Locations' | 'Taxonomy' |
    'XmlSchemasMedia' | 'NamedAutority' | 'XmlSchemasVersion' | 'CustomMediaStatus' | 'CustomVersionStatus' | 'CustomTitleStatus' | 'Companies' |
    'ProdTemplates';

/**
 * Search editor types
 */
export type AdvancedSearchEditorTypes = 'TextBox' |
    'CheckBox' | 'TextBoxCtx' | 'TextBoxCtxId' | 'LookupSearch' | 'SignedDateTime' |
    'NumberBox' | 'ComboSingle' | 'ComboMulti' | 'HierarchicalLookupSearch' |
    'PickerMulti' | 'Time' | 'TimeMS' | 'TextBoxLike' | 'Calendar' | 'DataSize';

/**
 * Operators
 */
export type AdvancedOperatorsTypes = {
    [key: string]: Array<string>
};

// items
export type AdvancedOperatorsObjectForSelect2Types = {
    [key: string]: Select2ListTypes
};

// list of items
// export type AdvancedOperatorsListTypes = Array<Select2ListTypes>

/**
 * Advanced hierarchy structure
 */
// Groups structure
export type AdvancedStructureGroupsTypes = {
    groups: AdvancedGroupListTypes;
};

// Group structure
export type AdvancedStructureGroupType = {
    id: number|string,
    criterias: AdvancedStructureCriteriaDataListType
};

// Criteria structure
export type AdvancedStructureCriteriaType = {
    id: number,
    data: AdvancedStructureCriteriaDataType
};

// Criteria structure data type
export type AdvancedStructureCriteriaDataType = {
    field: AdvancedFieldType,
    operators: Select2ListTypes,
    operator?: Select2ItemType,
    value?: AdvancedSearchDataFromControlType,
    isDisabled?: boolean
};

// Criteria structure data list type
export type AdvancedStructureCriteriaDataListType = Array<AdvancedStructureCriteriaType>;

// List of groups
export type AdvancedGroupListTypes = Array<AdvancedStructureGroupType>;


// Builder structure
export type AdvancedSearchGroupRef = {
    id: number,
    mode: AdvancedModeTypes,
    criterias: Array<AdvancedSearchDataForCreatingCriteria>
};

// Pointer to criteria
export type AdvancedPointerCriteriaType = {
    groupId: number,
    criteriaId: number,
    criteria?: any,
    mode: AdvancedModeTypes
};

// Pointer to group
export type AdvancedPointerGroupType = {
    groupId: number,
    mode: AdvancedModeTypes
};
// List of criterias
// export type AdvancedStructureCriteriaListTypes = Array<AdvancedStructureCriteriaType>

/**
 * Advanced search settings common data structure
 */
export type AdvancedSearchSettingsCommonData = {
    items: Select2ListTypes, // array of fields
    props: AdvancedFieldsObjectTypes, // array of object with properties for fields
    operators: AdvancedOperatorsObjectForSelect2Types,
    disabledOperators?: string[];
};

/**
 * For controls
 */
// ref to controls
export type AdvancedSearchControlRefType = {
    component: any,
    inputs: AdvancedSearchDataForControlDataType
};


// Data for control
export type AdvancedSearchDataForControlDataType = {
    data: AdvancedSearchDataForControlType
};

// Contents of inputs.data for control
export type AdvancedSearchDataForControlType = {
    field: AdvancedFieldType,
    mode: AdvancedModeTypes,
    criteria: AdvancedStructureCriteriaType
};

// Data from control
export type AdvancedSearchDataFromControlType = {
    // model: AdvancedCriteriaType,
    // detail: AdvancedSearchDataFromControlDetailType
    humanValue?: string, // value from control turned to human-understandable view
    dirtyValue?: any, // value from control
    value: string | number, // value from control prepared for request
    options?: AdvancedSearchDataFromControlOptionsType
};

// Data from control options type
export type AdvancedSearchDataFromControlOptionsType = {
    [key: string]: any
};

// Data from criteria
export type AdvancedSearchDataCriteriaReturnType = {
    data: AdvancedSearchDataFromControlType,
    model: AdvancedCriteriaType,
    pointer: AdvancedPointerCriteriaType
};

export type AdvancedSearchDataForCreatingCriteria = {
    selectedField: string,
    selectedOperator?: string,
    value?: AdvancedSearchDataFromControlType,
    isDisabled?: boolean
};

export type MediaSearchTypes = {
    Media: MediaSearchItem;
    Version: MediaSearchItem;
    ChameleonSearch: MediaSearchItem;
    TitleSearch: MediaSearchItem;
}

export type MediaSearchItem = Array<{IsDefault: boolean, Field: string, Label: string}>;

export type MediaSearch = {
    Media: Select2ItemType[];
    Version: Select2ItemType[];
    ChameleonSearch: Select2ItemType[];
    TitleSearch: Select2ItemType[];

}
