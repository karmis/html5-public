/**
 * Created by Sergey Trizna on 04.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SearchSavedComponent} from './search.saved';
import {IMFXControlsSelect2Module} from "../../controls/select2";

@NgModule({
    declarations: [
        SearchSavedComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        IMFXControlsSelect2Module
    ],
    exports: [
        SearchSavedComponent
    ],
})
export class SearchSavedModule {
}
