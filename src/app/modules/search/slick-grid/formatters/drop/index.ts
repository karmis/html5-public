/**
 * Created by Sergey Trizna on 30.03.2018.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DropFormatterComp} from "./drop.comp";

@NgModule({
    declarations: [
        DropFormatterComp,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        DropFormatterComp,
    ],
})
export class DropFormatterModule {
}

