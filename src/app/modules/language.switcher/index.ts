import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMFXDropDownDirectiveModule } from '../../directives/dropdown/dropdown.directive.module';
// ng2 views
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule } from '@ngx-translate/core';

import { LanguageSwitcherComponent } from './language.switcher';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        LanguageSwitcherComponent
    ],
    imports: [
        BsDropdownModule,
        TranslateModule,
        CommonModule,
        IMFXDropDownDirectiveModule
    ],
    exports: [
        LanguageSwitcherComponent
    ],
    entryComponents: [
        LanguageSwitcherComponent
    ]
})
export class IMFXLanguageSwitcherModule {
}
