/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSingleModule } from '../search/advanced/comps/criteria/comps/controls/comps/container/comps/combosingle';
import { IMFXControlsSelect2Module } from '../controls/select2';
import { VersionsInsideUploadModule } from './modules/versions';
import { UploadComponent } from './upload';
import { OverlayModule } from '../overlay';
import { IMFXModalComponent } from "../imfx-modal/imfx-modal";
import { IMFXModalModule } from "../imfx-modal";
import { IMFXTextDirectionDirectiveModule } from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { FilterPipeModule } from "../pipes/filterPipe";
import { VersionsInsideUploadComponent } from "./modules/versions/versions.component";
import { MediaBasketModule } from "../../views/media-basket";
import { OrderPresetsGroupedModule } from "../order-presets-grouped";
import { IMFXXMLTreeModule } from '../controls/xml.tree';



@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        UploadComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ComboSingleModule,
        IMFXControlsSelect2Module,
        // ModalModule,
        OverlayModule,

        // inside
        VersionsInsideUploadModule,
        IMFXModalModule,
        IMFXTextDirectionDirectiveModule,
        FilterPipeModule,
        MediaBasketModule,
        IMFXXMLTreeModule,
        OrderPresetsGroupedModule,
        // IMFXControlsRemoteFileBrowserModule
    ],
    exports: [
        UploadComponent,
    ],
    entryComponents: [
        VersionsInsideUploadComponent,
        UploadComponent,
        IMFXModalComponent
    ]
})

export class UploadModule {
    entry: Type<UploadComponent>;

    constructor() {
        this.entry = UploadComponent;
    }
}

