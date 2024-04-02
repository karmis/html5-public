/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TIFViewerComponent} from './tif';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      TIFViewerComponent
    ],
    imports: [
        CommonModule,
        TranslateModule
    ],
    exports: [
        TIFViewerComponent
    ],
    entryComponents: [
    ]
})
export class TIFViewerModule {
}
