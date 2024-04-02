import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Type,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SlickGridProvider} from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import {ViewsProvider} from 'app/modules/search/views/providers/views.provider';
import {Subscriber} from 'rxjs';
import {ChannelsGroupsService} from "./services/settings.channels-groups.service";
import {ChannelsGroupChangeModalComponent} from "./modals/edit.modal/channels.group.change.modal.component";
import {lazyModules} from "app/app.routes";
import {CommonTablesGridComponent} from "../common.tables.grid/common.tables.grid.component";
import {CommonTablesGridViewsProvider} from "../common.tables.grid/providers/views.provider";
import {CommonTablesSlickGridProvider} from "../common.tables.grid/providers/slick.grid.provider";

@Component({
    selector: 'settings-channels-groups-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ChannelsGroupsService,
        {provide: ViewsProvider, useClass: CommonTablesGridViewsProvider},
        {provide: SlickGridProvider, useClass: CommonTablesSlickGridProvider},
    ]
})

export class SettingsChannelsGroupsGridComponent {
    // channelsGridComponent: ChannelsGroupsGridComponent;
    // @ViewChild('channelsGridComponent', {static: true}) set contentGrid(contentGrid: ViewContainerRef) {
    //     (<any>this).channelsGridComponent = contentGrid;
    // }
    @ViewChild('commonTablesGridComponent', {static: true}) private commonTablesGridComponent: CommonTablesGridComponent;

    customEditModal: {type: Type<any>, path: any, size?: string} = {
        type: ChannelsGroupChangeModalComponent,
        path: lazyModules.channel_group_change_modal,
        size: 'lg'
    };

    constructor(
        // private cdr: ChangeDetectorRef,
        private channelsGroupService: ChannelsGroupsService,
    ) {
    };

    ngOnInit() {
        this.getChannelsGroupsTable();
    }

    getChannelsGroupsTable(isReload: boolean = false) {
        this.commonTablesGridComponent.getTableAsync(
            this.channelsGroupService.getChannelsGroupsTable().map(res => res),
            isReload
        );
    }

    onModalOk($event) {
        this.getChannelsGroupsTable(true);
    }

    onDeleteItem($event) {
        const itemToDelete = $event.itemToDelete;
        const observer: Subscriber<any> = $event.observer;

        // observer.next([]);
        // return;
        this.channelsGroupService.changeConfigItem(itemToDelete).subscribe((res: any) => {
            observer.next(res);
            observer.complete();
            this.getChannelsGroupsTable();
        }, (err) => {
            observer.error(err);
        }, () => {
            observer.complete();
        });
    }

    onChangeItem($event) {
        const itemToSave = $event.itemToSave;
        const observer: Subscriber<any> = $event.observer;

        // observer.next([]);
        // return;
        this.channelsGroupService.changeConfigItem(itemToSave).subscribe((res: any) => {
            observer.next(res);
            observer.complete();
            this.getChannelsGroupsTable();
        }, (err) => {
            observer.error(err);
        }, () => {
            observer.complete();
        });
    }

}










