import {Injectable} from '@angular/core';
import {AppSettings} from "../../../modules/common/app.settings/app.settings";
@Injectable()
export class TitlesAppSettings extends AppSettings {
    constructor() {
        super();
    }
    tabs = [
        'None',
        'mMediaTagging',
        'mEventsActions',
        'mAttachements',
        'mAssocMedia',
        'mHistory',
        'mSegmentsAudioTracks',
        'mNotes',
        'mMetadata',
        'mTasksReports',
        'mMisr'
    ];



    contributorThumb = './assets/img/contributor.jpg';
}
