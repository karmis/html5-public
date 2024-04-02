import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
// imfx modules
import {IMFXControlsTreeModule} from "../../../../controls/tree";
import {IMFXTaxonomyComponent} from "./imfx.taxonomy.tab.component";
import { TranslateModule } from '@ngx-translate/core';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        IMFXTaxonomyComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        IMFXControlsTreeModule,
        TranslateModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXTaxonomyComponent
    ]
})
export class IMFXTaxonomyModule {
}
