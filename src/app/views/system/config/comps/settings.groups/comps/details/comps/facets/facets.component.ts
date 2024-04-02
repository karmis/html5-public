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

@Component({
  selector: 'settings-groups-detail-facets',
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

export class SettingsGroupsDetailsFacetsComponent implements OnInit {
  @Input('facets') private facets: any;
  @Output('changeFacets') private changeFacets: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
  }

  onChangeFacets() {
    this.changeFacets.emit();
  }

}
