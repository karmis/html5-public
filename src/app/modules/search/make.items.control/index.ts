import { Input, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '../../overlay';
import { MakeItemsControlComponent } from './make.items.control.component';


@NgModule({
    declarations: [
        MakeItemsControlComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        FormsModule,
        // WorkflowDecisionModule
    ],
    exports: [
        MakeItemsControlComponent
    ],
    entryComponents: [
        MakeItemsControlComponent
    ]
})
export class MakeItemsControlModule {
}
