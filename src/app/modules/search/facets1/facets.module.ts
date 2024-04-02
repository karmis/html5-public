import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacetsPageComponent } from './components/facets-page/facets-page.component';
import { FacetsGroupComponent } from './components/facets-group/facets-group.component';
import { FacetsGroupItemComponent } from './components/facets-group-item/facets-group-item.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        FacetsPageComponent,
        FacetsGroupComponent,
        FacetsGroupItemComponent
    ],
    imports: [
        CommonModule,
        TranslateModule
    ],
    exports: [
        FacetsPageComponent
    ]
})
export class FacetsModule {

}
