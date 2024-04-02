import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {AddCustomColumnModalComponent} from "./add.customcolumn.modal.component";
import {IMFXXMLTreeModule} from "../xml.tree";
import {OverlayModule} from "../../overlay";
import {IMFXTextDirectionDirectiveModule} from "../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module";
import {IMFXSchemaTreeModule} from "../../../views/system/config/comps/xml/components/schema.tree";

@NgModule({
    declarations: [
        AddCustomColumnModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXXMLTreeModule,
        OverlayModule,
        IMFXTextDirectionDirectiveModule,
        IMFXSchemaTreeModule
    ],
    entryComponents: [
        AddCustomColumnModalComponent
    ]
})
//export default class ConfigTablesChangeModalModule {
export class AddCustomColumnModalModule {
    entry: Type<AddCustomColumnModalComponent>;

    constructor() {
        this.entry = AddCustomColumnModalComponent;
    }
}
