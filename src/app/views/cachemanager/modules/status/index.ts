/**
 * Created by Sergey Trizna on 17.05.2018.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CacheManagerStatusComp} from "./cm-status";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        CacheManagerStatusComp,
    ],
    imports: [
        CommonModule,
        TranslateModule,
    ],
    exports: [
        CacheManagerStatusComp
    ],
    entryComponents: []
})
export class CacheManagerStatusModule {
}
