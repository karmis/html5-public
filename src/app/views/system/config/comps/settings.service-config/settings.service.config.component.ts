import {
    ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import {ServiceConfigGridComponent} from "./comps/grid/settings.service.config.grid.component";
import {ServiceConfigDetailsComponent} from "./comps/details/settings.service.config.details.component";
import {ServiceConfigSlickGridProvider} from "./comps/grid/providers/slick.grid.provider";

@Component({
  selector: 'settings-service-config-wrapper',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  entryComponents: [
      ServiceConfigGridComponent,
      ServiceConfigDetailsComponent
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
      ServiceConfigSlickGridProvider
  ]
})

export class SettingsServiceConfigComponent implements OnInit {

    @Input("typeId") public typeId: any;
  private mode: "details" | "grid" = "grid"
  @ViewChild('settingsServiceConfigDetails', {static: false}) set contentDetail(contentDetail: ViewContainerRef) {
    (<any>this).settingsServiceConfigDetails = contentDetail;
  } settingsServiceConfigDetails : ServiceConfigDetailsComponent;

    @ViewChild('settingsServiceConfigGrid', {static: false}) set contentGrid(contentGrid: ViewContainerRef) {
        (<any>this).settingsServiceConfigGrid = contentGrid;
    } settingsServiceConfigGrid : ServiceConfigGridComponent;

  constructor(private cdr: ChangeDetectorRef) {

  };

  ngOnInit() {
  }

  selectServiceConfig(data) {
    this.toDetails();
    this.cdr.detectChanges();
    this.settingsServiceConfigDetails.setServiceConfig(data);
  }

  toDetails() {
    this.mode = "details";
  }

  toGrid() {
    this.mode = "grid";
  }
}
