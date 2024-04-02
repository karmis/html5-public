import { SlickGridModule } from '../../../search/slick-grid';
import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { VersionAlreadyComponent } from './version.already.component';


@NgModule({
    declarations: [
        VersionAlreadyComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule
    ],
    exports: [
    ],
    entryComponents: [
        VersionAlreadyComponent
    ]
})
export class VersionAlreadyModule {
    entry: Type<VersionAlreadyComponent>;

    constructor() {
        this.entry = VersionAlreadyComponent;
    }
}
