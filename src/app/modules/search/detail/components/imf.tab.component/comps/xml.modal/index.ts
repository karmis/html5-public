import {NgModule, Type} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import {XMLModalComponent} from "./xml.modal";
import {OverlayModule} from "../../../../../../overlay";
import {IMFXXMLTreeModule} from "../../../../../../controls/xml.tree";
import { IMFXTextDirectionDirectiveModule } from '../../../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      XMLModalComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        AngularSplitModule,
        IMFXXMLTreeModule,
        OverlayModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        XMLModalComponent
    ],
    entryComponents: [
        XMLModalComponent
    ]
})
export class XMLModalModule {
    entry: Type<XMLModalComponent>;

    constructor() {
        this.entry = XMLModalComponent;
    }
}
