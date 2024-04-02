import {NgModule} from "@angular/core";

import {IMFXControlsDateTimePickerModule} from "../../../../modules/controls/datetimepicker";
import {IMFXSubtitlesGridModule} from "../../../../modules/search/detail/components/subtitles.grid.component";
import {IMFXHtmlPlayerModule} from "../../../../modules/controls/html.player";
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {GridStackModule} from "../../../../modules/controls/gridstack";
import {OverlayModule} from "../../../../modules/overlay/"
import {BrandingSearchFormComponent} from "./branding.search.form.component";
import {SearchRecentModule} from "../../../../modules/search/recent";
import {ThumbModule} from "../../../../modules/controls/thumb";
import {SearchFormBrandingModule} from "../../../../modules/search/form-branding";
import {SearchFormModule} from "../../../../modules/search/form";

@NgModule({
    declarations: [
        BrandingSearchFormComponent
    ],
    imports: [
        IMFXControlsDateTimePickerModule,
        IMFXSubtitlesGridModule,
        IMFXHtmlPlayerModule,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        SearchFormModule,
        SearchFormBrandingModule,
        GridStackModule,
        OverlayModule,
        SearchRecentModule,
        ThumbModule
    ],
    exports: [
        BrandingSearchFormComponent
    ]
})
export class BrandingSearchFormModule {
}
