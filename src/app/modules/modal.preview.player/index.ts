import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ModalPreviewPlayerComponent} from './modal.preview.player';
import {SimplePreviewPlayerModule} from "../controls/simple.preview.player";
import {IMFXTextDirectionDirectiveModule} from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ModalPreviewPlayerComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        // ModalModule,
        SimplePreviewPlayerModule,
        IMFXTextDirectionDirectiveModule
        //IMFXHtmlPlayerModule
    ],
    exports: [],
    entryComponents: [
        ModalPreviewPlayerComponent,
    ]
})

export class ModalPreviewPlayerModule {
    entry: Type<ModalPreviewPlayerComponent>;

    constructor() {
        this.entry = ModalPreviewPlayerComponent;
    }
}
