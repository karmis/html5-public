import { ViewsProvider } from '../../../search/views/providers/views.provider';
import { DatetimeFormatter } from '../../../search/slick-grid/formatters/datetime/datetime.formatter';
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { SettingsFormatter } from "../../../search/slick-grid/formatters/settings/settings.formatter";


export class TaskHistoryViewsProvider extends ViewsProvider {
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }
    getCustomColumns() {
        let columns = [];

        columns.unshift(
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
                formatter: SettingsFormatter,
                headerCssClass: "disable-reorder",
                __isCustom: true,
                __text_id: 'settings',
                __deps: {
                    injector: this.injector
                }
            },
            {
            id: '1',
            name: 'Date',
            field: 'DATE',
            width: 150,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
            formatter: DatetimeFormatter,
            __deps: {
                injector: this.injector,
                datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
            }
        });
        columns.unshift({
            id: '2',
            name: 'Action',
            field: 'ActionText',
            width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false
        });
        columns.unshift({
            id: '3',
            name: 'Operator ID',
            field: 'OPERATOR_ID',
            width: 150,
            resizable: true,
            sortable: true,
            multiColumnSort: false
        });
        columns.unshift({
            id: '4',
            name: 'Notes',
            field: 'NOTES',
            minWidth: 300,
            cssClass: 'wrap-prew-rap',
            resizable: true,
            sortable: true,
            multiColumnSort: false
        });

        return columns;
    }
}
