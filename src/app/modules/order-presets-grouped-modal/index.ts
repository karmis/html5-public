/**
 * Created by Ivan Banan on 05.02.2020.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {OrderPresetsGroupedModalComponent} from './order-presets-grouped-modal.component';
import {FilterPipeModule} from '../pipes/filterPipe';
import {IMFXControlsTreeModule} from '../controls/tree';
import {OrderPresetsGroupedModule} from '../order-presets-grouped';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        OrderPresetsGroupedModalComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FilterPipeModule,
        IMFXControlsTreeModule,
        OrderPresetsGroupedModule
    ],
    exports: [
        OrderPresetsGroupedModalComponent
    ],
    entryComponents: [
        OrderPresetsGroupedModalComponent
    ]
})
export class OrderPresetsGroupedModalModule {
    entry: Type<OrderPresetsGroupedModalComponent>;

    constructor() {
        this.entry = OrderPresetsGroupedModalComponent;
    }
}
