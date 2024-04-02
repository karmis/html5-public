import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { SettingsFormatter } from '../../../../slick-grid/formatters/settings/settings.formatter';
import { ViewsProvider } from '../../../../views/providers/views.provider';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { ViewsConfig } from '../../../../views/views.config';
import { DatetimeFormatter } from '../../../../slick-grid/formatters/datetime/datetime.formatter';
import { DeleteFormatter } from '../../../../slick-grid/formatters/delete/delete.formatter';

@Injectable()
export class ProductionBottomTabViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumnsSourceMedia() {
        let columns: any[] = [
            {
                id: -2,
                field: "*",
                name: " ",
                width: 38,
                sortable: false,
                resizable: false,
                formatter: DeleteFormatter,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 1,
                name: 'Item Type',
                field: 'ITEM_TYPE_text',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Prog Id1',
                field: 'PROGID1',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Version Id2',
                field: 'VERSIONID2',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 4,
                name: 'Job ID(API)',
                field: '',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 5,
                name: 'Job Status(API)',
                field: '',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 6,
                name: 'Status (PRGM)',
                field: 'PGM_STATUS_TEXT',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 7,
                name: 'Media Type',
                field: 'MEDIA_TYPE_text',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            }
        ];

        // columns.unshift({
        //     isFrozen: true,
        //     id: -6,
        //     name: '',
        //     field: '*',
        //     width: 50,
        //     minWidth: 50,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: SettingsFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'settings',
        //     __deps: {
        //         injector: this.injector
        //     }
        // });


        return columns;
    }

    getCustomColumnsSourceTitles() {
        return [
            {
                id: -1,
                field: "*",
                name: " ",
                width: 38,
                sortable: false,
                resizable: false,
                formatter: DeleteFormatter,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 1,
                name: 'ID',
                field: 'ID',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Owner',
                field: 'OWNERS_text',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Title',
                field: 'TITLE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 4,
                name: 'Version Name',
                field: 'VERSION',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 5,
                name: 'Version Id1 (API)',
                field: '',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 6,
                name: 'Job ID (API)',
                field: '',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 7,
                name: 'Job Status (API)',
                field: '',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            }
        ];
    }

}
