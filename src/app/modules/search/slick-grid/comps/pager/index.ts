/**
 * Created by Sergey Trizna on 05.04.2018.
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {SlickGridPagerComp} from "./pager.comp";

@NgModule({
    declarations: [
        SlickGridPagerComp,
    ],
    imports: [
        TranslateModule,
        CommonModule,
    ],
    exports: [
        SlickGridPagerComp
    ],
})
export class SlickGridPagerModule {
}
