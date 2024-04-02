import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LoginResetPasswordComponent } from './login.reset.password.component';
import { appRouter } from '../../constants/appRouter';

const routes: Routes = [
    { path: appRouter.empty, component: LoginResetPasswordComponent },
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        LoginResetPasswordComponent,
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ],
    exports: [
      RouterModule
    ]
})
export class LoginResetPasswordModule {
    static routes = routes;
}
