import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WorkOrderItemEllipsisDropdownComponent } from './work.order.item.ellipsis.dropdown';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        WorkOrderItemEllipsisDropdownComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule
    ],
    exports: [
        WorkOrderItemEllipsisDropdownComponent,
    ]
})
export class WorkOrderItemEllipsisDropdownModule {}
