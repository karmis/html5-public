import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// imfx modules
import { IMFXFileExplorerTabComponent } from './imfx.file.explorer.tab.component';
import { SlickGridModule } from '../../../slick-grid';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
    // Components / Directives/ Pipes
        IMFXFileExplorerTabComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule,
        TranslateModule
    ],
    exports: [
        IMFXFileExplorerTabComponent
    ]
})
export class IMFXFileExplorerTabModule {}
