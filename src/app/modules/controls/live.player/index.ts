import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {LivePlayerComponent} from "./live.player";
@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      LivePlayerComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule
    ],
    exports: [
      LivePlayerComponent
    ]
})
export class LivePlayerModule {
}
