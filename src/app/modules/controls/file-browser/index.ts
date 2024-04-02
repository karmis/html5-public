/**
 * Created by Sergey Trizna on 17.12.2016.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IMFXControlsRemoteFileBrowserComponent} from './remote-file-browser';
import {TranslateModule} from '@ngx-translate/core';
import {OverlayModule} from '../../overlay';
import {SafePipeModule} from "../../pipes/safePipe";

@NgModule({
    declarations: [
        IMFXControlsRemoteFileBrowserComponent,
    ],
    imports: [
        FormsModule,
        TranslateModule,
        CommonModule,
        OverlayModule,
        SafePipeModule
    ],
    exports: [
        IMFXControlsRemoteFileBrowserComponent,
    ],
    entryComponents: [
        IMFXControlsRemoteFileBrowserComponent
    ]
})
export class IMFXControlsRemoteFileBrowserModule {
    entry: Type<IMFXControlsRemoteFileBrowserComponent>;

    constructor() {
        this.entry = IMFXControlsRemoteFileBrowserComponent;
    }
}
