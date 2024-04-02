/**
 * Created by Sergey Trizna on 03.03.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';
import {FilterPipeModule} from '../../pipes/filterPipe';
import {IMFXControlsTreeModule} from '../../controls/tree';
import {LocationComponent} from './location';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        LocationComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        AngularSplitModule,
        FilterPipeModule,
        IMFXControlsTreeModule
    ],
    exports: [
        LocationComponent
    ],
    entryComponents: [
        LocationComponent
    ]
})

export class LocationModule {
    entry: Type<LocationComponent>;

    constructor() {
        this.entry = LocationComponent;
    }
}
