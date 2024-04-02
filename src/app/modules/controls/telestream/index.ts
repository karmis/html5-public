import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TelestreamComponent} from "./telestream.component";
import {ThumbModule} from "../thumb";
import { TranslateModule } from '@ngx-translate/core';
import { TelestreamService } from './service/telestream.service';
import { IMFXControlsSelect2Module } from '../select2';
import {TimecodeInputModule} from "../timecode";

@NgModule({
    declarations: [
        TelestreamComponent,
    ],
    imports: [
        CommonModule,
        ThumbModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        TimecodeInputModule,
    ],
    exports: [
        TelestreamComponent,
    ],
    providers: [
        TelestreamService
    ]
})
export class TelestreamModule {}
