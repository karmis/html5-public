import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { SettingsFormatter } from '../../../../slick-grid/formatters/settings/settings.formatter';
import { ViewsProvider } from '../../../../views/providers/views.provider';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { ViewsConfig } from '../../../../views/views.config';
import { DatetimeFormatter } from '../../../../slick-grid/formatters/datetime/datetime.formatter';
import { DownloadFormatter } from '../../../../slick-grid/formatters/download/download.formatter';
import { PreviewFilesFormatter } from '../../../../slick-grid/formatters/preview-files/preview-files.formatter';
import { StatusFormatter } from '../../../../slick-grid/formatters/status/status.formatter';

@Injectable()
export class TableViewsProvider extends ViewsProvider{
    config: ViewsConfig;
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumnsHistory() {
        return [
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
                name: 'Created By',
                field: 'CREATED_BY',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Created Date',
                field: 'CREATED_DT',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            },
            {
                id: 4,
                name: 'Action',
                field: 'ACTION_NAME',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 5,
                name: 'Description',
                field: 'HistoryText',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            }
        ];
    }

    getCustomColumnsMediaInProd() {
        return [
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
                name: 'Job ID',
                field: '',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 5,
                name: 'Job Status',
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
    }

    getCustomColumnsWorkflows() {
        return [
            {
                id: 1,
                name: 'Type',
                field: 'WORKFLOW_TYPE_Text',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Preset Name',
                field: 'PRESETNAME',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Job ID',
                field: 'JOB_ID',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 4,
                name: 'Workflow Status',
                field: 'WORKFLOW_STATUS',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
                formatter: StatusFormatter,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 5,
                name: 'Created Date',
                field: 'CREATEDDATE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            }
        ];
    }

    getCustomColumnsAttachments() {
        let columns = [
            {
                id: 0,
                name: 'Filename',
                field: 'Filename',
                minWidth: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 1,
                name: 'Title',
                field: 'Title',
                minWidth: 150,
                width: 200,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Added By',
                field: 'CreatedBy',
                minWidth: 50,
                width: 200,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Added On',
                field: 'Created',
                minWidth: 50,
                width: 200,
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
                id: 4,
                name: '',
                field: 'Download',
                minWidth: 50,
                width: 200,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: DownloadFormatter,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 5,
                name: '',
                field: 'PreviewFiles',
                minWidth: 50,
                width: 200,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: PreviewFilesFormatter,
                __deps: {
                    injector: this.injector
                }
            }
        ];
        return columns;
    }

}
