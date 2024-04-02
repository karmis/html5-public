/**
 * Created by Sergey Trizna on 23.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccordionComponent} from './accordion';
@NgModule({
    declarations: [
        AccordionComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        AccordionComponent,
    ],
    entryComponents: [
        AccordionComponent
    ]
})
export class AccordionModule {
}