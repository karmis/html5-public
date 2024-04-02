import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';

import {AppSettings} from "../../../../modules/common/app.settings/app.settings";

@Injectable()
export class VersionDetailAppSettings extends AppSettings {
    tabsType = {
        'None': 'None',
        'Media': 'vMedia',
        'Segments': 'vSegmentsAudioTracks',
        'AudioTracks': 'vAudio',
        'Notes': 'vNotes',
        'AdditionalInfo': 'vAdditionalInfo',
        'Rights': 'vRights',
        'Metadata': 'mMetadata',
        'ImfPackage': 'vIMF',
        'Titles': 'vTitles',
        'History': 'vHistory'
    };
}
