/**
 * Created by Sergey Trizna on 04.03.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SearchRecentComponent } from './search.recent';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ReversePipeModule } from "../../pipes/reversePipe";
import { OverlayModule } from "../../overlay";

@NgModule({
    declarations: [
        SearchRecentComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        BsDropdownModule,
        ReversePipeModule,
        OverlayModule
    ],
    exports: [
        SearchRecentComponent
    ],
})
export class SearchRecentModule {
}
