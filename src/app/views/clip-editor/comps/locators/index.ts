import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TabsModule} from "ngx-bootstrap/tabs";
// imfx modules
import { CELocatorsComponent } from './ce.locators.component';

import { IMFXLocatorsCommentsModule } from '../../../../modules/controls/locators.comments';
import { IMFXMediaTaggingTabModule } from '../../../../modules/search/detail/components/media.tagging.tab.component';
import { TagsModule } from '../../../../modules/controls/tags';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      CELocatorsComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TabsModule,
        TagsModule,
        IMFXLocatorsCommentsModule,
        IMFXMediaTaggingTabModule,
    ],
    exports: [
      CELocatorsComponent,
    ]
})
export class CELocatorsModule {
}
