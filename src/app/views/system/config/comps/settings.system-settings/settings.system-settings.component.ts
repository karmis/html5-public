import {
    ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import {SystemSettingsGridComponent} from "./comps/grid/settings.system-settings.grid.component";
import {SystemSettingsSlickGridProvider} from "./comps/grid/providers/slick.grid.provider";
import {SystemSettingsService} from "./services/settings.system-settings.service";

@Component({
  selector: 'settings-system-settings',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  entryComponents: [
      SystemSettingsGridComponent
  ],
  encapsulation: ViewEncapsulation.None,
    providers: [
        SystemSettingsSlickGridProvider,
        SystemSettingsService
    ]
})

export class SettingsSystemSettingsComponent implements OnInit {

    @ViewChild('overlaySystemSettings', {static: false}) private overlaySystemSettings: any;
    @ViewChild('overlaySystemSettingsTarget', {static: false}) private overlaySystemSettingsTarget: any;
    @ViewChild('systemSettingsGridComponent', {static: false}) set contentGrid(contentGrid: ViewContainerRef) {
        (<any>this).systemSettingsGridComponent = contentGrid;
    } systemSettingsGridComponent : SystemSettingsGridComponent;

    constructor(private cdr: ChangeDetectorRef,
                private systemSettingsService: SystemSettingsService) {
    };

    ngOnInit() {

    }
}
