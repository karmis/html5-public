import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {SlickGridModule} from "app/modules/search/slick-grid";
import {OverlayModule} from "app/modules/overlay";
import {CommonTablesGridComponent} from "./common.tables.grid.component";

@NgModule({
    declarations: [
        CommonTablesGridComponent
    ],
    providers: [],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SlickGridModule,
        OverlayModule
    ],
    exports: [
        CommonTablesGridComponent
    ],
    entryComponents: [
        CommonTablesGridComponent
    ]
})
export class CommonTablesGridModule {

}
