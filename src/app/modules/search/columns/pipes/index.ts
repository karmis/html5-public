import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

// Pipes
import {SearchByName} from './search.by.name';

@NgModule({
    declarations: [
        SearchByName
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],
    exports: [
        SearchByName
    ],
})
export class SearchByNamePipeModule {
}
