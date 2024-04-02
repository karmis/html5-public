import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {IMFXModalComponent} from 'app/modules/imfx-modal/imfx-modal';
import {IMFXModalModule} from 'app/modules/imfx-modal';
import {IMFXControlsSelect2Module} from 'app/modules/controls/select2';
import {ProductionConfigMakeActionsEditModalGridModalComponent} from './production.config.make.actions.edit.modal.grid.modal.component';


@NgModule({
    declarations: [
        ProductionConfigMakeActionsEditModalGridModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        FormsModule,
        IMFXModalModule
    ],
    entryComponents: [
        ProductionConfigMakeActionsEditModalGridModalComponent,
        IMFXModalComponent
    ]
})
export class ProductionConfigMakeActionsEditModalGridModalModule {
    entry: Type<ProductionConfigMakeActionsEditModalGridModalComponent>;

    constructor() {
        this.entry = ProductionConfigMakeActionsEditModalGridModalComponent;
    }
}
