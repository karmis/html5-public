export interface LoanDetailItems {
    TYPE?: 4000 | 4500 | 4001 | number;
    Item?: {};
    ID?: any;
    ITEM_ID?: number;
}

export interface LoanDetailResponse {
    PlacedBy: string;
    "Id"?: number,
    "DetailItems": Array<LoanDetailItems>,
    "RequestedBy": "TMDDBA" | string,
    "CreatedBy": "TMDDBA" | string,
    "BookingTypeID": number,
    "DeliverTo"?: null,
    "NaDeliverTo"?: {
        ID: 8001551,
        AgencyID: 0,
        Biography: null,
        Provenance: "",
        Type: "Agency",
        Name: "TMD LTD",
        RelatedAgency: null,
        RelatedProvenance: null,
    },
    "DeliveryAddress"?: null,
    "DeliveryMethodID": number | string,
    "Reference"?: null,
    "RequiredFromDate"?: string,
    "ReturnDate"?: string,
    "Notes"?: string,
    "CreatedDate"?: string

}

export interface LoanSettings {
    MaxLoanPeriod: number;
    RequiredDays: number;
    ReturnDays: number;
}

export interface LoanVersionItem {
    ID: 14011
    PRGM_ID_INHOUSE: null
    VERSIONID1: null
    VERSIONID2: "F5F287DBA0CE430196753DB0600EE27C"
    OWNERS_text: "Discovery Middle East"
    FORMAT_text: "Unknown"
    DURATION_text: "00:00"
    //another
    $id: "1"
    Segments: null
    AudioTracks: null
    SLOT_DUR_dt: "0001-01-01T00:00:00"
    FULLTITLE: null
    Children: null
    TV_STD_text: "Unknown [0]"
    SLOT_DUR_text: "00:00:00"
    ME8_TYPE_text: "Unknown [0]"
    COL_MONO_text: "Unknown [0]"
    ASPECT_R_text: "4:3"
    AFD_CODE_text: "Unknown [0]"
    AUD_LANGUAGE_ID_text: ""
    USAGE_TYPE_text: ""
    CERT_TYPE_text: "NR"
    PROD_FROM_DATE: null
    PROD_TO_DATE: null
    THUMBFILE: null
    THUMBSERVER: null
    THUMBID: 0
    SOUND: null
    PROD_COLOUR_TEXT: null
    PROD_LANGUAGE: null
    PROD_AUDIO: null
    PROD_DATE_TYPE: null
    PGM_STATUS_TEXT: null
    SUB_MEDIUM_TEXT: null
    PACKAGE_TYPE: 0
    CustomStatuses: null
    DynamicFields: {}
    ITEM_TYPE: 1040
    ME8_TYPE: 0
    SER_ABS_ID: 13926
    SER_ABS2_ID: -3
    SER_TYPE: 0
    SER_EP_NUM: 0
    SER_EP_SQ_NUM: 0
    SER_CT_SQ_NUM: 0
    PGM_ABS_ID: 14010
    PGM_RL_ID: 14011
    PARENT_ID: 14010
    PARENT_TYPE: 1020
    TREE_LEVEL: 2
    TITLE: "TESTING TALES CHRISTMAS SPECIAL 1"
    SER_TITLE: "TESTING TALES"
    SER_NAME: null
    SER_NUM: 0
    ORIG_CT_TITLE: null
    VERSION: "PROTECTION MASTER"
    VERSION_TYPE: 3
    SERIESID1: null
    SERIESID2: null
    PROGID1: null
    PROGID2: null
    DUR: 0
    PROD_YEAR: 0
    AUDIO_TYPE: 2
    FLAG_MASTER: 0
    FLAG_MASTER_EN: 0
    DISTRIBUTER_ID: null
    SUPPLIER_ID: null
    NET_GRP_ID: -1
    NET_GRP_NAME: null
    OWNERS: "|DMEA|"
    CREATED_DT: "2009-10-29T16:24:25"
    CREATED_BY: "TMDDBA"
    MODIFIED_DT: "2019-10-16T14:56:00"
    MODIFIED_BY: "TMDDBA"
    ASPECT_R: 0
    FMT_ID: -1
    END_CRED_DUR: 0
    ITEM_STATUS: 0
    ITEM_STATUS_ID: 0
    EXP_ARRIVAL_DT: null
    ARRIVAL_DT: null
    DELIVERY_TYPE: null
    DELIVERY_BY: null
    AG: 0
    VG: 0
    AFD_CODE: 0
    EXT_OWNER_ID: 0
    NOTES: null
    ITV_CAT: null
    ITV_TYPE: 0
    CNTRY_QO_DAT: null
    CNTRY_PRCNT_DAT: null
    COPY_PRNT_NUM: 0
    ACCEPTED_DT: null
    ACCEPTED_BY: null
    NUM_OF_TAPES: 0
    CLOCK_NUM: null
    COL_MONO: 0
    WIPE_DEST_DT: null
    RETURN_DT: null
    RETURN_TO: null
    CONTACT_ID: null
    MATOWNTYP: null
    SRC_TYPE: null
    CONTAIN_ID: null
    BAY_DEV_REF: null
    DELIV_METHOD: null
    DELIV_REF: null
    LOGGED_IN_BY: null
    LOGGED_IN_DT: null
    FROM_EPS: 0
    TO_EPS: 0
    DEL: 0
    CERTIFIED: 0
    CERT_TYPE: 0
    SUBTLD: 0
    SUBT_FMT: 0
    LINE_STD: 0
    TV_STD: 0
    IN_CONTRACT: 0
    EXP_FMT: null
    ORIG_LANG: null
    SLOT_DUR: 0
    N_TX_DT: null
    N_TX_SCID: null
    N_TX_EVID: null
    AUD_LANGUAGE_ID: null
    AU_NUM: null
    AU_NM: null
    AU_LANG: null
    AU_MS: null
    AU_CONT: null
    AU_DMS_IDS: null
    AU_MUSIC_IDS: null
    AU_SP: null
    AU_NTS: null
    AU_NR: null
    SUB_MEDIUM_ID: null
    LEGACY_NOTES: null
    MI_ID_SQ_NUM: 1
    RL_DELETED: false
    RL_DELETED_DT: null
    RL_DELETED_BY: null
    CTX_TEXT_COL: "A"
    CTX_IDS_COL: "A"
    PGM_RL_HISTORY: null
    LICENCE_START_DATE: null
    PGM_GUID: "6B15F53D3A714E68BFE942DBC4F21577"
    PUBLISH_STATUS: 0
    PUBLISH_DATE: null
    PRIMARY_THUMB_ID: null
    CERT_SUB_TYPE: null
    PGM_STATUS2: null
    PGM_STATUS2_MODIFIED_DT: null
    TM_LIVESHED_REQUESTS: Array<any>
    EntityKey: null
}

