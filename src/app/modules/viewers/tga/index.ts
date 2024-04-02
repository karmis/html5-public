import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TGAViewerComponent} from './tga';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        TGAViewerComponent
    ],
    imports: [
        CommonModule,
        TranslateModule
    ],
    exports: [
        TGAViewerComponent
    ],
    entryComponents: [
    ]
})
export class TGAViewerModule {
}
