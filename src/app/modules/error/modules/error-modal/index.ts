/**
 * Created by Sergey Trizna on 22.05.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ErrorModalComponent} from './error';


@NgModule({
    declarations: [
        ErrorModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
    ],
    exports: [],
    entryComponents: []
})
export class ErrorModalModule {
    entry: Type<ErrorModalComponent>;

    constructor() {
        this.entry = ErrorModalComponent;
    }
}
