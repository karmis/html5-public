/**
 * Created by Ivan Banan on 05.02.2020.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { OrderPresetsGroupedComponent } from './order.presets.grouped.component';
import { FilterPipeModule } from '../pipes/filterPipe';
import { IMFXControlsTreeModule } from '../controls/tree';
@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        OrderPresetsGroupedComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FilterPipeModule,
        IMFXControlsTreeModule
    ],
    exports: [
        OrderPresetsGroupedComponent
    ],
    entryComponents: [
        OrderPresetsGroupedComponent
    ]
})
export class OrderPresetsGroupedModule {
}
