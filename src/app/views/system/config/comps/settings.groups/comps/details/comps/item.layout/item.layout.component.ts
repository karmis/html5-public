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
import {ConsumerItemSettingsComponent} from "../../../../../../../../../modules/settings/consumer/item/consumer.item.settings.component";

@Component({
  selector: 'settings-groups-detail-item-layout',
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

export class SettingsGroupsDetailsItemLayoutComponent implements OnInit {
    @ViewChild('consumerItemSettingsComponent', {static: false}) private _consumerItemSettingsComponent: ConsumerItemSettingsComponent;
    // @Input('context') private context: any;
    // @Output('consumerItemSettings') private consumerItemSettings: EventEmitter<any> = new EventEmitter<any>();
    @Input('consumerItemSettings') private consumerItemSettings = null;
    get consumerItemSettingsComponent(): ConsumerItemSettingsComponent {
        return this._consumerItemSettingsComponent;
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

    constructor(private cdr: ChangeDetectorRef) {

    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        let res = this.consumerItemSettings;
        if (res && res.id != null && res.data)
            this._consumerItemSettingsComponent.preheatSettings(res.id, res.data);
    }
}
