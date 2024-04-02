import {Injectable} from '@angular/core';
import {AppSettings} from "../../../modules/common/app.settings/app.settings";
@Injectable()
export class VersionAppSettings extends AppSettings {
    tabs = [
        'None',
        'vMedia',
        'vSegmentsAudioTracks',
        'vNotes',
        'vAdditionalInfo',
        'vRights',
        'mMetadata'
    ];
}
