import { ViewsProvider } from 'app/modules/search/views/providers/views.provider';
import { Injectable, Inject } from '@angular/core';
import { DatetimeFormatter } from 'app/modules/search/slick-grid/formatters/datetime/datetime.formatter';
import { FolderLinkFormatter } from 'app/modules/search/slick-grid/formatters/folder-link/folder.link.formatter';

@Injectable()
export class IMFXFileExplorerTabViewsProvider extends ViewsProvider {
    getCustomColumns() {
        const columns = [{
            id: 1,
            name: 'Name',
            field: 'Name',
            minWidth: 150,
            // width: 300,
            isFrozen: false,
            resizable: false,
            __isCustom: true,
            // __text_id: 'tree',
            sortable: false,
            multiColumnSort: false,
            formatter: FolderLinkFormatter,
            headerCssClass: "disable-reorder",
            __deps: {
                injector: this.injector,
                data: {
                    transitionFunc: this.config.componentContext.selectFileExplorer,
                    compContext: this.config.componentContext
                }
            }
        }, {
            id: 2,
            name: 'Size',
            field: 'SizeString',
            minWidth: 100,
            width: 200,
            resizable: true,
            sortable: false,
            multiColumnSort: false
        }, {
            id: 3,
            name: 'Created',
            field: 'ArchiveTime',
            minWidth: 150,
            width: 200,
            resizable: true,
            sortable: false,
            multiColumnSort: false,
            formatter: DatetimeFormatter,
            __deps: {
                injector: this.injector,
                datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
            }
        }
            // , {
            //     id: 4,
            //     name: 'Action',
            //     field: 'ACTION_NAME',
            //     minWidth: 100,
            //     width: 250,
            //     resizable: true,
            //     sortable: true,
            //     multiColumnSort: false
            // }
        ];


        return columns;
    }
}
