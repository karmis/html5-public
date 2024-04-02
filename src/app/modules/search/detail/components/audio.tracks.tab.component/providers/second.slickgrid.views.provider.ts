import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";
import {SlickGridProvider} from '../../../../slick-grid/providers/slick.grid.provider';
import {SlickGridColumn} from "../../../../slick-grid/types";

export class ATSecondSlickGridViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns(sgp: SlickGridProvider = null, readOnly?: boolean) {
        let columns = <SlickGridColumn>[
            {
                id: 1,
                name: 'Id',
                field: 'Id',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Filename',
                field: 'Filename',
                minWidth: 150,
                width: 200,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Device',
                field: 'M_CTNR_ID_text',
                minWidth: 150,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 4,
                name: 'Language Code',
                field: 'LanguageCode',
                minWidth: 50,
                width: 100,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 5,
                name: 'Duration',
                field: 'DURATION_text',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }
        ];
        if (!readOnly) {
            columns.push({
                id: 6,
                name: ' Created Dt',
                field: 'CreatedDt',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            });
        }
        return columns;
    }
}
