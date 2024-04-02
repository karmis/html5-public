import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXAccordionComponent} from './imfx.accordion.component';
import { TranslateModule } from '@ngx-translate/core';
import {AccordionModule} from 'ngx-bootstrap/accordion';
// Pipes
import {LocalDateModule} from '../../../../pipes/localDate';
import {ShowItemsModule} from '../../../../pipes/showItems';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXAccordionComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        AccordionModule.forRoot(),
        LocalDateModule,
        ShowItemsModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXAccordionComponent,
    ]
})
export class IMFXAccordionModule {}
