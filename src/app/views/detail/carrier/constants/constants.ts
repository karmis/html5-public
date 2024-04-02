import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';

import {AppSettings} from "../../../../modules/common/app.settings/app.settings";

@Injectable()
export class CarrierDetailAppSettings extends AppSettings {
    tabsType = {
        'None': 'None',
        'Notes': 'cNotes',
        'Metadata': 'cMetadata',
        'History': 'cHistory',
        'cMedia': 'cMedia',
        'cVersions': 'cVersions',
        'cWorkflowHistory': 'cWorkflowHistory',
        'cTitles': 'cTitles',
        'FileExplorer': 'cFileExplorer'
    };
}
