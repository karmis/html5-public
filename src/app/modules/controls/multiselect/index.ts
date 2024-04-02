/**
 * Created by Sergey Trizna on 17.12.2016.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXControlsMultiselectComponent} from './imfx.multiselect';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXControlsMultiselectComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
    ],
    exports: [
        IMFXControlsMultiselectComponent,
    ]
})
export class IMFXControlsMultiselectModule {}
