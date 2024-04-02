import { Injectable } from '@angular/core';
import { SlickGridColumn } from '../../../../../../../modules/search/slick-grid/types';
import { CacheManagerCommonViewsProvider } from '../../../cachemanager/common/cm.common.views.provider';
import { CheckBoxFormatter } from '../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';

@Injectable()
export class MisrAudioViewsProvider extends CacheManagerCommonViewsProvider {

    public getCustomColumns(sgp, res: any, data: any): SlickGridColumn[] {
        const defColumns: SlickGridColumn[] = this.getCustomDefaultColumns(sgp, res, data);
        const columns = [
            {
                id: 5,
                name: 'Name',
                field: 'CH_FULL',
                resizable: true,
                sortable: true,
                //    formatter: CheckBoxFormatter,
                multiColumnSort: false,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 6,
                name: 'Code',
                field: 'CH_CODE',
                resizable: true,
                sortable: true,
                //    formatter: CheckBoxFormatter,
                multiColumnSort: false,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 7,
                name: 'Active',
                field: 'ACTIVE',
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
                name: 'CM Template',
                field: 'custom_CM_TEMPLATE_ID_VAL',
                resizable: true,
                sortable: true,
                //    formatter: CheckBoxFormatter,
                multiColumnSort: false,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

            {
                id: 9,
                name: 'MISR Template',
                field: 'custom_MISR_TEMPLATE_ID_VAL',
                resizable: true,
                sortable: true,
                //    formatter: CheckBoxFormatter,
                multiColumnSort: false,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            },

        ];

        return defColumns.concat(columns);
    }

}
