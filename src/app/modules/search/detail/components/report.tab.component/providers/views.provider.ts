import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";
import {ReportStatusFormatter} from "../../../../slick-grid/formatters/report-status/report-status";
import {DocViewerFormatter} from "../../../../slick-grid/formatters/docviewer/docviewer.formatter";

export class ReportViewsProvider extends ViewsProvider {
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
    getCustomColumns() {
        let columns = [
            {
                id: '1',
                name: '',
                field: 'IsReportAvailable',
                width: 50,
                minWidth: 50,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: ReportStatusFormatter,
                headerCssClass: "disable-reorder",
                __isCustom: true,
                __text_id: 'settings',
                __deps: {
                    injector: this.injector
                }
            }, {
                id: '2',
                name: 'Report Name',
                field: 'ReportName',
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }, {
                id: '3',
                name: 'Report Type',
                field: 'ReportType',
                width: 110,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }, {
                id: '4',
                name: 'Job Ref',
                field: 'JobRef',
                width: 120,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }, {
                id: '5',
                name: 'Generated Date',
                field: 'GeneratedDate',
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                minWidth: 60,
                formatter: DatetimeFormatter,
                // enableColumnReorder: true,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            }, {
                id: '6',
                name: '',
                field: 'Url',
                width: 190,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: DocViewerFormatter,
                // enableColumnReorder: true,
                __deps: {
                    injector: this.injector
                }
            }
        ]
        return columns;
    }
}
