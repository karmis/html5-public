import {Injectable} from '@angular/core';
import {AppSettings} from "../../../../../modules/common/app.settings/app.settings";
@Injectable()
export class VersionsAppSettings extends AppSettings {
    tabs = [
        'None',
        'vMedia',
        'vSegmentsAudioTracks',
        'vNotes',
        'vAdditionalInfo',
        'vRights',
        'mMetadata'
    ];

    contributorThumb = './assets/img/contributor.jpg';
}
