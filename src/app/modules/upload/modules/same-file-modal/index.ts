import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXListOfSameFilesComponent} from "./comp";
import {SlickGridModule} from '../../../search/slick-grid';
import {SearchViewsModule} from '../../../search/views';
import {SearchThumbsModule} from '../../../search/thumbs';


@NgModule({
    declarations: [
        // Comps
        IMFXListOfSameFilesComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchThumbsModule
    ],
    exports: [
        IMFXListOfSameFilesComponent,
    ],
    entryComponents: [
        IMFXListOfSameFilesComponent
    ]
})

export class IMFXListOfSameFilesModule {
    entry: Type<IMFXListOfSameFilesComponent>;

    constructor() {
        this.entry = IMFXListOfSameFilesComponent;
    }
}
