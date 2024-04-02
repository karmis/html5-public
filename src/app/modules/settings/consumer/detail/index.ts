/**
 * Created by Sergey Trizna on 17.08.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// imfx modules
import {TranslateModule} from '@ngx-translate/core';
// components
import {ConsumerDetailSettingsComponent} from "./consumer.detail.settings.component";
import {GridStackModule} from "../../../controls/gridstack";
// import {ModalModule} from "../../../modal";
import {OverlayModule} from "../../../overlay";
import {ConsumerFieldsComponent} from "../fields/modal.fields";
import {ConsumerFieldsModule} from "../fields";
import {IMFXTextDirectionDirectiveModule} from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ConsumerDetailSettingsComponent,
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        GridStackModule,
        // ModalModule,
        OverlayModule,
        ConsumerFieldsModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        ConsumerDetailSettingsComponent
    ],
    entryComponents: [
        ConsumerFieldsComponent
    ]
})
export class ConsumerDetailSettingsModule {
}
