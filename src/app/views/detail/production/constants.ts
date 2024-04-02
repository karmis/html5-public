export const PROD_SOURCE_OWNER_TYPE = {
    MEDIA: 1,
    TITLE: 2,
}

export const PROD_ITEM_MADE_STATUS = {
    NONE: 0,
    MADE: 1,
    REMAKE: 2,
    AWAITING_APPROVAL: 3,
    UNAPPROVED: 4,
    AWAITINGQC: 5,
    QC_FAILED: 6,
    AWAITING_FULFILMENT: 7,
    AWAITING_CONSISTENCY: 8,
    CONSISTENCY_FAILED: 9,
    COMPLETE: 10,
    MADE_FAILED: 11,
    FULFILMENT_FAILED: 12,
    TRANSFERRING: 13,
    TRANSFER_FAILED: 14
};

export const PROD_ITEM_MAKE_STATUS = {
    NONE: 0,
    WISH: 1,
    AWAITING_APPROVAL: 2,
    NOT_STARTED: 3,
    STARTED: 4,
    RESTARTED: 5,
    PUBLISHING_EDL: 6,
    IN_PRODUCTION: 7,
    REJECTED: 8,
    COMPLETED: 9,
    FAILED: 10,
    ABORTED: 11
};

export const PRODUCTION_DETAIL_TABS = [
    {
        type: 'component',
        componentName: 'ProductionInfo',
        tTitle: 'ProductionInfo',
        title: 'Production Info',
        translateKey: 'production_info',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'ProductionList',
        tTitle: 'ProductionList',
        title: 'Make List',
        translateKey: 'make_list',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'SourceMedia',
        tTitle: 'SourceMedia',
        title: 'SourceMedia',
        translateKey: 'source_media',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'SourceTitles',
        tTitle: 'SourceTitles',
        title: 'SourceTitles',
        translateKey: 'source_titles',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'MediaInProd',
        tTitle: 'MediaInProd',
        title: 'MediaInProd',
        translateKey: 'media_in_prod',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'Workflows',
        tTitle: 'Workflows',
        title: 'Workflows',
        translateKey: 'workflows',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'History',
        tTitle: 'History',
        title: 'History',
        translateKey: 'history',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'Attachments',
        tTitle: 'Attachments',
        title: 'Attachments',
        translateKey: 'attachments',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'Audio',
        tTitle: 'Audio',
        title: 'Audio',
        translateKey: 'production_audio',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'Subtitles',
        tTitle: 'Subtitles',
        title: 'Subtitles',
        translateKey: 'production_subtitles',
        isValid: true,
    },
    {
        type: 'component',
        componentName: 'Segments',
        tTitle: 'Segments',
        title: 'Segments',
        translateKey: 'segments',
        isValid: true,
        timecodesInvalid: false
    },
    {
        type: 'component',
        componentName: 'Events',
        tTitle: 'Events',
        title: 'Events',
        translateKey: 'events',
        isValid: true,
        timecodesInvalid: false
    },
    {
        type: 'component',
        componentName: 'Metadata',
        tTitle: 'Metadata',
        title: 'Metadata',
        translateKey: 'metadata',
        isValid: true
    }
];

export const PRODUCTION_TEMPLATE = {
    VERSIONS: 2,
    CLEAN_MASTERS: 124,
    EVENTS: 264,
}

export const PRODUCTION_TEMPLATE_CONFIG = {
    VERSIONS: "version",
    CLEAN_MASTERS: "cleans and versions",
    EVENTS: "live event",
    SHORTS_AND_GRAPHICS: "shorts and graphics"

}
export const MAKE_ITEM = {
    __ISNEW: true, // DELETE WHEN SENDING ON SERVER
    __ID: 0,
    "CompositeItemTypeText": null,
    "Parent": null,
    "Duration_text": "00:00",
    "TvStandardText": null,
    "MediaFileTypeText": null,
    "DueDate": null,
    "ComplianceOfficerName": null,
    "AssistantName": null,
    "VerFullTitle": null,
    "SourceDuration_text": null,
    "Children": [],
    "MadeItems": [],
    "Sources": [],
    "SourceMedias": [],
    "SourceProgs": [],
    "InProdMedias": [],
    "Event": null,
    "Programm": null,
    "Media": null,
    "AudioTracks": [],
    "Segments": [],
    "Subtitles": [],
    "Workflows": [],
    "XmlDocuments": null,
    "History": [],
    "NeedSubs": false,
    "HasChecks": false,
    "Production": null,
    "Attachments": [],
    "StatusText": "Wish",
    "ID": 0,
    "PROD_ID": 0,
    "PARENT_ID": null,
    "ITEM_TYPE": 0,
    "TITLE": "",
    "NOTES": null,
    "DURATION": null,
    "STATUS": PROD_ITEM_MAKE_STATUS.WISH,
    "MEDIA_FILE_TYPE": null,
    "TV_STD": null,
    "ASPECT_RATIO": null,
    "HOUSE_NUMBER": "",
    "VERSIONING_INFO": null,
    "TITLE_MEDIA_ID": null,
    "CREATED_BY": "TMDDBA", // back
    "CREATED": "2015-08-05T15:00:11", // back
    "MODIFIED_BY": "TMDDBA", // back
    "MODIFIED": "2015-08-06T11:36:22", // back
    "MI_TYPE": null,
    "FILENAME": null,
    "CURRENT_CHECKS": null,
    "EVENT_ID": null,
    "CERTIFICATION": null,
    "FNET_ID": null,
    "COMPLIANCE": null,
    "ASSISTANT": null,
    "EVENT_IDX": null,
}