import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import {GeoLocationTabComponent} from "./geo.location.tab.component";
import {AgmCoreModule, LAZY_MAPS_API_CONFIG} from "@agm/core";
import {GoogleMapsConfig} from './config/geo.google.maps.config';

@NgModule({
    declarations: [
        GeoLocationTabComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        AgmCoreModule.forRoot()
    ],
    providers: [
        {provide: LAZY_MAPS_API_CONFIG, useClass: GoogleMapsConfig}
    ],
    exports: [
        GeoLocationTabComponent
    ]
})
export class GeoLocationModule {}
