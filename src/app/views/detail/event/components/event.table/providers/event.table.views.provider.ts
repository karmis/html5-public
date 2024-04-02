import { ViewsConfig } from "../../../../../../modules/search/views/views.config";
import { ViewsProvider } from "../../../../../../modules/search/views/providers/views.provider";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { DeleteFormatter } from "../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter";
import { CheckBoxFormatter } from "../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter";
import { DatetimeFormatter } from '../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter';

export class EventTableViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumns() {
        const col = [
            // {
            //     id: -10,
            //     name: '',
            //     field: '*',
            //     width: 50,
            //     minWidth: 50,
            //     formatter: CheckBoxFormatter,
            //     resizable: true,
            //     sortable: false,
            //     multiColumnSort: false,
            //     isFrozen: false,
            //     isCustom: true,
            //     __deps: {
            //         injector: this.injector,
            //         data: {
            //             enabled: false,
            //         }
            //     }
            // },
            // {
            //     isFrozen: true,
            //     id: -6,
            //     name: '',
            //     field: '*',
            //     width: 50,
            //     minWidth: 50,
            //     resizable: false,
            //     sortable: false,
            //     multiColumnSort: false,
            //     formatter: DeleteFormatter,
            //     headerCssClass: "disable-reorder",
            //     __isCustom: true,
            //     __deps: {
            //         injector: this.injector
            //     }
            // },
            {
                id: 1,
                name: 'ID',
                field: 'VERSION_ID',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Full Title',
                field: 'FULLTITLE',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Version Name',
                field: 'VERSION_NAME',
                width: 150,
                minWidth: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 4,
                name: 'Version ID1',
                field: 'VERSIONID1',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 5,
                name: 'Owner',
                field: 'OWNERS_text',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 6,
                name: 'Next TX Date',
                field: 'NEXT_TX_DATE',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            }
        ];
        return col
    }

}
