/**
 * Created by Sergey Trizna on 31.07.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

// Pipes
import {ReversePipe} from './reversePipe';

@NgModule({
    declarations: [
        ReversePipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],
    exports: [
        ReversePipe
    ],
})
export class ReversePipeModule {
}
