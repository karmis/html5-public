import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IMFXSegmentsTabComponent} from "./imfx.segments.tab.component";
import {SlickGridModule} from "../../../slick-grid";
import { TranslateModule } from '@ngx-translate/core';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

// imfx modules


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      IMFXSegmentsTabComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule,
        TranslateModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
      IMFXSegmentsTabComponent,
    ],
    entryComponents: [
    ]
})
export class IMFXSegmentsTabModule {
}
