// import { HttpModule } from '@angular/http';
// import { async, TestBed, inject } from '@angular/core/testing';
// import { ArrayProvider } from '../../../../providers/common/array.provider';
// import { DebounceProvider } from '../../../../providers/common/debounce.provider';
// import { StringProivder } from '../../../../providers/common/string.provider';
// import { HttpService } from '../../../../services/http/http.service';
// import { SecurityService } from '../../../../services/security/security.service';
// import { LoginService } from '../../../../services/login/login.service';
// import { Router } from '@angular/router';
// import { ErrorManager } from '../../../error/error.manager';
// import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
// import { ProfileService } from '../../../../services/profile/profile.service';
// import { ErrorManagerProvider } from '../../../error/providers/error.manager.provider';
// import { ServerStorageService } from '../../../../services/storage/server.storage.service';
// import { NotificationService } from '../../../notification/services/notification.service';
// import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
// import { SearchAdvancedService } from '../services/search.advanced.service';
// import { SearchAdvancedProvider } from '../providers/search.advanced.provider';
// import { LookupService } from '../../../../services/lookup/lookup.service';
// import { AdvancedSearchGroupRef } from '../types';
// import { ChangeDetectorRef } from '@angular/core';
//
// describe('(unit) Service: SearchAdvancedService', () => {
//     let arrOfStruct: Array<AdvancedSearchGroupRef> = [
//         {
//             id: 0,
//             mode: 'example',
//             criterias: [
//             {
//                 selectedField: 'OWNERS_text',
//                 selectedOperator: '=',
//             },
//             {
//                 selectedField: 'CREATED_DT',
//                 selectedOperator: '>',
//             },
//             {
//                 selectedField: 'CREATED_DT',
//                 selectedOperator: '<',
//             },
//             {
//                 selectedField: 'CC_FLAG_text',
//                 selectedOperator: '<',
//             }
//             ]
//         }
//     ];
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
//                 SearchAdvancedService,
//                 SearchAdvancedProvider,
//                 LookupService,
//                 ChangeDetectorRef
//             ]
//         });
//         (<any>window).IMFX_API_URL = 'http://192.168.90.39';
//     }));
//
//     describe('(unit) 1. Function getSearchInfo', () => {
//         it('(unit) 1.1 Should get list of fields for current view with view name '
//         + 'for Media and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Media', false).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.2 Should get list of fields for current view with view name '
//         + 'for Version and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Version', false).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.3 Should get list of fields for current view with view name '
//         + 'for AutomatedTask and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('AutomatedTask', false).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.4 Should get list of fields for current view with view name '
//         + 'for -4008 and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('-4008', false).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.5 Should get list of fields for current view with view name '
//         + 'for Job and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Job', false).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.6 Should get list of fields for current view with view name '
//         + 'for Tape and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Tape', false).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.7 Should get list of fields for current view with view name '
//         + 'for TitleSearch and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('TitleSearch', false).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.8 Should get list of fields for current view with view name '
//         + 'for Media and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Media', true).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.9 Should get list of fields for current view with view name '
//         + 'for Version and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Version', true).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.10 Should get list of fields for current view with view name '
//         + 'for AutomatedTask and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('AutomatedTask', true).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.11 Should get list of fields for current view with view name '
//         + 'for -4008 and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('-4008', true).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.12 Should get list of fields for current view with view name '
//         + 'for Job and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Job', true).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.13 Should get list of fields for current view with view name '
//         + 'for Tape and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('Tape', true).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//
//         it('(unit) 1.14 Should get list of fields for current view with view name '
//         + 'for TitleSearch and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getSearchInfo('TitleSearch', true).subscribe((result) => {
//                     expect(result.FieldNameAndType.length).not.toEqual(0);
//                 });
//             });
//         })));
//     });
//
//     describe('(unit) 2. Function getFields', () => {
//         it('(unit) 2.1 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for media and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Media', false).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.2 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for version and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Version', false).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.3 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for AutomatedTask and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('AutomatedTask', false).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.4 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for -4008 and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('-4008', false).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.5 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for Job and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Job', false).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.6 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for Tape and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Tape', false).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.7 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for TitleSearch and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('TitleSearch', false).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.8 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for media and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Media', true).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.9 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for version and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Version', true).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.10 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for AutomatedTask and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('AutomatedTask', true).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.11 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for -4008 and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('-4008', true).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.12 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for Job and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Job', true).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.13 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for Tape and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('Tape', true).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 2.14 Should get prepared object contained list of fields and list'
//         + 'of prepared fields for select2 for TitleSearch and cacheClear equal true',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getFields('TitleSearch', true).subscribe((result) => {
//                     expect(result.items.length).not.toEqual(0);
//                     expect(result.props).not.toEqual({});
//                 });
//             });
//         })));
//     });
//
//     describe('(unit) 3. Function getOperators', () => {
//         it('(unit) 3.1 Should get list of operators(SearchSupportedOperators) and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getOperators(
//                     'SearchSupportedOperators',
//                     false
//                 ).subscribe((result) => {
//                     expect(result).not.toEqual({});
//                 });
//             });
//         })));
//
//         it('(unit) 3.2 Should get list of operators(SearchSupportedOperators) and cacheClear equal false',
//         async(inject([SearchAdvancedService, LoginService], (searchAdvancedService, loginService) => {
//             loginService.login('sergeyt', 'sergeyt').subscribe(() => {
//                 searchAdvancedService.getOperators(
//                     'SearchSupportedOperators',
//                     true
//                 ).subscribe((result) => {
//                     expect(result).not.toEqual({});
//                 });
//             });
//         })));
//     });
//
//     describe('(unit) 4. Function getStructure', () => {
//
//         it('(unit) 4.1 Should get structure of query builder',
//         async(inject([SearchAdvancedService], (searchAdvancedService) => {
//             let res = searchAdvancedService.getStructure();
//             expect(res).toEqual(arrOfStruct);
//         })));
//     });
// });
