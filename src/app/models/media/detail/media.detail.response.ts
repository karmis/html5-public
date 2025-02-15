import { MediaDetailSegments } from './media.detail.segments';
import { MediaDetailAudioTracks } from './media.detail.audio.tracks';
import { MediaDetailSubtitles } from './media.detail.subtitles';

export type MediaDetailResponse = {
    $id: string;
    Events: any;
    DeletedEvents: any;
    Segments?: Array<MediaDetailSegments>;
    DeletedSegments: any;
    AudioTracks?: Array<MediaDetailAudioTracks>;
    DeletedAudioTracks: any;
    TAGS_TEXT: any;
    DFILE_LINK_GUID: string;
    TRANSFER_NUMBER: string;
    CRS_SERIES: string;
    FLAGS: string;
    FILE_SOM: number;
    FILE_EOM: number;
    MEDIA_TYPE_text: string;
    MEDIA_STATUS_text: string;
    MEDIA_STATUS_color: string;
    SOM_text: string;
    EOM_text: string;
    TV_STD_text: string;
    FILESIZE_text: string;
    OWNERS_text: string;
    DURATION_text: string;
    USAGE_TYPE_text: string;
    AGE_CERTIFICATION_text: string;
    QC_FLAG_text: string;
    MEDIA_FORMAT_text: string;
    AGENCY_NUMBER: string;
    ACCESS_STATUS: string;
    AGENCY: string;
    DISPOSAL_STATUS: string;
    DISPOSAL_CLASS_TEXT: string;
    DISPOSAL_CLASS: any;
    CONSIGNMENT_NUMBER: string;
    ASPECT_R_text: string;
    AFD_ID_text: string;
    ITEM_TYPE_text: string;
    CC_FLAG_text: string;
    AUD_LANGUAGE_ID_text: string;
    BARCODE: string;
    LOCATION: string;
    FLAG_10_text: string;
    FLAG_11_text: string;
    FLAG_12_text: string;
    FLAG_13_text: string;
    FLAG_14_text: string;
    FLAG_15_text: string;
    M_CTNR_LOC_text: string;
    IsPlayableVideo: boolean;
    IsImageDisplayable: boolean;
    PROXY_URL: string;
    TimecodeFormat: string;
    Status_text: string;
    THUMBFILE: string;
    THUMBSERVER: string;
    THUMBID: number;
    FILENAME: string;
    FILEPATH: any;
    DFILE_SRVER_ID: any;
    Subtitles?: Array<MediaDetailSubtitles>;
    VAL1: number;
    SuitableVoec: boolean;
    CtnrId: string;
    MediaState: any;
    U_ID_EXT1: string;
    ORIGIN: string;
    PROD_LANGUAGE: string;
    ITEM_FORMAT_TEXT: string;
    PGM_STATUS_TEXT: string;
    ASSISTED_QC_TEXT: string;
    TX_DATE: any;
    VER_DURATION_text: string;
    OS_FNAME: any;
    MediaFormatIconId: number;
    SdHdIconId: number;
    FullTitle: string;
    MediaTypeOriginal: number;
    FileExtension: string;
    IsGangedMain: boolean;
    IsLive: boolean;
    ID: number;
    MEDIA_TYPE: number;
    MIID1: string;
    MIID2: string;
    M_CTNR_ID: string;
    M_CTNR_TYPE_ID: string;
    M_CTNR_FMT_ID: number;
    M_CTNR_LOC: string;
    ITEM_TYPE: number;
    NET_GRP_ID: number;
    NET_GRP_NAME: string;
    OWNERS: string;
    PGM_ABS_ID: number;
    PGM_RL_ID: number;
    PGM_PARENT_ID: number;
    PGM_PARENT_TYPE: number;
    PGM_PARENT_LEVEL: number;
    PGM_PARENT_VERSION: string;
    SER_ABS_ID: number;
    SER_ABS2_ID: number;
    SER_TYPE: number;
    SER_EP_NUM: number;
    SER_EP_SQ_NUM: number;
    SER_CT_SQ_NUM: number;
    SOM: number;
    EOM: number;
    OC_SOM: number;
    OC_EOM: number;
    EC_SOM: number;
    EC_EOM: number;
    ORIG_EC_DR: number;
    CREATED_BY: string;
    CREATED_DT: string;
    MODIFIED_BY: string;
    MODIFIED_DT: string;
    ASPECT_R_ID: number;
    AFD_ID: number;
    FLAG_MASTER: number;
    FLAG_MASTER_EN: number;
    DESCRIPTION: string;
    TITLE: string;
    SER_TITLE: string;
    SER_NAME: string;
    SER_NUM: number;
    VERSION: string;
    VERSION_TYPE: number;
    SERIESID1: string;
    SERIESID2: string;
    PROGID1: string;
    PROGID2: string;
    VERSIONID1: string;
    VERSIONID2: string;
    GRADE_ID: number;
    GRADED: number;
    AQ: number;
    VQ: number;
    ASSES_ID: number;
    CERT_ID: number;
    DESTROY_DT: any;
    WIPE_DT: any;
    AUD_NOISE_RED_ID: number;
    VID_PROC_ID: number;
    AUD_TYPE: number;
    AUD_LANGUAGE_ID: number;
    BI_SUBTITLES: number;
    ACCEPT_DT: any;
    ACCEPTANCE_LTTR_ID: number;
    COMPLIANCE_ID: number;
    SUB_TYP: number;
    SUB_VERIF: number;
    SUB_ID: number;
    SUB_FN: string;
    AUD_DES: number;
    AUD_DESC_ID: number;
    SIGNED: number;
    SIGNED_ID: number;
    EXTERNALLY_OWNED_ID: number;
    RETURN_DATE: any;
    NUM_PARTS: number;
    USAGE_TYPE: number;
    STATUS: number;
    PRNT: string;
    TV_NUM: number;
    CLK_NUM: string;
    LAST_MVMT: number;
    NUM_ITEMS: number;
    LINE_STD: number;
    TV_STD: number;
    LAST_BKG: number;
    COMPIL: number;
    CRET_JOB: number;
    FROM_EPS: number;
    TO_EPS: number;
    COL: number;
    SLT_DUR: number;
    ORIG_CTTL: string;
    PROD_YR: number;
    PART_SEG: string;
    PSE_ID: number;
    LAST_JOB_ID: number;
    LAST_TQ_RPT: number;
    TX_FLG: number;
    TX_FLG_EN: number;
    FOR_LANG_VER: string;
    PYS_OWN_GRP_ID: number;
    PYS_OWN_NAME: string;
    PYS_OWNERS: string;
    M_CNTR_DBID: string;
    TAP_ST: string;
    TAP_ED: string;
    M_CNTR_BC: string;
    M_CNTR_BCT: string;
    DUR: number;
    AU_NUM: number;
    AU_NM: string;
    AU_CONT: string;
    AU_LANG: string;
    AU_MS: string;
    AU_NR: string;
    AU_NTS: string;
    AU_SP: string;
    AU_DMD_IDS: string;
    AU_MUSIC_IDS: string;
    M_CTNR_INT_O_LOC: number;
    M_CTNR_EXT_O_LOC: number;
    FRST_TXD: any;
    TXSH_ID: number;
    COMM_AQD: number;
    META_ID: number;
    U_FRM_TXD: any;
    U_TO_TXD: any;
    MM_EXT_ID: any;
    MM_REF1: string;
    MM_REF2: string;
    TX_STAT: number;
    COMM_CODE: string;
    DV_CAT: string;
    DV_MG: string;
    MI_FMT_CODE: string;
    MI_FMT_TYPE: any;
    FILE_TYP: any;
    META_STATE: any;
    V_CODEC: any;
    V_BR: any;
    V_SAMP_TYP: any;
    V_GOP_LEN: any;
    A_CODEC: any;
    A_BR: any;
    A_BIT_PER_SAMP: any;
    A_SAMP_RATE: any;
    PARENT_ID: number;
    TREE_LEVEL: number;
    MEDIA_STATUS: any;
    FILE_SYS: number;
    PRGM_ID_INHOUSE: string;
    MI_DELETED: boolean;
    MI_DELETED_DT: any;
    MI_DELETED_BY: string;
    CTX_TEXT_COL: string;
    CTX_IDS_COL: string;
    MI_CHECKSUM: string;
    MI_CHECKSUM_DT: any;
    MI_CHECKSUM_TYPE: number;
    MI_HISTORY: string;
    MI_LINK_ID: number;
    GROUP_SERIES_ID: any;
    MI_LINK_GUID: string;
    ITEM_INDEX: number;
    MI_GUID: string;
    LAST_TX_DATE: any;
    PRODUCER: string;
    SUPPLIER: string;
    PRIMARY_THUMB_ID: any;
    CONTENT_LAST_MODIFIED_DT: any;
    AGE_CERTIFICATION: any;
    MIID3: string;
    EntityKey: any
};
