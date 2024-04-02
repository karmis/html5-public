import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {IMFXControlsTreeModule} from "../../../../../../../modules/controls/tree";
import {NamesAuthoringModalComponent} from "./names-authoring";
import {SearchFormModule} from "../../../../../../../modules/search/form";
import {NamesTreeModule} from "../../../../../../names/comps/names.tree";
import {SearchAdvancedModule} from "../../../../../../../modules/search/advanced";

@NgModule({
    declarations: [
        NamesAuthoringModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsTreeModule,
        SearchFormModule,
        NamesTreeModule,
        SearchAdvancedModule
    ],
    entryComponents: [
        NamesAuthoringModalComponent
    ]
})
export class NamesAuthoringModalModule {
    entry: Type<NamesAuthoringModalComponent>;

    constructor() {
        this.entry = NamesAuthoringModalComponent;
    }
}
