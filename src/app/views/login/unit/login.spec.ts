/**
 * Created by Sergey Trizna on 13.04.2017.
 */

import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from '../login.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async, inject, fakeAsync } from '@angular/core/testing';
import { DebugElement, ChangeDetectorRef } from '@angular/core';
import { MisrSearchService } from '../../../services/viewsearch/misr.service';
import { HttpService } from '../../../services/http/http.service';
import { ConfigService } from '../../../services/config/config.service';
import { NetworkError } from '../../../modules/error/models/network.error';
import { ErrorManager } from '../../../modules/error/error.manager';
import { RuntimeError } from '../../../modules/error/models/runtime.error';
import { DebounceProvider } from '../../../providers/common/debounce.provider';
import { ModalProvider } from '../../../modules/modal/providers/modal.provider';
import { ArrayProvider } from '../../../providers/common/array.provider';
import { StringProivder } from '../../../providers/common/string.provider';
import { BasketService } from '../../../services/basket/basket.service';
import { LoginService } from '../../../services/login/login.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { SecurityService } from '../../../services/security/security.service';
import { LoginProvider } from '../providers/login.provider';
import {
    TranslateModule,
    TranslateService, TranslateLoader, TranslateDirective, TranslateParser, TranslatePipe
} from '@ngx-translate/core';
import { SessionStorageService, LocalStorageService } from "ngx-webstorage";
import { ErrorManagerProvider } from '../../../modules/error/providers/error.manager.provider';
import { ServerStorageService } from '../../../services/storage/server.storage.service';
import { NotificationService } from '../../../modules/notification/services/notification.service';
import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';

const PROVIDERS = [
    {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
    FormBuilder,
    ErrorManagerProvider,
    MisrSearchService,
    HttpService,
    ConfigService,
    NetworkError,
    ErrorManager,
    ModalProvider,
    RuntimeError,
    DebounceProvider,
    LoginService,
    LoginProvider,
    ServerStorageService,
    SessionStorageService,
    StringProivder,
    ProfileService,
    LocalStorageService,
    SecurityService,
    ArrayProvider,
    {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
    BasketService,
    ChangeDetectorRef,
    TranslateService,
    TranslateLoader,
    TranslateDirective,
    TranslateParser,
    TranslatePipe,
    NotificationService,
    Location,
    LocationStrategy,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: APP_BASE_HREF, useValue: 'app/'}
];

describe('(unit) Component: LoginComponent', () => {
    let de: DebugElement;
    let comp: LoginComponent;
    let serv: LoginService;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach( async(() => {
        TestBed.configureTestingModule({
            declarations: [LoginComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [TranslateModule, FormsModule, ReactiveFormsModule],
            providers: [
                PROVIDERS
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        comp = fixture.componentInstance;
        comp.MYngOnInit();
    }));

    it('(unit) Should checking have component', () => {
        expect(comp).toBeDefined();
    });

    it('(unit) Should checking form on validity', () => {
        expect(comp.loginForm.valid).toBeFalsy();
    });

    it('(unit) Should checking the input(username) for validity', () => {
        let errors = {};
        let username = comp.loginForm.controls['username'];
        errors = username.errors || {};
        expect(errors['required']).toBeTruthy();
    });

    it('(unit) Should checking the input(password) for validity', () => {
        let errors = {};
        let password = comp.loginForm.controls['password'];
        errors = password.errors || {};
        expect(errors['required']).toBeTruthy();
    });

    it('(unit) Should form field validity with filled username', () => {
        comp.loginForm.controls['username'].setValue('tmddba');
        expect(comp.loginForm.valid).toBeFalsy();
    });

    it('(unit) Should form field validity with filled password', () => {
        comp.loginForm.controls['password'].setValue('*.tmd02');
        expect(comp.loginForm.valid).toBeFalsy();
    });

    it('(unit) Should return success validity for form', () => {
        comp.loginForm.controls['username'].setValue('tmddba');
        comp.loginForm.controls['password'].setValue('*.tmd02');

        expect(comp.loginForm.valid).toBeTruthy();
    });
});

// describe('IMFX XML Node class', () => {
//
//     // let xmlTree: IMFXXMLTree;
//
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpModule],
//             providers: [
//                 BaseRequestOptions,
//                 XMLService,
//                 HttpService,
//                 Cookie
//             ]
//         });
//         (<any>window).IMFX_API_URL = 'http://192.168.90.39';
//     });
//
//     beforeEach(async(inject([XMLService], (xmlService: XMLService) => {
//         () => {
//             xmlService.getSampleXmlData().subscribe((result) => {
//                 // /*debugger*/;
//                 xmlTree = new IMFXXMLTree(result.XmlModel, result.SchemaModel);
//             })
//             waitsFor(function () {
//                 return !!xmlTree;
//             }, 'Timed out', 1000);
//         }
//     })));
//
//     describe('General tests', () => {
//         it('Get xml from server', async(inject([XMLService], (xmlService: XMLService) => {
//             xmlService.getSampleXmlData().subscribe((result) => {
//                 expect(result.SchemaModel).toBeDefined();
//                 expect(result.XmlModel).toBeDefined();
//             })
//         })));
//     });
//
//     // describe('Overrides', () => {
//     it('Enum', () => {
//         // /*debugger*/;
//         let node = xmlTree.nodes[0].xml;
//         expect(node).toBeDefined();
//     });
//     // });
//
// });
