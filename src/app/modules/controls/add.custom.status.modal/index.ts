import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {IMFXXMLTreeModule} from "../xml.tree";
import {OverlayModule} from "../../overlay";
import {IMFXTextDirectionDirectiveModule} from "../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module";
import {IMFXSchemaTreeModule} from "../../../views/system/config/comps/xml/components/schema.tree";
import { AddCustomStatusModalComponent } from './add.custom.status.modal.component';
import { IMFXControlsSelect2Module } from '../select2';

@NgModule({
    declarations: [
        AddCustomStatusModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXXMLTreeModule,
        OverlayModule,
        IMFXTextDirectionDirectiveModule,
        IMFXSchemaTreeModule,
        IMFXControlsSelect2Module
    ],
    entryComponents: [
        AddCustomStatusModalComponent
    ]
})
//export default class ConfigTablesChangeModalModule {
export class AddCustomStatusModalModule {
    entry: Type<AddCustomStatusModalComponent>;

    constructor() {
        this.entry = AddCustomStatusModalComponent;
    }
}
