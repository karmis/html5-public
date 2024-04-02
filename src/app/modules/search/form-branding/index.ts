/**
 * Created by Sergey Trizna on 03.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SearchFormBrandingComponent} from './search.form.branding';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SearchFormBrandingComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        IMFXTextDirectionDirectiveModule,
    ],
    exports: [
        SearchFormBrandingComponent
    ],
})
export class SearchFormBrandingModule {
}
