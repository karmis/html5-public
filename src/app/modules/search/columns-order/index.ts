/**
 * Created by Sergey Trizna on 03.03.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';
import {FilterPipeModule} from '../../pipes/filterPipe';
import {ColumnsOrderComponent} from './columns.order';
import {SlickGridModule} from '../slick-grid';
import {IMFXTextDirectionDirectiveModule} from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ColumnsOrderComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        AngularSplitModule,
        FilterPipeModule,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        ColumnsOrderComponent
    ],
    entryComponents: [ColumnsOrderComponent]
})
export class ColumnsOrderModule {
    entry: Type<ColumnsOrderComponent>;

    constructor() {
        this.entry = ColumnsOrderComponent;
    }
}
