// import { HttpModule } from '@angular/http';
// import { async, TestBed, inject } from '@angular/core/testing';
// import { ArrayProvider } from '../../../providers/common/array.provider';
// import { DebounceProvider } from '../../../providers/common/debounce.provider';
// import { StringProivder } from '../../../providers/common/string.provider';
// import { HttpService } from '../../../services/http/http.service';
// import { SecurityService } from '../../../services/security/security.service';
// import { LoginService } from '../../../services/login/login.service';
// import { Router } from '@angular/router';
// import { ErrorManager } from '../../error/error.manager';
// import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
// import { ProfileService } from '../../../services/profile/profile.service';
// import { ErrorManagerProvider } from '../../error/providers/error.manager.provider';
// import { ServerStorageService } from '../../../services/storage/server.storage.service';
// import { NotificationService } from '../../notification/services/notification.service';
// import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
// import { ExportService } from '../services/export.service';
// import { ChangeDetectorRef } from '@angular/core';
//
// describe('(unit) Service: ExportService', () => {
//
//     let exportAllPagesInHTML = {
//         ExportType: 'HTML',
//         ExtendedColumns: [
//             'ACCESS_STATUS',
//             'CONSIGNMENT_NUMBER',
//             'TRANSFER_NUMBER',
//             'CRS_SERIES',
//             'DISPOSAL_STATUS',
//             'DISPOSAL_CLASS_TEXT',
//             'AGENCY',
//             'U_ID_EXT1',
//             'ORIGIN',
//             'PROD_LANGUAGE',
//             'ITEM_FORMAT_TEXT',
//             'FLAGS',
//             'PGM_STATUS_TEXT',
//             'AGENCY_NUMBER',
//             'VER_DURATION_text',
//             'TAGS_TEXT'
//         ],
//         Page: -1,
//         SearchCriteria: [],
//         SearchType: 'Media',
//         SortDirection: '',
//         SortField: '',
//         Text: 'ix3',
//         View: {
//             ColumnData: {
//                 ID: {
//                     Tag: 'ID',
//                     Index: 0,
//                     Width: 53
//                 },
//                 TITLE: {
//                     Tag: 'TITLE',
//                     Index: 1,
//                     Width: 135
//                 },
//                 SER_TITLE: {
//                     Tag: 'SER_TITLE',
//                     Index: 2,
//                     Width: 82
//                 },
//                 M_CTNR_LOC_text: {
//                     Tag: 'M_CTNR_LOC_text',
//                     Index: 3,
//                     Width: 1019
//                 },
//                 PROXY_URL: {
//                     Tag: 'PROXY_URL',
//                     Index: 4,
//                     Width: 598
//                 }
//             },
//             SearchColumns: [],
//             ShowThumbs: false,
//             Id: 375,
//             PlacementId: 0,
//             ViewName: 'iMFX_MI_Default',
//             IsPublic: true,
//             Type: 'MediaGrid'
//         }
//     };
//
//     let exportAllPagesInExcel = {
//         ExportType: 'Excel',
//         ExtendedColumns: [
//             'ACCESS_STATUS',
//             'CONSIGNMENT_NUMBER',
//             'TRANSFER_NUMBER',
//             'CRS_SERIES',
//             'DISPOSAL_STATUS',
//             'DISPOSAL_CLASS_TEXT',
//             'AGENCY',
//             'U_ID_EXT1',
//             'ORIGIN',
//             'PROD_LANGUAGE',
//             'ITEM_FORMAT_TEXT',
//             'FLAGS',
//             'PGM_STATUS_TEXT',
//             'AGENCY_NUMBER',
//             'VER_DURATION_text',
//             'TAGS_TEXT'
//         ],
//         Page: -1,
//         SearchCriteria: [],
//         SearchType: 'Media',
//         SortDirection: '',
//         SortField: '',
//         Text: 'ix3',
//         View: {
//             ColumnData: {
//                 ID: {
//                     Tag: 'ID',
//                     Index: 0,
//                     Width: 53
//                 },
//                 TITLE: {
//                     Tag: 'TITLE',
//                     Index: 1,
//                     Width: 135
//                 },
//                 SER_TITLE: {
//                     Tag: 'SER_TITLE',
//                     Index: 2,
//                     Width: 82
//                 },
//                 M_CTNR_LOC_text: {
//                     Tag: 'M_CTNR_LOC_text',
//                     Index: 3,
//                     Width: 1019
//                 },
//                 PROXY_URL: {
//                     Tag: 'PROXY_URL',
//                     Index: 4,
//                     Width: 598
//                 }
//             },
//             SearchColumns: [],
//             ShowThumbs: false,
//             Id: 375,
//             PlacementId: 0,
//             ViewName: 'iMFX_MI_Default',
//             IsPublic: true,
//             Type: 'MediaGrid'
//         }
//     };
//
//     let exportAllPagesInCSV = {
//         ExportType: 'CSV',
//         ExtendedColumns: [
//             'ACCESS_STATUS',
//             'CONSIGNMENT_NUMBER',
//             'TRANSFER_NUMBER',
//             'CRS_SERIES',
//             'DISPOSAL_STATUS',
//             'DISPOSAL_CLASS_TEXT',
//             'AGENCY',
//             'U_ID_EXT1',
//             'ORIGIN',
//             'PROD_LANGUAGE',
//             'ITEM_FORMAT_TEXT',
//             'FLAGS',
//             'PGM_STATUS_TEXT',
//             'AGENCY_NUMBER',
//             'VER_DURATION_text',
//             'TAGS_TEXT'
//         ],
//         Page: -1,
//         SearchCriteria: [],
//         SearchType: 'Media',
//         SortDirection: '',
//         SortField: '',
//         Text: 'ix3',
//         View: {
//             ColumnData: {
//                 ID: {
//                     Tag: 'ID',
//                     Index: 0,
//                     Width: 53
//                 },
//                 TITLE: {
//                     Tag: 'TITLE',
//                     Index: 1,
//                     Width: 135
//                 },
//                 SER_TITLE: {
//                     Tag: 'SER_TITLE',
//                     Index: 2,
//                     Width: 82
//                 },
//                 M_CTNR_LOC_text: {
//                     Tag: 'M_CTNR_LOC_text',
//                     Index: 3,
//                     Width: 1019
//                 },
//                 PROXY_URL: {
//                     Tag: 'PROXY_URL',
//                     Index: 4,
//                     Width: 598
//                 }
//             },
//             SearchColumns: [],
//             ShowThumbs: false,
//             Id: 375,
//             PlacementId: 0,
//             ViewName: 'iMFX_MI_Default',
//             IsPublic: true,
//             Type: 'MediaGrid'
//         }
//     };
//
//     let exportCurrentPageInHTML = {
//         ExportType: 'HTML',
//         ExtendedColumns: [
//             'ACCESS_STATUS',
//             'CONSIGNMENT_NUMBER',
//             'TRANSFER_NUMBER',
//             'CRS_SERIES',
//             'DISPOSAL_STATUS',
//             'DISPOSAL_CLASS_TEXT',
//             'AGENCY',
//             'U_ID_EXT1',
//             'ORIGIN',
//             'PROD_LANGUAGE',
//             'ITEM_FORMAT_TEXT',
//             'FLAGS',
//             'PGM_STATUS_TEXT',
//             'AGENCY_NUMBER',
//             'VER_DURATION_text',
//             'TAGS_TEXT'
//         ],
//         Page: 1,
//         SearchCriteria: [],
//         SearchType: 'Media',
//         SortDirection: '',
//         SortField: '',
//         Text: 'ix3',
//         View: {
//             ColumnData: {
//                 ID: {
//                     Tag: 'ID',
//                     Index: 0,
//                     Width: 53
//                 },
//                 TITLE: {
//                     Tag: 'TITLE',
//                     Index: 1,
//                     Width: 135
//                 },
//                 SER_TITLE: {
//                     Tag: 'SER_TITLE',
//                     Index: 2,
//                     Width: 82
//                 },
//                 M_CTNR_LOC_text: {
//                     Tag: 'M_CTNR_LOC_text',
//                     Index: 3,
//                     Width: 1019
//                 },
//                 PROXY_URL: {
//                     Tag: 'PROXY_URL',
//                     Index: 4,
//                     Width: 598
//                 }
//             },
//             SearchColumns: [],
//             ShowThumbs: false,
//             Id: 375,
//             PlacementId: 0,
//             ViewName: 'iMFX_MI_Default',
//             IsPublic: true,
//             Type: 'MediaGrid'
//         }
//     };
//
//     let exportCurrentPageInExcel = {
//         ExportType: 'Excel',
//         ExtendedColumns: [
//             'ACCESS_STATUS',
//             'CONSIGNMENT_NUMBER',
//             'TRANSFER_NUMBER',
//             'CRS_SERIES',
//             'DISPOSAL_STATUS',
//             'DISPOSAL_CLASS_TEXT',
//             'AGENCY',
//             'U_ID_EXT1',
//             'ORIGIN',
//             'PROD_LANGUAGE',
//             'ITEM_FORMAT_TEXT',
//             'FLAGS',
//             'PGM_STATUS_TEXT',
//             'AGENCY_NUMBER',
//             'VER_DURATION_text',
//             'TAGS_TEXT'
//         ],
//         Page: 1,
//         SearchCriteria: [],
//         SearchType: 'Media',
//         SortDirection: '',
//         SortField: '',
//         Text: 'ix3',
//         View: {
//             ColumnData: {
//                 ID: {
//                     Tag: 'ID',
//                     Index: 0,
//                     Width: 53
//                 },
//                 TITLE: {
//                     Tag: 'TITLE',
//                     Index: 1,
//                     Width: 135
//                 },
//                 SER_TITLE: {
//                     Tag: 'SER_TITLE',
//                     Index: 2,
//                     Width: 82
//                 },
//                 M_CTNR_LOC_text: {
//                     Tag: 'M_CTNR_LOC_text',
//                     Index: 3,
//                     Width: 1019
//                 },
//                 PROXY_URL: {
//                     Tag: 'PROXY_URL',
//                     Index: 4,
//                     Width: 598
//                 }
//             },
//             SearchColumns: [],
//             ShowThumbs: false,
//             Id: 375,
//             PlacementId: 0,
//             ViewName: 'iMFX_MI_Default',
//             IsPublic: true,
//             Type: 'MediaGrid'
//         }
//     };
//
//     let exportCurrentPageInCSV = {
//         ExportType: 'CSV',
//         ExtendedColumns: [
//             'ACCESS_STATUS',
//             'CONSIGNMENT_NUMBER',
//             'TRANSFER_NUMBER',
//             'CRS_SERIES',
//             'DISPOSAL_STATUS',
//             'DISPOSAL_CLASS_TEXT',
//             'AGENCY',
//             'U_ID_EXT1',
//             'ORIGIN',
//             'PROD_LANGUAGE',
//             'ITEM_FORMAT_TEXT',
//             'FLAGS',
//             'PGM_STATUS_TEXT',
//             'AGENCY_NUMBER',
//             'VER_DURATION_text',
//             'TAGS_TEXT'
//         ],
//         Page: 1,
//         SearchCriteria: [],
//         SearchType: 'Media',
//         SortDirection: '',
//         SortField: '',
//         Text: 'ix3',
//         View: {
//             ColumnData: {
//                 ID: {
//                     Tag: 'ID',
//                     Index: 0,
//                     Width: 53
//                 },
//                 TITLE: {
//                     Tag: 'TITLE',
//                     Index: 1,
//                     Width: 135
//                 },
//                 SER_TITLE: {
//                     Tag: 'SER_TITLE',
//                     Index: 2,
//                     Width: 82
//                 },
//                 M_CTNR_LOC_text: {
//                     Tag: 'M_CTNR_LOC_text',
//                     Index: 3,
//                     Width: 1019
//                 },
//                 PROXY_URL: {
//                     Tag: 'PROXY_URL',
//                     Index: 4,
//                     Width: 598
//                 }
//             },
//             SearchColumns: [],
//             ShowThumbs: false,
//             Id: 375,
//             PlacementId: 0,
//             ViewName: 'iMFX_MI_Default',
//             IsPublic: true,
//             Type: 'MediaGrid'
//         }
//     };
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
//                 ExportService,
//                 ChangeDetectorRef
//             ]
//         });
//         (<any>window).IMFX_API_URL = 'http://192.168.90.39';
//     }));
//
//     describe('(unit) 1. Export all pages', () => {
//         it('(unit) 1.1 Should get export data in html format',
//         async(inject([ExportService, LoginService], (exportService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 exportService.getExportData(exportAllPagesInHTML).subscribe((result) => {
//                     expect(result.type).toEqual('text/html');
//                 });
//             });
//         })));
//
//         it('(unit) 1.2 Should get export data in excel format',
//         async(inject([ExportService, LoginService], (exportService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 exportService.getExportData(exportAllPagesInExcel).subscribe((result) => {
//                     expect(result.type).toEqual('application/vnd.ms-excel');
//                 });
//             });
//         })));
//
//         it('(unit) 1.3 Should get export data in csv format',
//         async(inject([ExportService, LoginService], (exportService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 exportService.getExportData(exportAllPagesInCSV).subscribe((result) => {
//                     expect(result.type).toEqual('text/csv');
//                 });
//             });
//         })));
//     });
//
//     describe('(unit) 2 Export current page', () => {
//         it('(unit) 2.1 Should get export data in html format',
//         async(inject([ExportService, LoginService], (exportService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 exportService.getExportData(exportCurrentPageInHTML).subscribe((result) => {
//                     expect(result.type).toEqual('text/html');
//                 });
//             });
//         })));
//
//         it('(unit) 2.2 Should get export data in excel format',
//         async(inject([ExportService, LoginService], (exportService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 exportService.getExportData(exportCurrentPageInExcel).subscribe((result) => {
//                     expect(result.type).toEqual('application/vnd.ms-excel');
//                 });
//             });
//         })));
//
//         it('(unit) 2.3 Should get export data in csv format',
//         async(inject([ExportService, LoginService], (exportService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 exportService.getExportData(exportCurrentPageInCSV).subscribe((result) => {
//                     expect(result.type).toEqual('text/csv');
//                 });
//             });
//         })));
//     });
// });
