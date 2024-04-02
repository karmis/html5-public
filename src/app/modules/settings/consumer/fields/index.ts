/**
 * Created by Sergey Trizna on 24.08.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
// imfx modules
import {TranslateModule} from '@ngx-translate/core';
import {ConsumerFieldsComponent} from "./modal.fields";
import {FormsModule} from "@angular/forms";
import {KeysPipeModule} from "../../../pipes/keysPipe";
import {OrderByModule} from "../../../pipes/orderBy";
import {FilterPipeModule} from "../../../pipes/filterPipe";
import {SettingsFieldsForConsumerSearchByName} from "./pipes/byName.pipe";
import {IMFXTextDirectionDirectiveModule} from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ConsumerFieldsComponent,
        SettingsFieldsForConsumerSearchByName
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        FilterPipeModule,
        OrderByModule,
        KeysPipeModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        ConsumerFieldsComponent
    ],
    entryComponents: [
        ConsumerFieldsComponent
    ]
})
export class ConsumerFieldsModule {
    entry: Type<ConsumerFieldsComponent>;

    constructor() {
        this.entry = ConsumerFieldsComponent;
    }
}

