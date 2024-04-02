// /**
//  * Created by Sergey Klimenko on 13.04.2017.
//  */
//
// import { TestBed, async, inject } from '@angular/core/testing';
// import { BaseRequestOptions, HttpModule } from '@angular/http';
// import { MisrSearchService } from '../../../../../services/viewsearch/misr.service';
// import { HttpService } from '../../../../../services/http/http.service';
// import { ConfigService } from '../../../../../services/config/config.service';
// import { NetworkError } from '../../../../../modules/error/models/network.error';
// import { ErrorManager } from '../../../../../modules/error/error.manager';
// import { RuntimeError } from '../../../../../modules/error/models/runtime.error';
// import { DebounceProvider } from '../../../../../providers/common/debounce.provider';
// import { Router } from '@angular/router';
// import { ArrayProvider } from '../../../../../providers/common/array.provider';
// import {
//   ErrorManagerProvider
// } from '../../../../../modules/error/providers/error.manager.provider';
// import { StringProivder } from '../../../../../providers/common/string.provider';
// import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
// import { LoginService } from '../../../../../services/login/login.service';
// import { ProfileService } from '../../../../../services/profile/profile.service';
// import {
//   SearchAdvancedService
// } from '../../../../../modules/search/advanced/services/search.advanced.service';
// import { SecurityService } from '../../../../../services/security/security.service';
// import { ServerStorageService } from '../../../../../services/storage/server.storage.service';
// import { LookupService } from '../../../../../services/lookup/lookup.service';
// import {
//   NotificationService
// } from '../../../../../modules/notification/services/notification.service';
// import { Location, LocationStrategy, APP_BASE_HREF, PathLocationStrategy } from '@angular/common';
//
// describe('(unit) IMFX Chart data ', () => {
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpModule],
//       providers: [
//         BaseRequestOptions,
//         MisrSearchService,
//         HttpService,
//         ConfigService,
//         NetworkError,
//         ErrorManager,
//         RuntimeError,
//         DebounceProvider,
//         ArrayProvider,
//         ErrorManagerProvider,
//         StringProivder,
//         LocalStorageService,
//         LoginService,
//         ProfileService,
//         SecurityService,
//         ServerStorageService,
//         SessionStorageService,
//         {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
//         LookupService,
//         NotificationService,
//         Location,
//         LocationStrategy,
//         { provide: LocationStrategy, useClass: PathLocationStrategy },
//         { provide: APP_BASE_HREF, useValue: 'app/'}
//       ]
//     });
//     (<any>window).IMFX_API_URL = 'http://192.168.90.39';
//   });
//
//   it('(unit) Should get chart data from server',
//     async(inject([MisrSearchService], (misrService: MisrSearchService) => {
//
//       misrService.getChartData(null).subscribe((result) => {
//       if (result.length > 0) {
//         expect(result[0].ReadyCount).toBeDefined();
//         expect(result[0].WarnCount).toBeDefined();
//         expect(result[0].ErrorCount).toBeDefined();
//       }
//     });
//   })));
//
// });
