import { TemplateModalComponent } from './template.modal.component';
import { SlickGridModule } from '../../../../../modules/search/slick-grid';
import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IMFXControlsSelect2Module } from '../../../../../modules/controls/select2';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        TemplateModalComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule,
        IMFXControlsSelect2Module,
        FormsModule
    ],
    exports: [
        TemplateModalComponent
    ],
    entryComponents: [
        TemplateModalComponent
    ]
})
export class TemplateModalModule {
    entry: Type<TemplateModalComponent>;

    constructor() {
        this.entry = TemplateModalComponent;
    }
}
