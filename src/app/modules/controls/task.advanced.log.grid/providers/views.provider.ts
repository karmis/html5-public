import {ViewsProvider} from '../../../search/views/providers/views.provider';
import {LogTypeIndicatorFormatter} from '../../../search/slick-grid/formatters/log-type-indicator/log.type.indicator.formatter';
import {DatetimeFormatter} from '../../../search/slick-grid/formatters/datetime/datetime.formatter';
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";


export class TaskAdvancedLogViewsProvider extends ViewsProvider {
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumns() {
        let columns = [];
        columns.unshift({
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
            name: 'Service',
            field: 'SERVICE',
            width: 250,
            resizable: true,
            sortable: true,
            multiColumnSort: false
        });
        columns.unshift({
            id: '3',
            name: 'Type',
            field: 'logType',
            width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
            formatter: LogTypeIndicatorFormatter,
            __deps: {
                injector: this.injector
            }
        });
        columns.unshift({
            id: '4',
            name: 'Log',
            field: 'LOG',
            minWidth: 150,
            resizable: true,
            sortable: true,
            cssClass: 'wrap-prew-rap',
            multiColumnSort: false
        });

        return columns;
    }
}
