import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IMFXQcReportsComponent } from './imfx.qc.reports.component';
import { LocationModule } from '../../../location';
import { IMFXControlsTreeModule } from '../../../../controls/tree';
import { AngularSplitModule } from 'angular-split';
import { TranslateModule } from '@ngx-translate/core';
import { IMFXXMLTreeModule } from '../../../../controls/xml.tree';
import {IMFXSimpleTreeModule} from "../../../../controls/simple.tree";

@NgModule({
    declarations: [
        IMFXQcReportsComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LocationModule,
        IMFXControlsTreeModule,
        AngularSplitModule,
        TranslateModule,
        IMFXXMLTreeModule,
        IMFXSimpleTreeModule
    ],
    exports: [
        IMFXQcReportsComponent
    ]
})
export class IMFXQcReportsModule {}
