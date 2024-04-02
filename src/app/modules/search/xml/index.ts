/**
 * Created by Sergey Trizna on 03.03.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';
import {FilterPipeModule} from '../../pipes/filterPipe';
import {IMFXXMLTreeModule} from '../../controls/xml.tree';
import {XMLComponent} from './xml';
import {OverlayModule} from '../../overlay';
import {IMFXTextDirectionDirectiveModule} from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {IMFXSchemaTreeModule} from "../../../views/system/config/comps/xml/components/schema.tree";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        XMLComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        AngularSplitModule,
        FilterPipeModule,
        IMFXXMLTreeModule,
        OverlayModule,
        IMFXTextDirectionDirectiveModule,
        IMFXSchemaTreeModule
    ],
    exports: [
        XMLComponent
    ],
    entryComponents: [XMLComponent]
})
export class XmlModule {
    entry: Type<XMLComponent>;

    constructor() {
        this.entry = XMLComponent;
    }
}
