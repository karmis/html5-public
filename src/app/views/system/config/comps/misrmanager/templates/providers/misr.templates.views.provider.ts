import { Injectable } from '@angular/core';
import { CheckBoxFormatter } from '../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import { SlickGridColumn } from '../../../../../../../modules/search/slick-grid/types';
import { DatetimeFormatter } from '../../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter';
import { CacheManagerCommonViewsProvider } from '../../../cachemanager/common/cm.common.views.provider';

@Injectable()
export class MisrTemplatesViewsProvider extends CacheManagerCommonViewsProvider {

    public getCustomColumns(sgp, res: any, data: any): SlickGridColumn[] {
        const defColumns: SlickGridColumn[] = this.getCustomDefaultColumns(sgp, res, data);
        const columns = [
            {
                id: 5,
                name: 'Name',
                field: 'CONFIG_NAME',
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
                name: 'Track Tags',
                field: 'TAGGING_FLAG',
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
                name: 'Timing',
                field: 'TIMING_FLAG',
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
                id: 9,
                name: 'QC Status',
                field: 'QC_FLAG',
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
                id: 10,
                name: 'Assisted QC Status',
                field: 'AUTO_QC_FLAG',
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
                id: 11,
                name: 'Media ID Field to Check',
                field: 'MEDIA_ID_FIELD',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 160,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 12,
                name: 'Version ID Field to Check',
                field: 'VERSION_ID_FIELD',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 160,
                __deps: {
                    injector: this.injector
                }
            }
        ];

        return defColumns.concat(columns);
    }

}
