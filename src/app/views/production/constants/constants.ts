import { Injectable } from '@angular/core';
import { AppSettings } from "../../../modules/common/app.settings/app.settings";

@Injectable()
export class ProductionAppSettings extends AppSettings {
    static MediaItems = 4000;
    static VersionItems = 4500;
    static TapeItems = 4001;
}
