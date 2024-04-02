import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import {IMFXMediaInfoComponent} from "./imfx.mediainfo.tab.component";
import {IMFXControlsSelect2Module} from "../../../../controls/select2";
import {ComboSingleModule} from "../../../advanced/comps/criteria/comps/controls/comps/container/comps/combosingle";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { CustomStatusControlComponent } from './comps/custom.status/custom.status.control.component';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXMediaInfoComponent,
        CustomStatusControlComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        ComboSingleModule,
        IMFXControlsSelect2Module,
        IMFXTextDirectionDirectiveModule
        // AccordionModule.forRoot()
    ],
    exports: [
        IMFXMediaInfoComponent,
        CustomStatusControlComponent
    ]
})
export class IMFXMediaInfoModule {
}
