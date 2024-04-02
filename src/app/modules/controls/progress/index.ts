
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressComponent} from './progress';
@NgModule({
    declarations: [
        ProgressComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        ProgressComponent,
    ],
})
export class ProgressModule {
}
