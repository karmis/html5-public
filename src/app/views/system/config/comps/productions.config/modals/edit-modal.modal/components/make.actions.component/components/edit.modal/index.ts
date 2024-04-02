import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IMFXModalComponent } from 'app/modules/imfx-modal/imfx-modal';
import { IMFXModalModule } from 'app/modules/imfx-modal';
import { IMFXControlsSelect2Module } from 'app/modules/controls/select2';
import { ProductionConfigMakeActionsEditModalComponent } from './production.config.make.actions.edit.modal.component';
import { SlickGridModule } from 'app/modules/search/slick-grid';
import { OrderPresetsGroupedModule } from 'app/modules/order-presets-grouped';
// import { ProductionConfigMakeActionsEditModalGridModalComponent } from './components/edit.modal.grid.modal/production.config.make.actions.edit.modal.grid.modal.component';


@NgModule({
    declarations: [
        ProductionConfigMakeActionsEditModalComponent,
        // ProductionConfigMakeActionsEditModalGridModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        FormsModule,
        IMFXModalModule,
        SlickGridModule,
        OrderPresetsGroupedModule
    ],
    entryComponents: [
        ProductionConfigMakeActionsEditModalComponent,
        // ProductionConfigMakeActionsEditModalGridModalComponent,
        IMFXModalComponent
    ]
})
export class ProductionConfigMakeActionsEditModalModule {
    entry: Type<ProductionConfigMakeActionsEditModalComponent>;

    constructor() {
        this.entry = ProductionConfigMakeActionsEditModalComponent;
    }
}
