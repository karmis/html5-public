import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { NgxQRCodeModule } from 'ngx-qrcode2';
// component modules
import {IMFXLanguageSwitcherModule} from '../../modules/language.switcher';
import {LoginComponent} from './login.component';
import {appRouter} from "../../constants/appRouter";
import { ForgotPasswordComponent } from './components/forgot.password.component';

const routes: Routes = [
    { path: appRouter.empty, component: LoginComponent },
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        LoginComponent,
        ForgotPasswordComponent
    ],
    imports: [
        IMFXLanguageSwitcherModule,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        NgxQRCodeModule
    ],
    exports: [
      RouterModule
    ]
})
export class LoginModule {
    public static routes = routes;
}
