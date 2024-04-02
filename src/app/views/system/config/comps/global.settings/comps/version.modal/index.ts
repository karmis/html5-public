import { NgModule, Type } from '@angular/core';
import { VersionModalComp } from "./version.modal.comp";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { IMFXTextDirectionDirectiveModule } from "../../../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module";
import { ModalModule as ng2Module } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ServiceConfigService } from "../../../../../../../services/system.config/settings.service-config.service";

@NgModule({
    declarations: [
        // Comps
        VersionModalComp,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        ng2Module,
        IMFXTextDirectionDirectiveModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        VersionModalComp,
    ],
    entryComponents: [
        VersionModalComp
    ],
    providers: [
        ServiceConfigService
    ]
})
export class VersionModalModule {
    entry: Type<VersionModalComp>;
    constructor() {
        this.entry = VersionModalComp;
    }
}
