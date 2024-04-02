/**
 * Created by Sergey Trizna on 22.05.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ErrorRefreshModalComponent} from './error';

@NgModule({
    declarations: [
        ErrorRefreshModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
    ],
    exports: [],
    entryComponents: [
        ErrorRefreshModalComponent
    ]
})
export class ErrorRefreshModalModule {
    entry: Type<ErrorRefreshModalComponent>;

    constructor() {
        this.entry = ErrorRefreshModalComponent;
    }
}
