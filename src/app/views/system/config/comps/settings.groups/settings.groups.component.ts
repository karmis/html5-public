import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import { SettingsGroupsGridComponent } from "./comps/grid/settings.groups.grid.component";
import { SettingsGroupsDetailsComponent } from "./comps/details/settings.groups.details.component";
import { SettingsGroupsService } from "../../../../../services/system.config/settings.groups.service";
import { Subscription } from "rxjs";
import {SettingsGroupGridItemType, SettingsGroupType} from "../../types";

@Component({
    selector: 'settings-groups-manager',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [
        SettingsGroupsGridComponent,
        SettingsGroupsDetailsComponent
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // SettingsGroupsService
    ]
})

export class SettingsGroupsComponent implements OnInit, OnDestroy {
    // private subSelectSettingsGroup: Subscription;
    private mode: "details" | "grid" = "grid";

    @ViewChild('settingsGroupDetails', {static: false}) set content(content: ViewContainerRef) {
        (<any>this).settingsGroupDetails = content;
    }

    settingsGroupDetails: SettingsGroupsDetailsComponent;

    constructor(private cdr: ChangeDetectorRef,
                private settingsGroupsService: SettingsGroupsService) {

    };

    ngOnInit() {
        // this.subSelectSettingsGroup = this.settingsGroupsService.addedNewGroup.subscribe(group => {
        //     debugger
        //   if(group) {
        //       this.selectSettingsGroup(group);
        //   }
        // });
    }

    ngOnDestroy(): void {
        // this.subSelectSettingsGroup.unsubscribe();
    }

    selectSettingsGroup(event: {
        data: SettingsGroupGridItemType,
        isClone: boolean
    }) {
        this.toDetails();
        this.cdr.detectChanges();
        this.settingsGroupDetails.initSettingsGroupDetail(event.data, event.isClone);
    }

    toDetails() {
        this.mode = "details";
    }

    toGrid() {
        this.mode = "grid";
    }
}
