// NG Modules
import { ApplicationRef, ChangeDetectorRef, LOCALE_ID, NgModule } from '@angular/core';
import {CommonModule, Location, registerLocaleData} from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularSplitModule } from 'angular-split';
import { ModalModule as ng2Modal } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
// IMFX Modules
import { IMFXLanguageSwitcherModule } from './modules/language.switcher';
import { ErrorManagerModule } from './modules/error';
import { IMFXDropDownDirectiveModule } from './directives/dropdown/dropdown.directive.module';
/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// App is our top level component
import { BaseComponent } from './views/base/base.component';
import { MediaBasketPanelComponent } from './views/base/components/media.basket.panel/media.basket.panel.component';
import { MediaBasketPanelItemComponent } from './views/base/components/media.basket.panel/components/media.basket.panel.item/media.basket.panel.item.component';
import { BaseLanguageSwitcherComponent } from './views/base/components/base.language.switcher/base.language.switcher.component';
import { BaseProfileComponent } from './views/base/components/base.profile/base.profile.component';
import { BaseTopMenuComponent } from './views/base/components/base.top.menu/base.top.menu.component';
import { NoContentComponent } from './views/no-content';
import { NoAccessComponent } from './views/no-access';
// Providers
import { SecurityLoadProvider } from './providers/security/security.load.provider';
import { MediaBasketProvider } from './providers/media.basket/media.basket.provider';
import { NativeWindowProvider } from './providers/common/native.window.provider';
import { ArrayProvider } from './providers/common/array.provider';
import { SplashProvider } from './providers/design/splash.provider';
import { DebounceProvider } from './providers/common/debounce.provider';
import { StringProivder } from './providers/common/string.provider';
import { UploadProvider } from './modules/upload/providers/upload.provider';
import { DefaultSearchProvider } from './modules/search/providers/defaultSearchProvider';
// deps for grid
// Services
import { LoginService } from './services/login/login.service';
import { BasketService } from './services/basket/basket.service';
import { MisrSearchService } from './services/viewsearch/misr.service';
import { XMLService } from './services/xml/xml.service';
import { HttpService } from './services/http/http.service';
import { ConfigService } from './services/config/config.service';
import { ProfileService } from './services/profile/profile.service';
import { SecurityService } from './services/security/security.service';
import { SplashService } from './services/splash/splash.service';

import { IMFXRouteReuseStrategy } from './strategies/route.reuse.strategy';
import { OverlayModule } from './modules/overlay';
import { ProfileColorSchemasComponent } from './views/base/components/base.profile/components/colorschemas/colorschemas.component';
import { DetailData } from 'app/services/viewsearch/detail.service';
// import { UploadService } from './modules/upload/services/upload.service';
import { ServerStorageService } from './services/storage/server.storage.service';
import { NotificationModule } from './modules/notification';
import { NotificationService } from './modules/notification/services/notification.service';
import { LoginProvider } from './views/login/providers/login.provider';
import { ConsumerSettingsTransferProvider } from './modules/settings/consumer/consumer.settings.transfer.provider';
import { ControlToAdvTransfer } from './services/viewsearch/controlToAdvTransfer.service';
import { RouteReuseProvider } from './strategies/route.reuse.provider';
import { LookupService } from './services/lookup/lookup.service';


import { DownloadService } from './services/common/download.service';
import { ClipEditorService } from './services/clip.editor/clip.editor.service';
import { TagsModule } from './modules/controls/tags';
import { ThumbModule } from './modules/controls/thumb';
import { ModalPreviewPlayerProvider } from './modules/modal.preview.player/providers/modal.preview.player.provider';
// import {ModalPreviewPlayerModule} from './modules/modal.preview.player';
import { BaseProvider } from './views/base/providers/base.provider';
import { ViewsProvider } from './modules/search/views/providers/views.provider';
import { SplitProvider } from './providers/split/split.provider';
import { AudioSynchProvider } from './modules/controls/html.player/providers/audio.synch.provider';
import { ThemesProvider } from './providers/design/themes.providers';
import { ExportProvider } from './modules/export/providers/export.provider';
import { IMFXModalProvider } from './modules/imfx-modal/proivders/provider';
import { VersionWizardProvider } from './modules/version-wizard/providers/wizard.provider';
import { ViewsService } from './modules/search/views/services/views.service';
import { JobService } from './views/workflow/services/jobs.service';
// import {IMFXModalPromptComponent} from './modules/imfx-modal/comps/prompt/prompt';
// import {IMFXModalPromptModule} from './modules/imfx-modal/comps/prompt';
import { IMFXModalAlertComponent } from './modules/imfx-modal/comps/alert/alert';


import { IMFXControlTreeProvider } from './modules/controls/tree/providers/control.tree.provider';
import { IMFXAccessControlModule } from './modules/access';
import { IMFXTextDirectionDirectiveModule } from './directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { SecurityActivateProvider } from './providers/security/security.activate';
import { LookupSearchService } from './services/lookupsearch/common.service';
// import {EditSomEomModalComponent} from './modules/search/detail/components/modals/edit.som.eom.modal/edit.som.eom.modal.component';
// import EditSomEomModalModule from './modules/search/detail/components/modals/edit.som.eom.modal';
import { ChoosingRowsModalModule } from './modules/controls/choosing.rows.modal';
import { ChoosingRowsModalComponent } from './modules/controls/choosing.rows.modal/choosing.rows.modal.component';
import { SearchFormModule } from './modules/search/form';
import { SearchThumbsModule } from './modules/search/thumbs';
import { MediaChangeStatusModule } from './views/media/modules/media-status';
import { TaskPendingModule } from './modules/search/tasks-control-buttons/comps/pending.modal';
import ru_RU from '@angular/common/locales/ru';
import en_GB from '@angular/common/locales/en-GB';
import en_AU from '@angular/common/locales/en-AU';
import hr_CRO from '@angular/common/locales/hr';
import en_US from '@angular/common/locales/en-US-POSIX';
import { IMFXModalAlertModule } from "./modules/imfx-modal/comps/alert";
import { SettingsGroupsService } from './services/system.config/settings.groups.service';
// import SaveDefaultLayoutModalModule from "./modules/search/detail/components/modals/save.default.layout.modal";
import { ServerGroupStorageService } from './services/storage/server.group.storage.service';
import { ClipboardProvider } from './providers/common/clipboard.provider';
import { ErrorRefreshModalModule } from './modules/error/modules/error-refresh';
import { CookieService } from "ng2-cookies";
import { TimeProvider } from './providers/common/time.provider';
import { IMFXModalGlobalProvider } from "./modules/imfx-modal/proivders/imfx-modal.global.provider";
import { ConsumerSearchProvider } from 'app/views/consumer/consumer.search.provider';
import { JsonProvider } from './providers/common/json.provider';
import { NativeUploadService } from "./modules/upload/services/native.upload.service";
import { RemoteUploadService } from "./modules/upload/services/remote.upload.service";
import { AsperaUploadService } from "./modules/upload/services/aspera.upload.service";
import { UploadService } from "./modules/upload/services/upload.service";
import { WorkflowProvider } from "./providers/workflow/workflow.provider";
import { ErrorModalModule } from "./modules/error/modules/error-modal";
import { ErrorModalComponent } from "./modules/error/modules/error-modal/error";
import { BaseUploadMenuComponent } from "./views/base/components/base.upload/base.upload.component";
import { IMFXModalModule } from "./modules/imfx-modal";
import { IMFXModalComponent } from "./modules/imfx-modal/imfx-modal";
import { NativeNavigatorProvider } from './providers/common/native.navigator.provider';
// import {SelectTracksModalModule} from "./views/detail/tasks/component.qc/modals/select.tracks.modal";
// import {SelectTracksModalComponent} from "./views/detail/tasks/component.qc/modals/select.tracks.modal/select.tracks";
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from "@angular/common/http";
import { TimepickerModule } from "ngx-bootstrap";
import { ExportService } from "./modules/export/services/export.service";
import { SlickGridModule } from "./modules/search/slick-grid";
import {DEFAULT_TIMEOUT, ImfxHttpInterceptor} from './services/http/http.interceptor';
import { WorkerProvider } from "./providers/worker/worker.provider";
import { NativeChunkUploadService } from "./modules/upload/services/native.chunk.upload.service";
import { SafePipeModule } from "./modules/pipes/safePipe";
import {MultilineTextComponent} from "./modules/controls/xml.tree/components/modals/multiline.text/multiline.text.component";
import {IMFXXMLTreeModule} from "./modules/controls/xml.tree";
import { BaseMobileMenuComponent } from './views/base/components/base.mobile.menu/base.mobile.menu.component';
import { StorageAutoCleanerProvider } from './providers/common/storage.auto.cleaner.provider';
import { DigitOnlyModule } from 'app/directives/digit-only/digit-only.module';
import { ColumnsOrderService } from './modules/search/columns-order/services/columns.order.service';
import {TreeDraggedElement} from "angular-tree-component";
import {DetailService} from "./modules/search/detail/services/detail.service";
import {MediaVideoPipe} from "./pipes/media.video.pipe/media.video.pipe";
import {XmlSchemaListPipe} from "./modules/pipes/xml.schema.list/xml.schema.list.pipe";
import {PreviousRouteService} from "./services/common/previous.route.service";
// import {ViewDetailModalModule} from './modules/search/views/comp/view.detail.modal';



registerLocaleData(ru_RU);
registerLocaleData(en_GB);
registerLocaleData(en_AU);
registerLocaleData(en_US);
registerLocaleData(hr_CRO);


export const ROOT_SELECTOR = 'app';

// Application wide providers
const APP_PROVIDERS = [
    IMFXModalGlobalProvider,
    TimeProvider,
    TranslateService,
    LookupSearchService,
    SecurityActivateProvider,
    SecurityLoadProvider,
    MediaBasketProvider,
    NativeWindowProvider,
    NativeNavigatorProvider,
    BasketService,
    MisrSearchService,
    XMLService,
    LoginService,
    HttpService,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ImfxHttpInterceptor,
        multi: true // multi: true <= necessary
    },
    ConfigService,
    ProfileService,
    SplashService,
    SecurityService,
    ArrayProvider,
    SplashProvider,
    DebounceProvider,
    LoginProvider,
    // ChangeDetectorRef,
    DefaultSearchProvider,
    StringProivder,
    UploadProvider,
    UploadService,
    AsperaUploadService,
    RemoteUploadService,
    NativeUploadService,
    NativeChunkUploadService,
    DetailData,

    ServerStorageService,
    NotificationService,
    // BrowserAnimationsModule,
    ConsumerSettingsTransferProvider,
    ControlToAdvTransfer,
    RouteReuseProvider,
    ClipEditorService,
    LookupService,
    ModalPreviewPlayerProvider,
    DownloadService,
    BaseProvider,
    ViewsProvider,
    SplitProvider,
    AudioSynchProvider,
    ThemesProvider,
    IMFXModalProvider,
    VersionWizardProvider,
    ViewsService,
    JobService,
    IMFXControlTreeProvider,
    SettingsGroupsService,
    ServerGroupStorageService,
    ClipboardProvider,
    CookieService,
    ConsumerSearchProvider,
    JsonProvider,
    WorkflowProvider,
    ExportService,
    ExportProvider,
    ChangeDetectorRef,
    WorkerProvider,
    StorageAutoCleanerProvider,
    ColumnsOrderService,
    TreeDraggedElement,
    DetailService,
    MediaVideoPipe,
    XmlSchemaListPipe,
    Location,
    [{ provide: HTTP_INTERCEPTORS, useClass: ImfxHttpInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: 30000 }],
    PreviousRouteService
    // FacetsService

];


// AoT requires an exported function for factories
export function HttpLoaderFactory(httpInst: HttpClient) {
    return new TranslateHttpLoader(httpInst, './assets/i18n/', '.json?v=' + (<any>window).IMFX_VERSION);
}

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
    bootstrap: [BaseComponent],
    declarations: [
        BaseComponent,
        MediaBasketPanelComponent,
        BaseUploadMenuComponent,
        BaseLanguageSwitcherComponent,
        BaseProfileComponent,
        BaseTopMenuComponent,
        BaseMobileMenuComponent,
        MediaBasketPanelItemComponent,
        NoContentComponent,
        NoAccessComponent,
        // LogoutByTimeoutComponent,
        ProfileColorSchemasComponent,
        BaseUploadMenuComponent,
        MediaVideoPipe
    ],
    imports: [ // import Angular's modules
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(ROUTES, {useHash: true, enableTracing: false, scrollPositionRestoration: "enabled"}),
        NgxWebstorageModule.forRoot({prefix: 'tmd', separator: '.', caseSensitive: true}),
        BsDropdownModule.forRoot(),
        TabsModule.forRoot(),
        ng2Modal.forRoot(),
        HttpClientModule,
        TimepickerModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [HttpClient]
            }
        }),
        AngularSplitModule,
        ThumbModule,
        IMFXAccessControlModule,
        IMFXLanguageSwitcherModule,
        ErrorManagerModule,
        OverlayModule,
        NotificationModule,
        IMFXDropDownDirectiveModule,
        IMFXTextDirectionDirectiveModule,
        // ModalPreviewPlayerModule,
        TagsModule,
        // IMFXModalPromptModule,
        IMFXModalAlertModule,
        // ViewDetailModalModule,
        // MediaModule, // ???
        SearchFormModule,
        SearchThumbsModule,
        // EditSomEomModalModule,
        // AddCustomColumnModalModule,
        ChoosingRowsModalModule,
        // SelectTracksModalModule,
        // CopyFromModalModule,
        MediaChangeStatusModule,
        TaskPendingModule,
        // SaveDefaultLayoutModalModule,
        ErrorRefreshModalModule,
        ErrorModalModule,
        IMFXModalModule,
        SlickGridModule,
        SafePipeModule,
        IMFXXMLTreeModule,
        DigitOnlyModule,

    ],
    providers: [ // expose our Services and Providers into Angular's dependency injection
        ENV_PROVIDERS,
        APP_PROVIDERS,
        [
            {provide: RouteReuseStrategy, useClass: IMFXRouteReuseStrategy},
            {provide: LOCALE_ID, useValue: "en-GB"},
            {provide: LOCALE_ID, useValue: "ru-RU"},
            {provide: LOCALE_ID, useValue: "en-GB"},
            {provide: LOCALE_ID, useValue: "en-US"},
            {provide: LOCALE_ID, useValue: "en-AU"},
            {provide: LOCALE_ID, useValue: "hr-CRO"},

        ],
    ],
    exports: [
        TranslateModule
        // directives
        // ModalDirective
    ],
    entryComponents: [
        // LogoutByTimeoutComponent,
        // IMFXModalPromptComponent,
        IMFXModalAlertComponent,
        // AddCustomColumnModalComponent,
        ChoosingRowsModalComponent,
        // SelectTracksModalComponent,
        // CopyFromModalComponent,
        // FoldersComponent,
        // `EditSomEomModalModule`,
        IMFXModalAlertComponent,
        ErrorModalComponent,
        IMFXModalComponent,
        MultilineTextComponent
    ]
})
export class AppModule {
    constructor(public appRef: ApplicationRef) {
    }
}


