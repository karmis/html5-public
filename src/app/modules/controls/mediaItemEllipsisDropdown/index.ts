import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MediaItemEllipsisDropdownComponent} from "./media.item.ellipsis.dropdown";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        MediaItemEllipsisDropdownComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule
    ],
    exports: [
        MediaItemEllipsisDropdownComponent,
    ]
})
export class MediaItemEllipsisDropdownModule {}
