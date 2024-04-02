import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {ModalModule as ng2Module} from 'ngx-bootstrap/modal';
import { AttachConfirmModalComponent } from './attach-confirm-modal.component';
import { IMFXXMLTreeModule } from '../../../../modules/controls/xml.tree';

@NgModule({
    declarations: [
        // Comps
        AttachConfirmModalComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        ng2Module,
        IMFXXMLTreeModule
    ],
    exports: [
        AttachConfirmModalComponent,
    ],
    entryComponents: [
        AttachConfirmModalComponent
    ]
})

export class AttachConfirmModalModule {
    entry: Type<AttachConfirmModalComponent>;

    constructor() {
        this.entry = AttachConfirmModalComponent;
    }
}
