import {Injectable} from '@angular/core';
import {AppSettings} from "../../../modules/common/app.settings/app.settings";
@Injectable()
export class MisrAppSettings extends AppSettings {
    tabs = [
        'None',
        'cNotes',
        'cMetadata',
        'cHistory'
    ];
    contributorThumb = './assets/img/contributor.jpg';
}
