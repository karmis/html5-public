export class ValidFields {
    // static AGE_CERTIFICATION = 'AGE_CERTIFICATION';
    // static TV_STD = 'TV_STD';
    // static ASPECT_R_ID = 'ASPECT_R_ID';
    // static USAGE_TYPE = 'USAGE_TYPE';
    // static AFD_ID = 'AFD_ID';
    // static ITEM_TYPE = 'ITEM_TYPE';
    // static MEDIA_FORMAT_text = 'MEDIA_FORMAT_text';
    static CustomStatuses = {funcName: 'checkValidCustomStatuses'};
    static Segments = ['TYPE', /*'PRT_TTL',*/ 'SOMS', 'EOMS'];
    static Events = ['TYPE', /*'PRT_TTL',*/ 'SOMS', 'EOMS'];
    static AudioTracks = ['TypeId', 'LanguageId', 'MsTypeId'];
    static Faults = ['FAULT_ID', 'TIMECODE_IN', 'TIMECODE_OUT'];
}
