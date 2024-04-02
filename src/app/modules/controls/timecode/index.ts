import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// imfx modules
import { ThumbComponent } from './thumb.ts';
import { FormsModule } from '@angular/forms';
import { TimecodeInputComponent } from './timecode.input';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        TimecodeInputComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
    ],
    exports: [
        TimecodeInputComponent,
    ]
})
export class TimecodeInputModule {}
