import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TabsModule} from "ngx-bootstrap/tabs";
// imfx modules
import { IMFXLocatorsComponent } from './imfx.locators.component';
import { IMFXLocatorsCommentsModule } from '../locators.comments';
import { IMFXMediaTaggingTabModule } from '../../../modules/search/detail/components/media.tagging.tab.component';
import { TagsModule } from '../../../modules/controls/tags';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      IMFXLocatorsComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TabsModule,
        TagsModule,
        IMFXLocatorsCommentsModule,
        IMFXMediaTaggingTabModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXLocatorsComponent,
    ]
})
export class IMFXLocatorsModule {
}
