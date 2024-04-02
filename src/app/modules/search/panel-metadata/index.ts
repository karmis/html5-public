import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';
import {FilterPipeModule} from '../../pipes/filterPipe';
import {IMFXXMLTreeModule} from '../../controls/xml.tree';
import {OverlayModule} from '../../overlay';
import {IMFXTextDirectionDirectiveModule} from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {IMFXSchemaTreeModule} from "../../../views/system/config/comps/xml/components/schema.tree";
import {PanelMetadataComponent} from "./panel.metadata";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        PanelMetadataComponent,
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
        PanelMetadataComponent
    ],
    entryComponents: []
})
export class PanelMetadataModule {
}
