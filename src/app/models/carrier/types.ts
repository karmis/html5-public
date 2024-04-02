export type CarrierDetailFileBrowseResponseType = {
    Files: CarrierDetailFileType[]
    FullPath: string,       //"\Manual"
    Id: number,             //85272
    MoreResults: boolean,   //false
    ParentUid: number,      //1
    TapeBarcode: string,    //"TMD015L"
    TapeId: number,         //51
    UId: number,            //2
}

export type CarrierDetailFileType = {
    ArchiveTime?: string,    //"2020-11-06T14:19:21"
    DiskCopies?: number,     //0
    Group?: string,          //""
    Id: number,             //85273
    IsFolder: boolean,      //true
    Name: string,           //"2020-11-06-14-18-52"
    ParentUid?: number,      //2
    Path?: string,           //"\Manual\2020-11-06-14-18-52"
    ReadOnly?: boolean,      //false
    Size?: number,           //0
    SizeString?: string,     //"0B"
    TapeBarcode?: string,    //"TMD015L"
    TapeCopies?: number,     //1
    TapeId?: number,         //51
    UId: number,            //3
}
