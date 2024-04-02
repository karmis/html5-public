import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IMFXAudioTracksTabComponent} from "./imfx.audio.tracks.tab.component";
import {SlickGridModule} from "../../../slick-grid";
import { TranslateModule } from '@ngx-translate/core';
import {TabsModule} from "ngx-bootstrap/tabs";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

// imfx modules


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      IMFXAudioTracksTabComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule,
        TranslateModule,
        TabsModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
      IMFXAudioTracksTabComponent,
    ]
})
export class IMFXAudioTracksTabModule {
}
