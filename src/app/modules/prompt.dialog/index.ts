import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// imfx modules
import { TranslateModule } from '@ngx-translate/core';
// components
import { PromptDialogComponent } from './prompt.dialog.component';

@NgModule({
    declarations: [
        PromptDialogComponent
    ],
    imports: [
        CommonModule,
        TranslateModule
    ],
    exports: [
        PromptDialogComponent
    ]
})
export class PromptDialogModule {
}
