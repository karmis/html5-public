/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCXViewerComponent } from './docx';
import {TranslateModule} from '@ngx-translate/core';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DOCXViewerComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        DOCXViewerComponent
    ],
    entryComponents: [
    ]
})
export class DOCXViewerModule {
}
