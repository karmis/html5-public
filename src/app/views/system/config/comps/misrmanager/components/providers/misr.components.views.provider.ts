import { Injectable } from '@angular/core';
import { CheckBoxFormatter } from '../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import { SlickGridColumn } from '../../../../../../../modules/search/slick-grid/types';
import { DatetimeFormatter } from '../../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter';
import { CacheManagerCommonViewsProvider } from '../../../cachemanager/common/cm.common.views.provider';
import { LookupFormatter } from '../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter';

@Injectable()
export class MisrComponentsViewsProvider extends CacheManagerCommonViewsProvider {

    public getCustomColumns(sgp, res: any, data: any): SlickGridColumn[] {
        const defColumns: SlickGridColumn[] = this.getCustomDefaultColumns(sgp, res, data);
        const columns = [
            {
                id: 5,
                name: 'Name',
                field: 'NAME',
                resizable: true,
                sortable: true,
                //    formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 6,
                name: 'Storage Device',
                field: 'custom_STORAGE_ID_VAL',
                resizable: true,
                sortable: true,
                isCustom: false,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 7,
                name: 'Media Type',
                field: 'custom_MEDIA_TYPE_VAL',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 8,
                name: 'Media File Type',
                field: 'custom_MEDIA_FILE_TYPE_VAL',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 9,
                name: 'Usage Type',
                field: 'custom_USAGE_TYPE_VAL',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 10,
                name: 'Audio Content Type',
                field: 'custom_AUDIO_CONTENT_TYPE_VAL',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            }
        ];

        return defColumns.concat(columns);
    }
}
