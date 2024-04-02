import {
    ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";

import {LoadMasterGridComponent} from "./comps/grid/settings.load-master.grid.component";
import {LoadMasterService} from "./services/settings.load-master.service";
import {LoadMasterSlickGridProvider} from "./comps/grid/providers/slick.grid.provider";

@Component({
  selector: 'settings-load-master-wrapper',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  entryComponents: [
      LoadMasterGridComponent
  ],
  encapsulation: ViewEncapsulation.None,
    providers: [
        LoadMasterSlickGridProvider,
        LoadMasterService
    ]
})

export class SettingsLoadMasterComponent implements OnInit {

    @ViewChild('overlayLoadMaster', {static: false}) private overlayLoadMaster: any;
    @ViewChild('overlayLoadMasterTarget', {static: false}) private overlayLoadMasterTarget: any;
    @ViewChild('loadMasterGridComponent', {static: false}) set contentGrid(contentGrid: ViewContainerRef) {
        (<any>this).loadMasterGridComponent = contentGrid;
    } loadMasterGridComponent : LoadMasterGridComponent;

    constructor(private cdr: ChangeDetectorRef,
                private loadMasterService: LoadMasterService) {
    };

    ngOnInit() {
        // this.overlayTables.show(this.overlayLoadMasterTarget.nativeElement);
        // this.loadMasterService.getTable().subscribe((res: any) =>{
        //
        //     this.cdr.detectChanges();
        //     this.overlayTables.hide(this.overlayLoadMasterTarget.nativeElement);
        // });
    }
}
