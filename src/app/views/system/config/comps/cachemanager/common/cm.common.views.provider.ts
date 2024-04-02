import { ViewsProvider } from '../../../../../../modules/search/views/providers/views.provider';
import { DoActionFormatter } from '../../../../../../modules/search/slick-grid/formatters/doaction/doaction.formatter';
import { DeleteFormatter } from '../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter';
import { Injectable } from '@angular/core';
import { DatetimeFormatter } from '../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter';

@Injectable()
export class CacheManagerCommonViewsProvider extends ViewsProvider{
    public getCustomDefaultColumns(sgp, res: any, data: any){
        return [
            {
                id: -2,
                name: ' ',
                field: '',
                width: 35,
                resizable: false,
                sortable: false,
                formatter: DoActionFormatter,
                multiColumnSort: false,
                cssClass: 'value-by-center',
                headerCssClass: "disable-reorder",
                isCustom: true,
                __deps: {
                    injector: this.injector,
                    data: {
                        titleHint: "consumer_settings.edit",
                        actionDelegate: data.context
                    }
                }
            },
            {
                id: -1,
                name: ' ',
                field: '',
                width: 35,
                resizable: false,
                sortable: false,
                cssClass: 'value-by-center',
                formatter: DeleteFormatter,
                multiColumnSort: false,
                isCustom: true,
                headerCssClass: "disable-reorder",
                __deps: {
                    injector: this.injector,
                    data: {
                        withModal: true,
                        modalData: {
                            text: 'cachemanager.common.remove_question',
                            message: 'global_settings.remove_success_s',
                        },
                        //tableId: tableId,
                        rows: res.Data
                    }
                }
            },
            {
                id: 996,
                name: data.translate.instant("cachemanager.common.created_by"),
                field: 'CREATED_BY',
                cssClass: 'value-by-center',
                resizable: true,
                sortable: true,
                multiColumnSort: false,
                isCustom: true,
                width: 160,
                __deps: {
                    injector: data.injector
                }
            },

            {
                id: 997,
                name: data.translate.instant("cachemanager.common.modified_by"),
                field: 'MODIFIED_BY',
                cssClass: 'value-by-center',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 160,
                __deps: {
                    injector: data.injector
                }
            },

            {
                id: 998,
                name: data.translate.instant("cachemanager.common.created"),
                field: 'CREATED_DT',
                cssClass: 'value-by-center',
                resizable: true,
                sortable: true,
                formatter: DatetimeFormatter,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 160,
                __deps: {
                    injector: data.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            },

            {
                id: 999,
                name: data.translate.instant("cachemanager.common.modified"),
                field: 'MODIFIED_DT',
                cssClass: 'value-by-center',
                resizable: true,
                sortable: true,
                formatter: DatetimeFormatter,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 160,
                __deps: {
                    injector: data.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            }
        ];
    }


    convertToMap(lookupData:any[] = [], field: string, text: string = 'text') {
        var result = {};
        for (var i = 0; i < lookupData.length; i++) {
            result[lookupData[i][field]] = lookupData[i][text];
        }
        return result;
    }
}
