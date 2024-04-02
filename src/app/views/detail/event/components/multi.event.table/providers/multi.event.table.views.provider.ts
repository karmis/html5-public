import {ViewsConfig} from "../../../../../../modules/search/views/views.config";
import {ViewsProvider} from "../../../../../../modules/search/views/providers/views.provider";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {DeleteFormatter} from "../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter";
import {CheckBoxFormatter} from "../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter";
import {DatetimeFormatter} from '../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter';
import {SlickGridFormatterData, SlickGridRowData} from "../../../../../../modules/search/slick-grid/types";
import {SlickGridProvider} from "../../../../../../modules/search/slick-grid/providers/slick.grid.provider";

export class MultiEventTableViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumns() {
        return [
            {
                isFrozen: true,
                id: -6,
                name: '',
                field: '*',
                width: 50,
                minWidth: 50,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: DeleteFormatter,
                headerCssClass: "disable-reorder",
                __isCustom: true,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 1,
                name: 'ID',
                field: 'ID',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Make Id',
                field: 'MAKE_ID',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Version Id',
                field: 'VERSION_ID',
                width: 150,
                minWidth: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 4,
                name: 'Full Title',
                field: 'FULLTITLE',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 5,
                name: 'Version Id1',
                field: 'VERSIONID1',
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
            },
            {
                id: 7,
                name: 'Owner',
                field: 'OWNERS_text',
                width: 100,
                minWidth: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 8,
                name: 'Duration',
                field: 'DURATION',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 9,
                name: 'Start Date',
                field: 'START_DATETIME',
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
            },
            {
                id: 10,
                name: 'End Date',
                field: 'END_DATETIME',
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
        ]
    }
    getCheckBoxColumn() {
        return [{
            id: -7,
            name: '',
            field: 'CheckBox',
            width: 50,
            minWidth: 50,
            formatter: CheckBoxFormatter,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            isFrozen: false,
            isCustom: true,
            __deps: {
                injector: this.injector,
                data: {
                    enabled: true,
                    isActiveFn: (row: SlickGridRowData, provider: SlickGridProvider) => {
                        return provider.getCheckedRows().indexOf(provider.getId(row)) > -1;
                    },
                    getIdFn: (row: SlickGridRowData, provider: SlickGridProvider) => {
                        return provider.getId(row);
                    }
                }
            }
        }];
    }
}
