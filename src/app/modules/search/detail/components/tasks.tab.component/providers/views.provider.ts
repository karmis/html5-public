import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";
import {TaskStatusFormatter} from "../../../../slick-grid/formatters/task-status/task-status";
import {TaskProgressFormatter} from "../../../../slick-grid/formatters/task-progress/task-progress";
import {LinkFormatter} from "../../../../slick-grid/formatters/link/link.formatter";
import {appRouter} from "../../../../../../constants/appRouter";

export class TasksViewsProvider extends ViewsProvider {
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
                id: 0,
                name: 'Task Id',
                field: 'ID',
                width: 100,
                minWidth: 100,
                resizable: false,
                sortable: false,
                multiColumnSort: false
            }, {
                id: 1,
                name: 'Workflow #',
                field: 'JobRef',
                width: 130,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: LinkFormatter,
                __deps: {
                    injector: this.injector,
                    data: {
                        linkTemp: appRouter.workflow.detail,
                        valueField: 'JobId'
                    }
                }
            }, {
                id: 2,
                name: 'Task',
                field: 'TSK_TYPE_text',
                width: 300,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }, {
                id: 3,
                name: 'Status',
                field: 'StatusText',
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: TaskStatusFormatter,
                enableColumnReorder: true,
                __deps: {
                    injector: this.injector
                }
            }, {
                id: 4,
                name: 'Progress',
                field: 'TSK_PROGRSS',
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: TaskProgressFormatter,
                enableColumnReorder: true,
                __deps: {
                    injector: this.injector
                }
            }, {
                id: 5,
                name: 'Started',
                field: 'StartDate',
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            }, {
                id: 6,
                name: 'Completed',
                field: 'EndDate',
                width: 150,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            }, {
                id: 7,
                name: 'Preset',
                field: 'Preset',
                width: 210,
                minWidth: 100,
                resizable: false,
                sortable: false,
                multiColumnSort: false
            }, {
                id: 8,
                name: 'Created',
                field: 'CreatedDate',
                width: 150,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            }
        ];
        return columns;
    }
}
