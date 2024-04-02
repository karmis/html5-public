import {Injectable} from '@angular/core';

import {AppSettings} from "../../../../modules/common/app.settings/app.settings";

@Injectable()
export class TitlesDetailAppSettings extends AppSettings {
    tabsType = {
        'None': 'None',
        // 'Metadata': 'tMetadata',
        'Titles': 'tTitles',
        'Versions': 'tVersions',
        'CustomMetadata': 'tCustomMetadata',
        'History': 'tHistory'
    };
}
