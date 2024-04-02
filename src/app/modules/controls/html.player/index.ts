/**
 * Created by Sergey on 02.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXHtmlPlayerComponent} from './imfx.html.player';
import { TranslateModule } from '@ngx-translate/core';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {PlayerSettingsModalComponent} from "./comps/settings.modal/settings.modal";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXHtmlPlayerComponent,
        PlayerSettingsModalComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXHtmlPlayerComponent,
    ]
})
export class IMFXHtmlPlayerModule {}

