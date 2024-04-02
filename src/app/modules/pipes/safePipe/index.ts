/**
 * Created by Sergey Trizna on 31.07.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

// Pipes
import {SafeHTMLPipe, SafePipe} from './safePipe';

@NgModule({
    declarations: [
        SafePipe,
        SafeHTMLPipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],
    exports: [
        SafePipe,
        SafeHTMLPipe
    ],
})
export class SafePipeModule {
}
