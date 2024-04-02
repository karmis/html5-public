import {WorkflowViewsProvider} from "../../../../../../views/workflow/providers/views.provider";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector} from "@angular/core";
import {SettingsFormatter} from "../../../../slick-grid/formatters/settings/settings.formatter";
import {ExpandContentFormatter} from "../../../../slick-grid/formatters/expand/expand.content.formatter";
import {ExpandControlFormatter} from "../../../../slick-grid/formatters/expand/expand.control.formatter";
import {EmptyFormatter} from "../../../../slick-grid/formatters/empty/empty.formatter";
import {DragDropFormatter} from "../../../../slick-grid/formatters/dragdrop/dragdrop.formatter";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";
import {DownloadFormatter} from "../../../../slick-grid/formatters/download/download.formatter";
import {PreviewFilesFormatter} from "../../../../slick-grid/formatters/preview-files/preview-files.formatter";
import {StatusFormatter} from "../../../../slick-grid/formatters/status/status.formatter";

@Injectable()
export class WorkflowHistoryViewsProvider extends WorkflowViewsProvider {
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }
    getCustomColumns() {
        let columns = [
            {
                isFrozen: false,
                id: -6,
                name: '',
                field: '*',
                width: 10,
                minWidth: 10,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: EmptyFormatter,
                headerCssClass: "disable-reorder",
                __isCustom: true,
                __text_id: 'empty-control',
                __deps: {
                    injector: this.injector,
                    data: {
                        isDD: false
                    }
                }
            },
            {
                isFrozen: false,
                id: -5,
                name: '',
                field: '*',
                width: 40,
                minWidth: 40,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: ExpandControlFormatter,
                headerCssClass: "disable-reorder",
                __isCustom: true,
                __text_id: 'expand-control',
                __deps: {
                    injector: this.injector
                }
            },
            {
                isFrozen: true,
                id: -4,
                name: '',
                field: '*',
                width: 0.1,
                minWidth: 0.1,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: ExpandContentFormatter,
                headerCssClass: "disable-reorder hidden",
                cssClass: 'expand-content-formatter',
                __isCustom: true,
                __text_id: 'expand-content',
                __deps: {
                    injector: this.injector
                }
            },
            {
                isFrozen: true,
                id: -3,
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
                id: 0,
                name: 'Id',
                field: 'ID',
                minWidth: 80,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 1,
                name: 'Workflow #',
                field: 'J_REF',
                minWidth: 150,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Full Title',
                field: 'CMB_IN_TTLS_text',
                minWidth: 150,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Workflow Preset',
                field: 'PNAME_text',
                minWidth: 150,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 4,
                name: 'Status',
                field: 'CMB_STAT_text',
                minWidth: 150,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: StatusFormatter,
                isCustom: true,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 5,
                name: 'Created Date',
                field: 'J_CREATED',
                minWidth: 150,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            },
            {
                id: 6,
                name: 'Owner',
                field: 'J_CLI_CODE_text',
                minWidth: 150,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }
        ];

        return columns;
    }
}
