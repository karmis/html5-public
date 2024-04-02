/**
 * Created by Pavel on 17.01.2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { CollectionLookupComp } from "./collection.lookup.comp";
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { IMFXControlsSelect2Module } from '../select2';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        CollectionLookupComp
    ],
    imports: [
        TranslateModule,
        FormsModule,
        CommonModule,
        IMFXTextDirectionDirectiveModule,
        IMFXControlsSelect2Module
    ],
    exports: [
        CollectionLookupComp,
    ]
})
export class CollectionLookupModule {
}
