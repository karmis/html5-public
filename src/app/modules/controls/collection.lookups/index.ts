/**
 * Created by Pavel on 17.01.2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { CollectionLookupsComp } from "./collection.lookups.comp";
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { IMFXControlsSelect2Module } from '../select2';
import { ReversePipeModule } from '../../pipes/reversePipe';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        CollectionLookupsComp
    ],
    imports: [
        TranslateModule,
        FormsModule,
        CommonModule,
        IMFXTextDirectionDirectiveModule,
        IMFXControlsSelect2Module,
        ReversePipeModule
    ],
    exports: [
        CollectionLookupsComp,
    ]
})
export class CollectionLookupsModule {
}
