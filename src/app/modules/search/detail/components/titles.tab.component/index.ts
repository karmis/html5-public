import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
// Search
import {SearchViewsModule} from '../../../../../modules/search/views';
import {SearchFormModule} from '../../../../../modules/search/form';
import {SearchSettingsModule} from '../../../../../modules/search/settings';
import {SearchColumnsModule} from '../../../../../modules/search/columns';
import {SlickGridModule} from "../../../slick-grid";
import {IMFXTitlesTabComponent} from "./imfx.titles.tab.component";

@NgModule({
    declarations: [
        IMFXTitlesTabComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchSettingsModule,
        SearchColumnsModule,
    ],
    exports: [
        IMFXTitlesTabComponent
    ],
    entryComponents: [
    ]
})
export class IMFXTitlesTabModule {
    // static routes = routes;
}

