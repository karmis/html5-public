import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SlickGridModule} from "../../../slick-grid";
import { TranslateModule } from '@ngx-translate/core';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { ProductionSegmentsTabComponent } from "./production.segments.tab.component";

// imfx modules


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      ProductionSegmentsTabComponent,
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
      ProductionSegmentsTabComponent,
    ],
    entryComponents: [
    ]
})
export class ProductionSegmentsTabModule {
}
