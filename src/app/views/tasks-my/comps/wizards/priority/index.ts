import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MyTasksWizardPriorityComponent} from './wizard';
import {OverlayModule} from '../../../../../modules/overlay';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        MyTasksWizardPriorityComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
    ],
    entryComponents: [
        MyTasksWizardPriorityComponent
    ]
})
export class MyTasksWizardPriorityModule {
    entry: Type<MyTasksWizardPriorityComponent>;

    constructor() {
        this.entry = MyTasksWizardPriorityComponent;
    }
}
