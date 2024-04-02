import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


// ng2 views
import {TabsModule} from 'ngx-bootstrap/tabs';
import {TranslateModule} from '@ngx-translate/core';

//---------
import {ProfileComponent} from './profile.component';
import {ProfileOverviewComponent} from './components/overview/overview.component';
import {ProfileSecurityComponent} from './components/security/security.component';
import {ProfileSecurityChangePasswordComponent} from './components/security/components/change.password/change.password.component';
import {ProfileDefaultPageComponent} from './components/defaultpage/defaultpage.component';
import {IMFXControlsSelect2Module} from "../../modules/controls/select2";

import {IMFXLanguageSwitcherModule} from '../../modules/language.switcher';
import {ProfilePersonalSettingsComponent} from "./components/personal/personal.component";
import { appRouter } from '../../constants/appRouter';
import {SafePipeModule} from "../../modules/pipes/safePipe";

console.log('`ProfileComponent` bundle loaded asynchronously');
// async views must be named routes for WebpackAsyncRoute

const routes: Routes = [
    {path: appRouter.empty, component: ProfileComponent}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ProfileComponent,
        ProfileOverviewComponent,
        ProfileSecurityComponent,
        ProfileSecurityChangePasswordComponent,
        ProfileDefaultPageComponent,
        ProfilePersonalSettingsComponent
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        TabsModule.forRoot(),
        IMFXLanguageSwitcherModule,
        IMFXControlsSelect2Module,
        SafePipeModule
    ]
})
export class ProfileModule {
    public static routes = routes;
}
