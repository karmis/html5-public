import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {TaskWizardAbortComponent} from './wizard';
import {FormsModule} from '@angular/forms';
import {OverlayModule} from '../../../overlay';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        TaskWizardAbortComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        FormsModule
    ],
    entryComponents: [
        TaskWizardAbortComponent
    ]
})
export class TaskWizardAbortModule {
    entry: Type<TaskWizardAbortComponent>;

    constructor() {
        this.entry = TaskWizardAbortComponent;
    }
}
