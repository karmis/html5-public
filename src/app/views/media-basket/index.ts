import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import { IMFXXMLTreeModule } from '../../modules/controls/xml.tree';
// ng2 components
import { MediaBasketComponent } from "./media.basket.component";
import { MediaBasketItemComponent } from "./components/media.basket.item/media.basket.item.component";


import { IMFXControlsSelect2Module } from "../../modules/controls/select2";
import { appRouter } from '../../constants/appRouter';
import { ThumbModule } from "../../modules/controls/thumb";
import {IMFXControlsDateTimePickerModule} from "../../modules/controls/datetimepicker";
import { OrderPresetsGroupedModule } from '../../modules/order-presets-grouped';
import { OrderPresetGroupedInputComponent } from './components/order.preset.grouped.input/order.preset.grouped.input.component';

const routes: Routes = [
    {path: appRouter.empty, component: MediaBasketComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        MediaBasketComponent,
        MediaBasketItemComponent,
        OrderPresetGroupedInputComponent
    ],
    exports: [
        RouterModule,
        OrderPresetGroupedInputComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        IMFXXMLTreeModule,
        FormsModule,
        IMFXControlsSelect2Module,
        ThumbModule,
        IMFXControlsDateTimePickerModule,
        OrderPresetsGroupedModule
    ]
})
export class MediaBasketModule {
    public static routes = routes;
}
