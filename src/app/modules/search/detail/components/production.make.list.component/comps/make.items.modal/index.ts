import {NgModule, Type} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MakeItemsModalComponent } from './make.items.modal.component';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '../../../../../../overlay';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        MakeItemsModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        FormsModule,
        // WorkflowDecisionModule
    ],
    exports: [
        MakeItemsModalComponent
    ],
    entryComponents: [
        MakeItemsModalComponent
    ]
})
export class MakeItemsModalModule {
    entry: Type<MakeItemsModalComponent>;

    constructor() {
        this.entry = MakeItemsModalComponent;
    }
}
