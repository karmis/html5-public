import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ProductionsConfigGridComponent} from "./productions.config.grid.component";
import {TabsModule} from "ngx-bootstrap";
import {SlickGridModule} from "app/modules/search/slick-grid";
import {IMFXControlsSelect2Module} from "app/modules/controls/select2";
import {OverlayModule} from "app/modules/overlay";
import {CommonTablesGridModule} from "../common.tables.grid";

@NgModule({
    declarations: [
        ProductionsConfigGridComponent
    ],
    providers: [],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TabsModule,
        SlickGridModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        CommonTablesGridModule
    ],
    exports: [
        ProductionsConfigGridComponent
    ],
    entryComponents: [
        ProductionsConfigGridComponent
    ]
})
export class ProductionsConfigModule {

}
