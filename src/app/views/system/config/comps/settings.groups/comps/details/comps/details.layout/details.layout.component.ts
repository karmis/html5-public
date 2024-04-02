/**
 * Created by dvvla on 28.09.2017.
 */

import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    Input,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';
import {ConsumerDetailSettingsComponent} from "../../../../../../../../../modules/settings/consumer/detail/consumer.detail.settings.component";

@Component({
  selector: 'settings-groups-detail-detail-layout',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    //SettingsGroupsService
  ]
})

export class SettingsGroupsDetailsDetailsLayoutComponent implements OnInit {
    @ViewChild('consumerDetailSettingsComponent', {static: false}) private _consumerDetailSettingsComponent: ConsumerDetailSettingsComponent;
    // @Input('context') private context: any;
    // @Output('consumerDetailsSettings') private consumerDetailsSettings: EventEmitter<any> = new EventEmitter<any>();
    @Input('consumerDetailsSettings') private consumerDetailsSettings = null;
    get consumerDetailSettingsComponent(): ConsumerDetailSettingsComponent {
        return this._consumerDetailSettingsComponent;
    }

    private consumerItem: any = {
        "VersionId": "VersionId",
        "Title": "Item Title",
        "SeriesId": "Series Id",
        "VersionId1": "Version Id",
        "Synopsis": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce erat sem, dapibus quis dui quis, pulvinar laoreet mauris. Pellentesque fermentum, lectus sed tincidunt fringilla, erat diam tempor ipsum, laoreet faucibus mi enim vitae elit. Morbi porttitor nulla nec nulla fringilla aliquet. Fusce ultrices finibus lectus vel egestas. Integer facilisis enim dui, nec aliquam lorem euismod et. Aliquam orci sem, ultrices ac eros at, euismod facilisis ex. Maecenas eget libero eget ex egestas tincidunt. Praesent vitae ipsum a felis egestas tempus. Nullam tempor, sapien sed interdum posuere, tortor dui mattis sem, a ullamcorper enim tortor quis ex.",
        "Duration": "00:30",
        "TxDate": null,
        "ItemType": "Item Type",
        "IsHD": false,
        "ThumbUrl": null, //"http://192.168.90.39/getfile.aspx?id=3006717",
        "ProxyUrl": null,
        "IsSeries": true,
        "SeriesTitle": "Series Title",
        "SeasonTitle": "Season Title",
        "EpisodeNo": "Episode #",
        "SeasonNo": "Season #",
        "PlayerType": null
    };

    constructor() {

    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        let res = this.consumerDetailsSettings;
        if (res && res.id != null && res.data)
            this._consumerDetailSettingsComponent.preheatSettings(res.id, res.data);
    }

}
