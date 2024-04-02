import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MediaLanguageListComponent} from "./media.language.items.list";
import {LocalDateModule} from "../../../../pipes/localDate";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        MediaLanguageListComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        LocalDateModule,
        FormsModule
    ],
    exports: [
        MediaLanguageListComponent,
    ]
})
export class  MediaLanguageListModule {}
