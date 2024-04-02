import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ChannelsService } from './services/settings.channels.service';
import { ViewsProvider } from 'app/modules/search/views/providers/views.provider';
import { CommonTablesGridViewsProvider } from '../common.tables.grid/providers/views.provider';
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import { CommonTablesSlickGridProvider } from '../common.tables.grid/providers/slick.grid.provider';
import { CommonTablesGridComponent } from '../common.tables.grid/common.tables.grid.component';
import { Subscriber } from 'rxjs';

@Component({
    selector: 'settings-channels-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ChannelsService,
        {provide: ViewsProvider, useClass: CommonTablesGridViewsProvider},
        {provide: SlickGridProvider, useClass: CommonTablesSlickGridProvider},
    ]
})

export class SettingsChannelsGridComponent {
    // channelsGridComponent: ChannelsGridComponent;
    // @ViewChild('channelsGridComponent', {static: true}) set contentGrid(contentGrid: ViewContainerRef) {
    //     (<any>this).channelsGridComponent = contentGrid;
    // }

    @ViewChild('commonTablesGridComponent', {static: true}) private commonTablesGridComponent: CommonTablesGridComponent;

    constructor(
        // private cdr: ChangeDetectorRef,
        private channelsService: ChannelsService
    ) {
    };


    ngOnInit() {
        this.getChannelsTable();
    }

    ngOnDestroy() {

    };

    getChannelsTable(isReload: boolean = false) {
        this.commonTablesGridComponent.getTableAsync(
            this.channelsService.getChannelsTable().map(res => res),
            isReload
        );
    }

    onModalOk($event) {
        this.getChannelsTable(true);
    }

    onDeleteItem($event) {
        const itemToDelete = $event.itemToDelete;
        const observer: Subscriber<any> = $event.observer;

        // observer.next([]);
        // return;
        this.channelsService.changeConfigItem(itemToDelete).subscribe((res: any) => {
            observer.next(res);
            observer.complete();
            this.getChannelsTable();
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
        this.channelsService.changeConfigItem(itemToSave).subscribe((res: any) => {
            observer.next(res);
            observer.complete();
            this.getChannelsTable();
        }, (err) => {
            observer.error(err);
        }, () => {
            observer.complete();
        });
    }
}
