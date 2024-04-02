import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';
import {FilterPipeModule} from '../../pipes/filterPipe';
import { ProductionTemplatesComponent } from './prod.templates';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ProductionTemplatesComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        AngularSplitModule,
        FilterPipeModule,
        // IMFXControlsTreeModule
    ],
    exports: [
        ProductionTemplatesComponent
    ],
    entryComponents: [
        ProductionTemplatesComponent
    ]
})
export class ProductionTemplatesModule {
    entry: Type<ProductionTemplatesComponent>;

    constructor() {
        this.entry = ProductionTemplatesComponent;
    }
}
