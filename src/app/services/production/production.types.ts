export type TypeGridProd = 'history' | 'mediaInProd' | 'workflows' | 'attachments' | 'segments';

type Sources = {
    "ID": number;
    "PROD_ID": number;
    "PROD_ITEM_ID": number;
    "OWNER_TYPE": number;
    "OWNER_ID": number;
    "STATUS": number;
    "JOB_ID": number;
}

export type SourceMediaData = {
    "$id": string;
    "AudioTracks": [];
    "Segments": [];
    "ASPECT_R_text": string,
    "AFD_ID_text": string;
    "ID": number;
    "MEDIA_TYPE": number;
    "PGM_PARENT_VERSION": string;
    "CREATED_BY": string;
    "CREATED_DT": string;
    "MODIFIED_BY": string;
    "MODIFIED_DT": string;
    "EntityKey": any
};

export type AudioTracks = {
    "ID"?: number,
    "PROD_ITEM_ID": number
    "TEMPLATE_ID": number
    "SEQUENCE": number
    "AUDIO_CONTENT_TYPE_ID": number
    "LANGUAGE_ID": number
}

export type Segments = {
    "Duration_text"?: string,
    "TYPE_text": any,
    "ID"?: number,
    "PROD_ITEM_ID": number,
    "TEMPLATE_ID": number,
    "PRT_NUM": number,
    "SQ_NUM": number,
    "SEG_TYPE": number,
    "PRT_TTL": string,
    "TCF": number,
    "SOM": number,
    "EOM": number,
    "SOMS": string,
    "EOMS": string,
    "TimecodeFormat": string,
    "TxPart": boolean
}

export type ProductionSubtitles = AudioTracks;

export type MadeItemsData = {
    CERTIFICATION: any;
    FILENAME: any;
    History: any[];
    "MadeItems": MadeItemsData[],
    "Sources": Sources[],
    "Programm": any,
    "Media": {
        "$id": any,
        "AudioTracks": [],
        "History": [],
        "DeletedAudioTracks": null,
        "Events": {
        AQ: null
        AU_CONT: null
        AU_LANG: null
        AU_MS: null
        AU_NM: null
        AU_NR: null
        AU_NTS: null
        AU_NUM: null
        AU_SP: null
        CREATED: "2021-07-13T14:18:47"
        CREATED_BY: "VICTORIA"
        CR_TSKID: null
        CR_USR: null
        CTNR_ID: null
        CTNR_IDX: null
        DUR: 53946
        DURATION_text: "00:30:00;00"
        DUR_TCS: "00:30:00;00"
        EOM: 1132866
        EOMS: "10:30:00;00"
        EOM_text: "10:30:00;00"
        EXTERNALLY_OWNED_ID: null
        FLG: null
        FLG_EN: null
        FPS: null
        GRADED: null
        GRADE_ID: null
        ID: 45442
        IN_CUE_CMMTS: null
        LANG_VS: null
        MIID: 163169
        MI_TYP: null
        MODIFIED: null
        MODIFIED_BY: null
        OUT_CUE_CMMTS: null
        OVERLAPS: null
        OWN_ID: null
        OWN_TYP: null
        PAR_ID: null
        PAR_TYPE: 4010
        PRT_ID: null
        PRT_ID2: null
        PRT_NUM: 0
        PRT_TTL: null
        SOM: 1078920
        SOMS: "10:00:00;00"
        SOM_text: "10:00:00;00"
        SQ_IDX: null
        SQ_NUM: 1
        SUBS: null
        TX_OK: null
        TYPE: 1020
        TYPE_text: "Unknown [1020]"
        TimecodeFormat: "NTCS_DF"
        USE_PAR_AU: null
        VIRT_RL: null
        VQ: null
    }[],
        "DeletedEvents": null,
        "Segments": [],
        "DeletedSegments": null,
        "Faults": null,
        "DeletedFaults": null,
        "ASSUBSTYPE": any,
        "ASSUBSTYPE_text": string,
        "MI_CHECKSUM_MD5": string,
        "MI_CHECKSUM_SHA1": string,
        "MI_CHECKSUM_SHA256": string,
        "UsePresignedUrl": false,
        "OS_GUID": string,
        "TAGS_TEXT": null,
        "DFILE_LINK_GUID": string,
        "TRANSFER_NUMBER": string,
        "CRS_SERIES": string,
        "FLAGS": string,
        "FILE_SOM": any,
        "FILE_EOM": any,
        "MEDIA_TYPE_text": string,
        "MEDIA_STATUS_text": string,
        "MEDIA_STATUS_color": string,
        "SOM_text": string,
        "EOM_text": string,
        "TV_STD_text": string,
        "FILESIZE_text": string,
        "OWNERS_text": string,
        "DURATION_text": string,
        "USAGE_TYPE_text": string,
        "AGE_CERTIFICATION_text": string,
        "QC_FLAG_text": string,
        "MEDIA_FORMAT_text": string,
        "AGENCY_NUMBER": string,
        "ACCESS_STATUS": string,
        "AGENCY": string,
        "DISPOSAL_STATUS": string,
        "DISPOSAL_CLASS_TEXT": string,
        "DISPOSAL_CLASS": null,
        "CONSIGNMENT_NUMBER": string,
        "ASPECT_R_text": string,
        "AFD_ID_text": string,
        "ITEM_TYPE_text": string,
        "CC_FLAG_text": string,
        "AUD_LANGUAGE_ID_text": string,
        "BARCODE": string,
        "LOCATION": string,
        "FLAG_10_text": string,
        "FLAG_11_text": string,
        "FLAG_12_text": string,
        "FLAG_13_text": string,
        "FLAG_14_text": string,
        "FLAG_15_text": string,
        "M_CTNR_LOC_text": string,
        "IsPlayableVideo": true,
        "IsImageDisplayable": false,
        "ProxyUrlPublic": string,
        "PROXY_URL": string,
        "TimecodeFormat": string,
        "Status_text": string,
        "THUMBFILE": string,
        "THUMBSERVER": string,
        "THUMBID": string,
        "FILENAME": string,
        "FILEPATH": null,
        "DFILE_SRVER_ID": null,
        "Subtitles": null,
        "VAL1": any,
        "SuitableVoec": false,
        "CtnrId": string,
        "MediaState": null,
        "U_ID_EXT1": string,
        "ORIGIN": string,
        "PROD_LANGUAGE": string,
        "ITEM_FORMAT_TEXT": string,
        "PGM_STATUS_TEXT": string,
        "ASSISTED_QC_TEXT": string,
        "TX_DATE": null,
        "VER_DURATION_text": string,
        "OS_FNAME": null,
        "SUB_FOLDER": string,
        "ORIGINAL_FILENAME": string,
        "MediaFormatIconId": string,
        "SdHdIconId": string,
        "FullTitle": string,
        "MediaTypeOriginal": 100,
        "FileExtension": string,
        "IsGanged": false,
        "IsGangedMain": false,
        "IsLive": false,
        "IS_ORIGINAL_AUDIO_text": string,
        "CustomStatuses": null,
        "DynamicFields": {},
        "CHANNEL_GROUP": string,
        "ID": number,
        "MEDIA_TYPE": number,
        "MIID1": string,
        "MIID2": string,
        "M_CTNR_ID": string,
        "M_CTNR_TYPE_ID": string,
        "M_CTNR_FMT_ID": string,
        "M_CTNR_LOC": string,
        "ITEM_TYPE": any,
        "NET_GRP_ID": any,
        "NET_GRP_NAME": string,
        "OWNERS": string,
        "PGM_ABS_ID": any,
        "PGM_RL_ID": any,
        "PGM_PARENT_ID": any,
        "PGM_PARENT_TYPE": any,
        "PGM_PARENT_LEVEL": any,
        "PGM_PARENT_VERSION": string,
        "SER_ABS_ID": any,
        "SER_ABS2_ID": any,
        "SER_TYPE": any,
        "SER_EP_NUM": any,
        "SER_EP_SQ_NUM": any,
        "SER_CT_SQ_NUM": any,
        "SOM": any,
        "EOM": any,
        "OC_SOM": any,
        "OC_EOM": any,
        "EC_SOM": any,
        "EC_EOM": any,
        "ORIG_EC_DR": any,
        "CREATED_BY": string,
        "CREATED_DT": string,
        "MODIFIED_BY": string,
        "MODIFIED_DT": string,
        "ASPECT_R_ID": string,
        "AFD_ID": any,
        "FLAG_MASTER": any,
        "FLAG_MASTER_EN": any,
        "DESCRIPTION": string,
        "TITLE": string,
        "SER_TITLE": string,
        "SER_NAME": string,
        "SER_NUM": any,
        "VERSION": string,
        "VERSION_TYPE": any,
        "SERIESID1": string,
        "SERIESID2": string,
        "PROGID1": string,
        "PROGID2": string,
        "VERSIONID1": string,
        "VERSIONID2": string,
        "GRADE_ID": any,
        "GRADED": any,
        "AQ": any,
        "VQ": any,
        "ASSES_ID": any,
        "CERT_ID": any,
        "DESTROY_DT": null,
        "WIPE_DT": null,
        "AUD_NOISE_RED_ID": any,
        "VID_PROC_ID": any,
        "AUD_TYPE": any,
        "AUD_LANGUAGE_ID": any,
        "BI_SUBTITLES": any,
        "ACCEPT_DT": null,
        "ACCEPTANCE_LTTR_ID": any,
        "COMPLIANCE_ID": any,
        "SUB_TYP": any,
        "SUB_VERIF": any,
        "SUB_ID": any,
        "SUB_FN": string,
        "AUD_DES": any,
        "AUD_DESC_ID": any,
        "SIGNED": any,
        "SIGNED_ID": any,
        "EXTERNALLY_OWNED_ID": number,
        "RETURN_DATE": null,
        "NUM_PARTS": any,
        "USAGE_TYPE": any,
        "STATUS": any,
        "PRNT": string,
        "TV_NUM": number,
        "CLK_NUM": string,
        "LAST_MVMT": any,
        "NUM_ITEMS": any,
        "LINE_STD": number,
        "TV_STD": number,
        "LAST_BKG": any,
        "COMPIL": any,
        "CRET_JOB": any,
        "FROM_EPS": any,
        "TO_EPS": any,
        "COL": any,
        "SLT_DUR": any,
        "ORIG_CTTL": string,
        "PROD_YR": any,
        "PART_SEG": string,
        "PSE_ID": any,
        "LAST_JOB_ID": any,
        "LAST_TQ_RPT": any,
        "TX_FLG": any,
        "TX_FLG_EN": any,
        "FOR_LANG_VER": string,
        "PYS_OWN_GRP_ID": any,
        "PYS_OWN_NAME": string,
        "PYS_OWNERS": string,
        "M_CNTR_DBID": string,
        "TAP_ST": string,
        "TAP_ED": string,
        "M_CNTR_BC": string,
        "M_CNTR_BCT": string,
        "DUR": any,
        "AU_NUM": any,
        "AU_NM": any,
        "AU_CONT": any,
        "AU_LANG": any,
        "AU_MS": any,
        "AU_NR": any,
        "AU_NTS": any,
        "AU_SP": any,
        "AU_DMD_IDS": any,
        "AU_MUSIC_IDS": any,
        "M_CTNR_INT_O_LOC": any,
        "M_CTNR_EXT_O_LOC": any,
        "FRST_TXD": null,
        "TXSH_ID": any,
        "COMM_AQD": any,
        "META_ID": any,
        "U_FRM_TXD": null,
        "U_TO_TXD": null,
        "MM_EXT_ID": null,
        "MM_REF1": any,
        "MM_REF2": any,
        "TX_STAT": any,
        "COMM_CODE": any,
        "DV_CAT": any,
        "DV_MG": any,
        "MI_FMT_CODE": any,
        "MI_FMT_TYPE": null,
        "FILE_TYP": null,
        "META_STATE": null,
        "V_CODEC": null,
        "V_BR": null,
        "V_SAMP_TYP": null,
        "V_GOP_LEN": null,
        "A_CODEC": any,
        "A_BR": any,
        "A_BIT_PER_SAMP": any,
        "A_SAMP_RATE": any,
        "PARENT_ID": any,
        "TREE_LEVEL": any,
        "MEDIA_STATUS": null,
        "FILE_SYS": any,
        "PRGM_ID_INHOUSE": any,
        "MI_DELETED": any,
        "MI_DELETED_DT": null,
        "MI_DELETED_BY": any,
        "CTX_TEXT_COL": any,
        "CTX_IDS_COL": any,
        "MI_CHECKSUM": any,
        "MI_CHECKSUM_DT": null,
        "MI_CHECKSUM_TYPE": any,
        "MI_HISTORY": string,
        "MI_LINK_ID": any,
        "GROUP_SERIES_ID": null,
        "MI_LINK_GUID": any,
        "ITEM_INDEX": any,
        "MI_GUID": any,
        "LAST_TX_DATE": null,
        "PRODUCER": string,
        "SUPPLIER": string,
        "PRIMARY_THUMB_ID": null,
        "CONTENT_LAST_MODIFIED_DT": null,
        "AGE_CERTIFICATION": null,
        "MIID3": string,
        "IS_ORIGINAL_AUDIO": any,
        "EntityKey": null
    },
    "AudioTracks": AudioTracks[] | null,
    "Segments": Segments[] | any,
    "Subtitles": AudioTracks[] | null,
    "Workflows": [],
    "StatusText": "Made Failed" | "Completed",
    "STATUS": number,
    "ID": number,
};

export type MakeListData = {
    STATUS: any;
    DURATION: any;
    PARENT_ID: any;
    TITLE_MEDIA_ID: any;
    __ID: number;
    __ISNEW: Boolean;
    COMPLIANCE: any;
    HOUSE_NUMBER: any;
    NOTES: any;
    MEDIA_FILE_TYPE: any;
    TITLE: any;
    Duration_text: any;
    NeedSubs: any;
    DueDate: any;
    ASSISTANT: any;
    ComplianceOfficerName: any;
    "Children": MakeListData[],
    "MadeItems": MadeItemsData[],
    "Sources": Sources[],
    "SourceMedias": SourceMediaData[],
    "SourceProgs": SourceProgsData[],
    "InProdMedias": [],
    "Event": any,
    "Programm": {
        N_TX_DT: string | null;
        [key:string]: any
    },
    "AudioTracks": AudioTracks[],
    "Segments": Segments[],
    "Subtitles": ProductionSubtitles[],
    "Workflows": any[],
    "XmlDocuments": any,
    "History": any[],
    "Attachments": [],
    "StatusText": "Completed" | "Wish" | "None" | '',
    "ID": number,
    "CompositeItemTypeText": any,
    "Parent": any,
    "TvStandardText": any,
    "MediaFileTypeText": any,
    "AssistantName": any,
    "VerFullTitle": any,
    "SourceDuration_text": any,
};

export type SourceProgsData = {
    OWNERS_text: any;
    TITLE: any;
    SER_NAME: any;
    SER_TITLE: any;
    "Segments": Segments[],
    "AudioTracks": AudioTracks[],
    "ID": number,
};


export type ResponseProductionDetail = {
    ON_AIR: string | null; //"2015-08-05T14:57:36",
    TV_STD: number;
    "Items": MakeListData[],
    "Sources": Sources[],
    "SourceMedias"?: SourceMediaData[],
    "SourceProgs"?: SourceProgsData[],
    "ID": number,
    "TEMPLATE": number,
    "CHANNEL": number,
    TimecodeFormat: string,
};

export type ResponseMadeItems = {
    Filename: string;
    FnetId: any;
    HouseNumber: any;
    Id: number;
    ItemType: string;
    Media: any;
    MediaFileType: number;
    MediaFileTypeText: any;
    MiType: any;
    Modified: any;
    ModifiedBy: any;
    Notes: any;
    ParentId: any;
    ProductionId: number;
    Programm: any;
    SourceDurationText: any;
    Status: number;
    StatusText: string;
    Title: any;
    TitleMediaId: number;
    TvStandardText: any;
    TvStd: any;
    VerFullTitle: any;
    VersionInfo: any;
}

export type ResponseMadeItemsDetail = {
    "AudioTracks": [],
    "DeletedAudioTracks": any,
    "Events": [],
    "DeletedEvents": any,
    "Segments": Segments[],
    "DeletedSegments": any,
    "Faults": [],
}

export type TemplateConfig = {
    "Id": number,
    "Name": string,
    "AllColumns": {},
    "Groups":
        {
            "Columns": {
                "Id": string,
                "Title": string,
            }[],
            "GroupName": any
        }[],
    "AllTabs": {
        [key: string]: string,
    },
    "TabsData": string[],
    "ConfigTypeId": number,
    "ConfigTypeText": string,
    "ConfigTypeLookup": {
        [key: string]: string,
    }
}

// /api/v3/config/production/template/185
export type TemplateFields = {
    "ReadOnly": boolean,
    "Data": {
        "Id": number,
        "TemplateUiFields": {
            "Field": string,
            "Mandatory": boolean,
            "Value": string
        }[],
        "CONFIG_ID": number,
        "DEFAULT_VERSIONS": [
            {
                "DURATION": number,
                "NAME": string,
                "Children":
                    {
                        "DURATION": number,
                        "NAME": string,
                        "Children": []
                    }[]

            }[]
        ],
        "CREATED_DT": string,
        "CREATED_BY": string,
        "MODIFIED_DT": string,
        "MODIFIED_BY": string,
        "PUB_WORKFLOW_ID": number,
        "PROD_WORKFLOW_ID": number,
        "APPROVAL_WORKFLOW_ID": number,
        "COMPLETE_WORKFLOW_ID": number,
        "TV_STD": number,
        "ASSISTANT_ID": number,
        "MEDIA_FILE_TYPE": number,
        "NAME": string,
        "ACTIVE": boolean,
        "CHANNELS":
            {
                "ID": number,
                "CH_CODE": string,
                "CH_FULL": string
            }[],
        "MI_TYPE": number,
        "APPROVAL_NAMING_RULE_ID": number,
        "MADE_REMAKE_WORKFLOW_ID": number,
        "MADE_COMPLETE_WORKFLOW_ID": number,
        "DUE_DATE_ADJ": number,
        "AVID_SCHEMA_ID": 1242,
        "AudioTracks": any[],
        "Segments": any[],
        "Subtitles": any[],
        "XmlSchemas": any[],
        "Notifications": any[],
    }[],
    "Lookups": {},
    "View": {
        "Columns": {
            "Field": string,
            "Label": string,
            "DataType": string,
            "Rules": any,
            "ItemsSource": any,
            "GridView": any
        }[]


    },
    "ValidationRules": any
}
export type TemplateFields_DEFAULT_VERSIONS =
            {
                "DURATION": number,
                "NAME": string,
                "Children":
                    {
                        "DURATION": number,
                        "NAME": string,
                        "Children": []
                    }[]

            }[]
