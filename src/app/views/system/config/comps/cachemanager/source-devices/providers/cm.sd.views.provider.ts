import { Injectable } from '@angular/core';
import { CheckBoxFormatter } from '../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import { SlickGridColumn } from '../../../../../../../modules/search/slick-grid/types';
import { DatetimeFormatter } from '../../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter';
import { CacheManagerCommonViewsProvider } from '../../common/cm.common.views.provider';

@Injectable()
export class CacheManagerSourceDevicesViewsProvider extends CacheManagerCommonViewsProvider {

    public getCustomColumns(sgp, res: any, data: any): SlickGridColumn[] {
        const defColumns: SlickGridColumn[] = this.getCustomDefaultColumns(sgp, res, data);
        const columns = [
            {
                id: 5,
                name: data.translate.instant("cachemanager.sd.device_name"),
                field: 'DeviceName',
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
                id: 7,
                name: data.translate.instant("cachemanager.sd.active"),
                field: 'SOURCE_STATUS',
                resizable: true,
                sortable: true,
                formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 8,
                name: data.translate.instant("cachemanager.sd.priority"),
                field: 'SOURCE_PRIOITY',
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
