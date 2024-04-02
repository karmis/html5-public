import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SearchViewsColumnsComponent} from './views.columns';
import {FormsModule} from '@angular/forms';
import {SearchByNamePipeModule} from '../../../../../../../../../../../modules/search/columns/pipes';
import {IMFXTextDirectionDirectiveModule} from '../../../../../../../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {FocusDirectiveModule} from "../../../../../../../../../../../directives/focus/focus.module";
import {AddCustomColumnModalModule} from "../../../../../../../../../../../modules/controls/add.customcolumn.modal";
import {FilterPipeModule} from "../../../../../../../../../../../modules/pipes/filterPipe";
import {OrderByModule} from "../../../../../../../../../../../modules/pipes/orderBy";
import {KeysPipeModule} from "../../../../../../../../../../../modules/pipes/keysPipe";


@NgModule({
    declarations: [
        SearchViewsColumnsComponent
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
        SearchViewsColumnsComponent
    ],
    entryComponents: [
        SearchViewsColumnsComponent
    ]
})
export class SearchViewsColumnsModule {
    entry: Type<SearchViewsColumnsComponent>;

    constructor() {
        this.entry = SearchViewsColumnsComponent;
    }
}
