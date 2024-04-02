/**
 * Created by Sergey Trizna on 17.12.2016.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

// imfx modules
import {IMFXControlsNumberboxComponent} from './numberbox';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXControlsNumberboxComponent,
    ],
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        IMFXControlsNumberboxComponent,
    ]
})
export class IMFXControlsNumberboxModule {}
