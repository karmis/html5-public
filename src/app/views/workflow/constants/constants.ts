import {Injectable} from '@angular/core';
import {AppSettings} from "../../../modules/common/app.settings/app.settings";
@Injectable()
export class WorkflowAppSettings extends AppSettings {
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

    // getSubtype(id){
    //     return this.subtypes[id];
    // }
    // public getSubtypes(){
    //     return this.subtypes;
    // }
    //
    // public getTabName(id){
    //     return this.tabs[id];
    // }
    // public getMediaIcon(id){
    //     if( !this.mediaIcons[id] ){
    //         return 0
    //     }
    //     else {
    //         return "./assets/imfx-icons/" +this.mediaIcons[id];
    //     }
    // }
    // public getContributorThumb(){
    //     return this.contributorThumb;
    // }
}
