/**
 * Created by Sergey Trizna on 05.04.2018.
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {SlickGridPanelBottomComp} from "./bottom.panel.comp";
import {SlickGridPagerModule} from "../../pager";
import {SlickGridInfoModule} from "../../info";

@NgModule({
    declarations: [
        SlickGridPanelBottomComp,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        SlickGridPagerModule,
        SlickGridInfoModule
    ],
    exports: [
        SlickGridPanelBottomComp
    ],
})
export class SlickGridPanelBottomModule {
}
