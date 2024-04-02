// import { HttpModule } from '@angular/http';
// import { async, TestBed, inject } from '@angular/core/testing';
// import { ArrayProvider } from '../../../providers/common/array.provider';
// import { DebounceProvider } from '../../../providers/common/debounce.provider';
// import { StringProivder } from '../../../providers/common/string.provider';
// import { HttpService } from '../../../services/http/http.service';
// import { SecurityService } from '../../../services/security/security.service';
// import { LoginService } from '../../../services/login/login.service';
// import { Router } from '@angular/router';
// import { ErrorManager } from '../../../modules/error/error.manager';
// import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
// import { ProfileService } from '../../../services/profile/profile.service';
// import { ErrorManagerProvider } from '../../../modules/error/providers/error.manager.provider';
// import { ServerStorageService } from '../../../services/storage/server.storage.service';
// import { NotificationService } from '../../../modules/notification/services/notification.service';
// import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
// import { ClipEditorService } from '../clip.editor.service';
// import { ChangeDetectorRef } from '@angular/core';
//
// let rows = {
//     $id: '1',
//     ACCEPTANCE_LTTR_ID: 1,
//     ACCEPT_DT: '2018-02-15T11:30:24',
//     ACCESS_STATUS: '',
//     AFD_ID: 0,
//     AFD_ID_text: 'Unknown [0]',
//     AGENCY: '',
//     AGENCY_NUMBER: '',
//     AGE_CERTIFICATION: null,
//     AGE_CERTIFICATION_text: '',
//     AQ: 0,
//     ASPECT_R_ID: 1,
//     ASPECT_R_text: '16:9',
//     ASSES_ID: 0,
//     ASSISTED_QC_TEXT: 'Not Set',
//     AUD_DES: 0,
//     AUD_DESC_ID: 0,
//     AUD_LANGUAGE_ID: 0,
//     AUD_LANGUAGE_ID_text: 'None',
//     AUD_NOISE_RED_ID: 0,
//     AUD_TYPE: 2,
//     AU_CONT: '',
//     AU_DMD_IDS: '',
//     AU_LANG: '',
//     AU_MS: '',
//     AU_MUSIC_IDS: '',
//     AU_NM: '',
//     AU_NR: '',
//     AU_NTS: '',
//     AU_NUM: 0,
//     AU_SP: '',
//     A_BIT_PER_SAMP: 0,
//     A_BR: 0,
//     A_CODEC: 0,
//     A_SAMP_RATE: 0,
//     AudioTracks: [],
//     BARCODE: '',
//     BI_SUBTITLES: 0,
//     CC_FLAG_text: '',
//     CERT_ID: 0,
//     CLK_NUM: '',
//     COL: 0,
//     COMM_AQD: 0,
//     COMM_CODE: '',
//     COMPIL: 8390658,
//     COMPLIANCE_ID: 0,
//     CONSIGNMENT_NUMBER: '',
//     CONTENT_LAST_MODIFIED_DT: null,
//     CREATED_BY: 'TMDDBA',
//     CREATED_DT: '2017-02-28T16:31:58',
//     CRET_JOB: 0,
//     CRS_SERIES: '',
//     CTX_IDS_COL: 'A',
//     CTX_TEXT_COL: 'A',
//     CtnrId: 'proxy_testing_90.39',
//     DESCRIPTION: '',
//     DESTROY_DT: null,
//     DFILE_LINK_GUID: 'BF5D713181F74CDA8E2B0C99B27712CD',
//     DFILE_SRVER_ID: null,
//     DISPOSAL_CLASS: null,
//     DISPOSAL_CLASS_TEXT: '',
//     DISPOSAL_STATUS: '',
//     DUR: 0,
//     DURATION_text: '00:03:00:00',
//     DV_CAT: '',
//     DV_MG: '',
//     DeletedAudioTracks: null,
//     DeletedEvents: null,
//     DeletedSegments: null,
//     EC_EOM: 0,
//     EC_SOM: 0,
//     EOM: 94500,
//     EOM_text: '01:03:00:00',
//     EXTERNALLY_OWNED_ID: 21510,
//     EntityKey: null,
//     Events: [],
//     FILENAME: 'dne space h264.mov',
//     FILEPATH: null,
//     FILESIZE_text: '47.5  MB',
//     FILE_EOM: 94500,
//     FILE_SOM: 90000,
//     FILE_SYS: 0,
//     FILE_TYP: null,
//     FLAGS: '',
//     FLAG_10_text: 'No',
//     FLAG_11_text: 'No',
//     FLAG_12_text: 'No',
//     FLAG_13_text: 'No',
//     FLAG_14_text: 'No',
//     FLAG_15_text: 'No',
//     FLAG_MASTER: 0,
//     FLAG_MASTER_EN: 0,
//     FOR_LANG_VER: '',
//     FROM_EPS: 0,
//     FRST_TXD: null,
//     FileExtension: 'mov',
//     FullTitle: 'BIG BUCK BUNNY',
//     GRADED: 0,
//     GRADE_ID: 0,
//     GROUP_SERIES_ID: null,
//     ID: 65866,
//     ITEM_FORMAT_TEXT: '',
//     ITEM_INDEX: 0,
//     ITEM_TYPE: 1,
//     ITEM_TYPE_text: 'Programme',
//     IsGanged: false,
//     IsGangedMain: false,
//     IsImageDisplayable: false,
//     IsLive: false,
//     IsPlayableVideo: true,
//     LAST_BKG: 0,
//     LAST_JOB_ID: 0,
//     LAST_MVMT: 0,
//     LAST_TQ_RPT: 0,
//     LAST_TX_DATE: null,
//     LINE_STD: 3,
//     LOCATION: '\\192.168.90.39\proxy_testing\dne space h264.mov',
//     MEDIA_FORMAT_text: 'H264 MOV',
//     MEDIA_STATUS: null,
//     MEDIA_STATUS_color: '',
//     MEDIA_STATUS_text: '-',
//     MEDIA_TYPE: 100,
//     MEDIA_TYPE_text: 'Media File',
//     META_ID: 0,
//     META_STATE: null,
//     MIID1: 'MX65866',
//     MIID2: '',
//     MIID3: '',
//     MI_CHECKSUM: '73D1B8224F7740D27041662B0BEDE059',
//     MI_CHECKSUM_DT: '2018-02-15T13:46:57',
//     MI_CHECKSUM_TYPE: 1,
//     MI_DELETED: false,
//     MI_DELETED_BY: '',
//     MI_DELETED_DT: null,
//     MI_FMT_CODE: '',
//     MI_FMT_TYPE: null,
//     MI_GUID: '452D53212F61475684F821AC190F8749',
//     MI_HISTORY: '',
//     MI_LINK_GUID: '500A4C15904242399062CE9459419764',
//     MI_LINK_ID: 65866,
//     MM_EXT_ID: null,
//     MM_REF1: '',
//     MM_REF2: '',
//     MODIFIED_BY: '',
//     MODIFIED_DT: '2018-02-15T13:46:57',
//     M_CNTR_BC: '',
//     M_CNTR_BCT: '',
//     M_CNTR_DBID: '',
//     M_CTNR_EXT_O_LOC: 0,
//     M_CTNR_FMT_ID: 7,
//     M_CTNR_ID: '|proxy_testing_90.39|',
//     M_CTNR_INT_O_LOC: 0,
//     M_CTNR_LOC: '|\\192.168.90.39\proxy_testing\dne space h264.mov|',
//     M_CTNR_LOC_text: '\\192.168.90.39\proxy_testing\dne space h264.mov',
//     M_CTNR_TYPE_ID: '|47.5  MB|',
//     MediaFormatIconId: 30,
//     MediaState: null,
//     MediaTypeOriginal: 100,
//     NET_GRP_ID: 265,
//     NET_GRP_NAME: '',
//     NUM_ITEMS: 1,
//     NUM_PARTS: 0,
//     OC_EOM: 4500,
//     OC_SOM: 0,
//     ORIGIN: 'SUPPLIED',
//     ORIG_CTTL: '',
//     ORIG_EC_DR: 0,
//     OS_FNAME: null,
//     OWNERS: '|DCUK|RTUK|',
//     OWNERS_text: 'Discovery UK, Real Time UK',
//     PARENT_ID: 0,
//     PART_SEG: '',
//     PGM_ABS_ID: 30307,
//     PGM_PARENT_ID: 30308,
//     PGM_PARENT_LEVEL: 1,
//     PGM_PARENT_TYPE: 3020,
//     PGM_PARENT_VERSION: 'SUPPLIER MASTER',
//     PGM_RL_ID: 30308,
//     PGM_STATUS_TEXT: 'Delivered',
//     PRGM_ID_INHOUSE: '',
//     PRIMARY_THUMB_ID: 3040913,
//     PRNT: '',
//     PRODUCER: '',
//     PROD_LANGUAGE: '',
//     PROD_YR: 0,
//     PROGID1: '',
//     PROGID2: '',
//     PROXY_URL: 'http://192.168.90.39/proxy_testing/dne space h264.mov',
//     PSE_ID: 0,
//     PYS_OWNERS: '',
//     PYS_OWN_GRP_ID: 0,
//     PYS_OWN_NAME: '',
//     QC_FLAG_text: 'Pass',
//     RETURN_DATE: null,
//     SERIESID1: '',
//     SERIESID2: '',
//     SER_ABS2_ID: 0,
//     SER_ABS_ID: 0,
//     SER_CT_SQ_NUM: 0,
//     SER_EP_NUM: 0,
//     SER_EP_SQ_NUM: 0,
//     SER_NAME: '',
//     SER_NUM: 0,
//     SER_TITLE: '',
//     SER_TYPE: 0,
//     SIGNED: 0,
//     SIGNED_ID: 0,
//     SLT_DUR: 0,
//     SOM: 90000,
//     SOM_text: '01:00:00:00',
//     STATUS: 1,
//     SUB_FN: '',
//     SUB_ID: 0,
//     SUB_TYP: 0,
//     SUB_VERIF: 0,
//     SUPPLIER: '',
//     SdHdIconId: 12,
//     Segments: [],
//     Status_text: 'IN',
//     Subtitles: [
//         {
//             Format: 'Subtitle PAC File',
//             Id: 65854,
//             IsoCode: 'None',
//             Language: 'None',
//             Url: 'http://192.168.90.39/getcaptions.aspx?f=956582E-SCG.PAC&som=01:00:00:00&storage=SUBSSTORE&modified=636235297430000000&tcf=0&tmp=0&format=WebVTT',
//         },
//         {
//             Format: 'Subtitle PAC File',
//             Id: 65855,
//             IsoCode: 'None',
//             Language: 'None',
//             Url: 'http://192.168.90.39/getcaptions.aspx?f=ESD_SDAUDIO001_SUB.PAC&som=01:00:00:00&storage=SUBSSTORE&modified=636235297440000000&tcf=0&tmp=0&format=WebVTT',
//         },
//         {
//             Format: 'Subtitle PAC File',
//             Id: 65857,
//             IsoCode: 'None',
//             Language: 'None',
//             Url: 'http://192.168.90.39/getcaptions.aspx?f=956582E-NLD - Copy.PAC&som=01:00:00:00&storage=SUBSSTORE&modified=636235297920000000&tcf=0&tmp=0&format=WebVTT',
//         },
//         {
//             Format: 'Subtitle PAC File',
//             Id: 65858,
//             IsoCode: 'None',
//             Language: 'None',
//             Url: 'http://192.168.90.39/getcaptions.aspx?f=ESD_SDAUDIO001_SUB - Copy.PAC&som=01:00:00:00&storage=SUBSSTORE&modified=636235297930000000&tcf=0&tmp=0&format=WebVTT',
//         },
//         {
//             Format: 'Subtitle PAC File',
//             Id: 65859,
//             IsoCode: 'None',
//             Language: 'None',
//             Url: 'http://192.168.90.39/getcaptions.aspx?f=SDAUDIO001-ITZ - Copy.PAC&som=01:00:00:00&storage=SUBSSTORE&modified=636235297930000000&tcf=0&tmp=0&format=WebVTT',
//         },
//         {
//             Format: 'Subtitle STL File',
//             Id: 114792,
//             IsoCode: 'None',
//             Language: 'None',
//             Url: 'http://192.168.90.39/getcaptions.aspx?f=145104-ESP - Copy.stl&som=01:00:00:00&storage=proxy_testing_90.39&modified=636463355390000000&tcf=0&tmp=0&format=WebVTT',
//         }
//     ],
//     SuitableVoec: false,
//     TAGS_TEXT: null,
//     TAP_ED: '',
//     TAP_ST: '',
//     THUMBFILE: 'F1DCF69597994997A84ABFD9941959AA.dat',
//     THUMBID: 3040913,
//     THUMBSERVER: 'IMG_THUMBS',
//     THUMBURL: 'http://192.168.90.39/getfile.aspx?id=3040913',
//     TITLE: 'BIG BUCK BUNNY',
//     TO_EPS: 0,
//     TRANSFER_NUMBER: '',
//     TREE_LEVEL: 1,
//     TV_NUM: 2,
//     TV_STD: 2,
//     TV_STD_text: '625 / 25 (608)',
//     TXSH_ID: 0,
//     TX_DATE: null,
//     TX_FLG: 0,
//     TX_FLG_EN: 0,
//     TX_STAT: 0,
//     TimecodeFormat: 'Pal',
//     USAGE_TYPE: 0,
//     USAGE_TYPE_text: 'Unknown [0]',
//     U_FRM_TXD: null,
//     U_ID_EXT1: '',
//     U_TO_TXD: null,
//     VAL1: 0,
//     VERSION: 'SUPPLIER MASTER',
//     VERSIONID1: 'bigbuck1',
//     VERSIONID2: '',
//     VERSION_TYPE: 0,
//     VER_DURATION_text: '00:00',
//     VID_PROC_ID: 0,
//     VQ: 0,
//     V_BR: 0,
//     V_CODEC: 0,
//     V_GOP_LEN: 0,
//     V_SAMP_TYP: 0,
//     WIPE_DT: null,
//     _hdSd_icon: 0,
//     _hdSd_icon_not_formated: 12,
//     _media_icon: 0,
//     _media_icon_not_formated: 30,
// };
//
// describe('(unit) Service: ClipEditorService', () => {
//
//     beforeEach( async(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpModule],
//             providers: [
//                 ArrayProvider,
//                 ErrorManagerProvider,
//                 DebounceProvider,
//                 StringProivder,
//                 HttpService,
//                 LocalStorageService,
//                 LoginService,
//                 ProfileService,
//                 SecurityService,
//                 ServerStorageService,
//                 SessionStorageService,
//                 ErrorManager,
//                 {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
//                 NotificationService,
//                 Location,
//                 LocationStrategy,
//                 { provide: LocationStrategy, useClass: PathLocationStrategy },
//                 { provide: APP_BASE_HREF, useValue: 'app/'},
//                 ClipEditorService,
//                 ChangeDetectorRef
//             ]
//         });
//         (<any>window).IMFX_API_URL = 'http://192.168.90.39';
//     }));
//
//     it('(unit) 1. Should get the set selected rows',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             сlipEditorService.setSelectedRows([rows]);
//             expect(сlipEditorService.selectedRows).toEqual([rows]);
//         });
//     })));
//
//     it('(unit) 2. Should get selected rows',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             let res = сlipEditorService.getSelectedRows([rows]);
//             expect(res).toEqual([rows]);
//         });
//     })));
//
//     it('(unit) 3. Should get the set audio flag equals true',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             сlipEditorService.setIsAudio(true);
//             expect(сlipEditorService.isAudioField).toEqual(true);
//         });
//     })));
//
//     it('(unit) 4. Should get audio flag equals true',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             let res = сlipEditorService.isAudio();
//             expect(res).toEqual(true);
//         });
//     })));
//
//     it('(unit) 5. Should get the set audio flag equals false',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             сlipEditorService.setIsAudio(false);
//             expect(сlipEditorService.isAudioField).toEqual(false);
//         });
//     })));
//
//     it('(unit) 6. Should get audio flag equals false',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             let res = сlipEditorService.isAudio();
//             expect(res).toEqual(false);
//         });
//     })));
//
//     it('(unit) 7. Should get the set clip editor type equals Media',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             сlipEditorService.setClipEditorType('Media');
//             expect(сlipEditorService.editorType).toEqual('Media');
//             let res = сlipEditorService.getClipEditorType();
//             expect(res).toEqual('Media');
//         });
//     })));
//
//     it('(unit) 8. Should get the set clip editor type equals Version',
//     async(inject([ClipEditorService, LoginService], (сlipEditorService, loginService) => {
//         loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//             сlipEditorService.setClipEditorType('Version');
//             expect(сlipEditorService.editorType).toEqual('Version');
//             let res = сlipEditorService.getClipEditorType();
//             expect(res).toEqual('Version');
//         });
//     })));
// });
