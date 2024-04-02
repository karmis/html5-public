import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ModalModule as ng2Module} from 'ngx-bootstrap/modal';
import {IMFXModalAlertComponent} from "./alert";

@NgModule({
    declarations: [
        // Comps
        IMFXModalAlertComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        ng2Module
    ],
    exports: [
        IMFXModalAlertComponent,
    ],
    entryComponents: [
        IMFXModalAlertComponent
    ]
})

export class IMFXModalAlertModule {
    entry: Type<IMFXModalAlertComponent>;

    constructor() {
        this.entry = IMFXModalAlertComponent;
    }
}
