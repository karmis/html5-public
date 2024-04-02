import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ModalModule as ng2Module} from 'ngx-bootstrap/modal';
import {ViewDetailModalComp} from "./view.detail.modal.comp";
import {IMFXTextDirectionDirectiveModule} from "../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module";

@NgModule({
    declarations: [
        // Comps
        ViewDetailModalComp,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        ng2Module,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        ViewDetailModalComp,
    ],
    entryComponents: [
        ViewDetailModalComp
    ]
})

export class ViewDetailModalModule {
    entry: Type<ViewDetailModalComp>;

    constructor() {
        this.entry = ViewDetailModalComp;
    }
}
