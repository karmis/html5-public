/**
 * Created by Sergey Trizna on 27.06.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// imfx modules
import { TranslateModule } from '@ngx-translate/core';

// components
import { ConsumerFacetComponent } from './consumer.facet.component';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ConsumerFacetComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
    ],
    exports: [
        ConsumerFacetComponent
    ]
})
export class ConsumerFacetModule {
}
