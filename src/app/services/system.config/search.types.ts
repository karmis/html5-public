import {appRouter} from "../../constants/appRouter";

export class SearchTypes {
    static CONSUMER = appRouter.consumer.search;
    // static CONSUMER_START = appRouter.consumer.start;
    static MEDIA = appRouter.media.search;
    static VERSION = appRouter.version;
    static TITLE = appRouter.title.search;
    static CARRIER = appRouter.carrier;
}

export type CustomLabels = {
    comments: 'Comments' | string;
    legal: 'Legal' | string;
    cuts: 'Cuts' | string;
}

export type VideoBrowser = {
    messageAllScreens: string;
    messageMediaBasket: string;
    messageClosedCaptionsPanel: string;
    systemName: string;
    helpUrl: string;
}

// export type SearchTypesType = SearchTypes.CONSUMER|SearchTypes.MEDIA|SearchTypes.VERSION|SearchTypes.TITLE|SearchTypes.CARRIER;
export type SearchTypesType = 'simple' | 'media' | 'version' | 'titles' | 'carrier';

// lookup types
export type LookupsTypes = 'Languages' |
    'Channels' |
    'MediaFileTypes' |
    'DatabaseSearchFieldData' |
    'SearchSupportedOperators' |
    'TvStandards' |
    'UsageTypes' |
    'MediaTypes' |
    'AspectRatioTypes' |
    'AfdTypes' |
    'ItemTypes' |
    'BookingTypes' |
    'DeliveryMethods' |
    'FriendlyNames' |
    'BookingStatus' |
    'RightsPermissions' |
    'Icons' |
    'CtnrFormats' |
    'Tags' |
    'RightsDateTypes' |
    'TaskTypes' |
    'SegmentTypes' |
    'Devices' |
    'AudioContentTypes' |
    'AgeCertification' |
    'AudioMsTypes' |
    'MediaStatus' |
    'MisrSuppressMode' |
    'ItemFormats' |
    'ColorTypes' |
    'ArchCategories' |
    'ArchGroup' |
    'FlagsTypes' |
    'Origins' |
    'PgmStatus' |
    'Forms' |
    'SubMediums' |
    'JobStatuses' |
    'MisrStatuses' |
    'MisrShowFilter' |
    'MisrLongShortForm' |
    'MisrTxAdvanced' |
    'EvReqStatuses' |
    'ProdItemMakeStatuses' |
    'ProdItemMadeStatuses' |
    'NamingRules' |
    'RundownMedStatuses' |
    'EventReqTxTypes' |
    'EventReqEventTypes' |
    'EventReqIncomingSource' |
    'Checks' |
    'QcStatuses' |
    'PackageResetTypes' |
    'Departments' |
    'Countries' |
    'MisrTemplates' |
    'TextTemplates' |
    'AutomatedTasks' |
    'LookupXmlSchemas' |
    'Dvbs' |
    'Mediums' |
    'DvPresets' |
    'PlayableFormats' |
    'UserResponsibilities' |
    'UserRoles' |
    'Presets'|
    'MediaEventTypes'|
    'locations'|
    'AvFaultType'|
    'XmlSchemaType' |
    'AutomatedTasksTypes' |
    'order-presets' |
    'ProdTemplates' |
    'PlayoutDevices' |
    'AssessmentSubsTypes' | any;

export type LookupLocationType = {
    Children?: LookupLocationType[]
    ID: number
    LOC_TYP: number
    NAM: string
    PAR_ID: number
    Parent: number|null
};
