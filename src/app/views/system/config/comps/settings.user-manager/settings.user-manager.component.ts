import {
    ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import { UserManagerUsersGridComponent } from './comps/users.grid/users.grid.component';
import { UserManagerUsersSlickGridProvider } from './comps/users.grid/providers/slick.grid.provider';

@Component({
  selector: 'settings-user-management-wrapper',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  entryComponents: [
      UserManagerUsersGridComponent
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
      UserManagerUsersSlickGridProvider,
  ]
})

export class SettingsUserManagerComponent{

    private userManagerIdList = ["USERS", "GROUPS", "NOTIFICATIONS","VIEWS"];

    private selectedTable = null;

    constructor(private cdr: ChangeDetectorRef,) {
    };

    ngOnInit() {
    }

    public selectTable(type) {
        this.selectedTable = type;
    }
}
