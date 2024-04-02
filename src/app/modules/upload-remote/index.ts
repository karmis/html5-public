/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ComboSingleModule} from '../search/advanced/comps/criteria/comps/controls/comps/container/comps/combosingle';
import {IMFXControlsSelect2Module} from '../controls/select2';
import {VersionsInsideUploadModule} from '../upload/modules/versions';
import {OverlayModule} from '../overlay';
import {IMFXModalComponent} from "../imfx-modal/imfx-modal";
import {IMFXModalModule} from "../imfx-modal";
import {IMFXTextDirectionDirectiveModule} from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {UploadRemoteComponent} from './remote.upload';
import {FilterPipeModule} from "../pipes/filterPipe";
import {VersionsInsideUploadComponent} from "../upload/modules/versions/versions.component";
import {MediaBasketModule} from "../../views/media-basket";
import {IMFXXMLTreeModule} from "../controls/xml.tree";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        UploadRemoteComponent,
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
        // IMFXControlsRemoteFileBrowserModule
    ],
    exports: [
        UploadRemoteComponent,
    ],
    entryComponents: [
        VersionsInsideUploadComponent,
        UploadRemoteComponent,
        IMFXModalComponent
    ]
})

export class UploadRemoteModule {
    entry: Type<UploadRemoteComponent>;

    constructor() {
        this.entry = UploadRemoteComponent;
    }
}

