import {Injectable} from '@angular/core';

import {AppSettings} from "../../../../modules/common/app.settings/app.settings";

@Injectable()
export class MediaDetailAppSettings extends AppSettings {
    tabsType = {
        'None': 'None',
        'MediaTagging': 'mMediaTagging',
        'EventsActions': 'mEventsActions',
        'Attachments': 'mAttachements',
        'AssocMedia': 'mAssocMedia',
        'History': 'mHistory',
        'Segments': 'mSegmentsAudioTracks',
        'AudioTracks': 'mAudio',
        'Notes': 'mNotes',
        'Metadata': 'mMetadata',
        'Reports': 'mReports',
        'Tasks': 'mTasks',
        'Misr': 'mMisr',
        'VideoInfo': 'mVideoInfo',
        'SubtitlesGrid': 'mSubtitles',
        'SubtitlesPacGrid': 'mSubtitlesPacGrid',
        'AI': 'mAI',
        'AVFaults': 'mAvFaults',
        'GeoLocation': 'mGeoLocation',
        'LinkedMedia': 'mLinkedMedia',
        'ProductionList': 'mProductionList',
        'ChildMedia': 'mChildMedia'
    };
}
