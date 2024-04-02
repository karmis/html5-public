import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import {AVFaultsTabComponent} from "./av.faults.tab.component";
import {SlickGridModule} from "../../../slick-grid";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        AVFaultsTabComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        SlickGridModule
    ],
    exports: [
        AVFaultsTabComponent,
    ]
})
export class AVFaultsTabModule {}
