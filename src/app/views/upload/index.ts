import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import { appRouter } from '../../constants/appRouter';
import {FormsModule} from "@angular/forms";
import {UploadScreenComponent} from "./upload.screen.component";
import {SlickGridModule} from "../../modules/search/slick-grid";
import {OverlayModule} from "../../modules/overlay";

const routes: Routes = [
    {path: appRouter.empty, component: UploadScreenComponent},
];

@NgModule({
    declarations: [
        UploadScreenComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        FormsModule,
        SlickGridModule,
        OverlayModule
    ],
    exports: [
        RouterModule
    ]
})
export class UploadScreenModule {
    public static routes = routes;
}
