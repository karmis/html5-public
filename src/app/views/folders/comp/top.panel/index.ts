import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FoldersTopPanelComp} from "./folders.top.panel.comp";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        FoldersTopPanelComp
    ],
    imports: [
        CommonModule,
        TranslateModule,
        // WorkflowDecisionModule
    ],
    exports: [
        FoldersTopPanelComp
    ],
    entryComponents: [
        FoldersTopPanelComp
    ]
})
export class FoldersTopPanelModule {
    entry: Type<FoldersTopPanelComp>;

    constructor() {
        this.entry = FoldersTopPanelComp;
    }
}
