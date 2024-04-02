import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlickGridModule } from "../../../slick-grid";
import { TranslateModule } from '@ngx-translate/core';
import { IMFTabComponent } from "./imf.tab.component";
import { IMFXMLTreeComponent } from "../../../../controls/xml.tree/imfx.xml.tree";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

// imfx modules


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFTabComponent,
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFTabComponent
    ],
    entryComponents: [
        IMFXMLTreeComponent
    ]
})
export class IMFTabModule {}
