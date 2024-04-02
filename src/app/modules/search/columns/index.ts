/**
 * Created by Sergey Trizna on 04.03.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SearchColumnsComponent} from './search.columns';
// import {ModalModule} from '../../modal';
import {FormsModule} from '@angular/forms';
import {IMFXTextDirectionDirectiveModule} from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {FocusDirectiveModule} from "../../../directives/focus/focus.module";
import {AddCustomColumnModalModule} from "../../controls/add.customcolumn.modal";
import {FilterPipeModule} from "../../pipes/filterPipe";
import {OrderByModule} from "../../pipes/orderBy";
import {KeysPipeModule} from "../../pipes/keysPipe";
import {SearchByNamePipeModule} from "./pipes";

// Pipes

@NgModule({
    declarations: [
        SearchColumnsComponent
    ],
    imports: [
        TranslateModule,
        CommonModule,
        // ModalModule,
        FilterPipeModule,
        AddCustomColumnModalModule,
        OrderByModule,
        KeysPipeModule,
        FormsModule,
        IMFXTextDirectionDirectiveModule,
        FocusDirectiveModule,
        SearchByNamePipeModule
    ],
    exports: [
        SearchColumnsComponent
    ],
    entryComponents: [
        SearchColumnsComponent
    ]
})
export class SearchColumnsModule {
    entry: Type<SearchColumnsComponent>;

    constructor() {
        this.entry = SearchColumnsComponent;
    }
}
