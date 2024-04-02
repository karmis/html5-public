// /**
//  * Created by dvvla on 24.07.2017.
//  */
//
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
// import { ChangeDetectorRef } from '@angular/core';
//
// describe('(unit) Service: LoginService', () => {
//     let accessToken;
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
//                 ChangeDetectorRef
//             ]
//         });
//         (<any>window).IMFX_API_URL = 'http://192.168.90.39';
//     }));
//
//     it('(unit) Should get authorized user',
//         async(inject([LoginService, ProfileService], (loginService, profileService) => {
//
//         loginService.login('sergeyt', 'sergeyt').subscribe((res: any) => {
//             expect(res).not.toEqual([]);
//             accessToken = res.authReps.access_token;
//         });
//     })));
//
//     it('(unit) Should get data authorized user', async(inject([LoginService], (loginService) => {
//         let res = loginService.getAuthData();
//         expect(res.access_token).toEqual(accessToken);
//     })));
//
//     it('(unit) Should get the truth if the user is authorized',
//         async(inject([LoginService], (loginService) => {
//
//         let res = loginService.isLoggedIn();
//         expect(res).toEqual(true);
//     })));
//
//     it('(unit) Should get the path "simple"', async(inject([LoginService], (loginService) => {
//         loginService.setTargetPath('simple');
//         let res = loginService.getTargetPath();
//         expect(res).toEqual('simple');
//     })));
//
//     it('(unit) Should get an unauthorized user', async(inject([LoginService], (loginService) => {
//         loginService.clear();
//         let res = loginService.getAuthData();
//         let object = {};
//         expect(res).toEqual(object);
//         let logged = loginService.isLoggedIn();
//         expect(logged).toEqual(false);
//     })));
// });
