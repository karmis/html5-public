import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {appRouter} from '../../../../constants/appRouter';
import {TranslateModule} from '@ngx-translate/core';
import {AcquisitionsWorkspaceComponent} from "./acquisition.workplace.component";
import {IMFXControlsTreeModule} from "../../../../modules/controls/tree";
import {KeysPipeModule} from "../../../../modules/pipes/keysPipe";
import {LocalDateModule} from "../../../../modules/pipes/localDate";
// import {ModalModule} from "../../../../modules/modal";
import {OverlayModule} from '../../../../modules/overlay';
import {AngularSplitModule} from "angular-split";

const routes = [
    {
        path: appRouter.empty,
        component: AcquisitionsWorkspaceComponent,
    }
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        AcquisitionsWorkspaceComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        IMFXControlsTreeModule,
        KeysPipeModule,
        LocalDateModule,
        // ModalModule,
        OverlayModule,
        AngularSplitModule
    ],
    exports: [
        AcquisitionsWorkspaceComponent
    ]
})
export class AcquisitionsWorkspaceModule {
    public static routes = routes
}
