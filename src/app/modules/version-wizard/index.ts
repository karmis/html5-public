import {NgModule, Type} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';
import {VersionWizardComponent} from "./wizard";
import {OverlayModule} from "../overlay";
import {IMFXControlsSelect2Module} from "../controls/select2";
import {VersionWizardMediaModule} from "./comps/media";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        VersionWizardComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        VersionWizardMediaModule
    ],
    exports: [
        VersionWizardComponent
    ],
    entryComponents: [
        VersionWizardComponent
    ]
})
export class VersionWizardModule {
    entry: Type<VersionWizardComponent>;

    constructor() {
        this.entry = VersionWizardComponent;
    }
}
