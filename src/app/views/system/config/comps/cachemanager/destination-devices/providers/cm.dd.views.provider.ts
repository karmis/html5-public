import { Injectable } from '@angular/core';
import { LookupFormatter } from '../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter';
import { CheckBoxFormatter } from '../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import { SlickGridColumn } from '../../../../../../../modules/search/slick-grid/types';
import { DatetimeFormatter } from '../../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter';
import { CacheManagerCommonViewsProvider } from '../../common/cm.common.views.provider';
import { LookupCollectionFormatter } from '../../../../../../../modules/search/slick-grid/formatters/lookup-collection/lookup.collection.formatter';

@Injectable()
export class CacheManagerDestinationDevicesViewsProvider extends CacheManagerCommonViewsProvider {

    public getCustomColumns(sgp, res: any, data: any): SlickGridColumn[] {
        const defColumns: SlickGridColumn[] = this.getCustomDefaultColumns(sgp, res, data);
        const columns = [
            {
                id: 0,
                name: data.translate.instant("cachemanager.dd.name"),
                field: 'DeviceName',
                width: 80,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            },

            // {
            //     id: 1,
            //     name: data.translate.instant("cachemanager.dd.type"),
            //     field: 'NAME',
            //     resizable: true,
            //     sortable: true,
            //     headerCssClass: "disable-reorder",
            //     multiColumnSort: false,
            //     width: 280,
            // },
            {
                id: 2,
                name: data.translate.instant("cachemanager.dd.cache"),
                field: 'CACHE_STATUS',
                formatter: CheckBoxFormatter,
                isCustom: true,
                __deps: {
                    injector: data.injector
                },
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
                width: 160,
            },
            {
                id: 3,
                name: data.translate.instant("cachemanager.dd.purge"),
                field: 'PURGE_STATUS',
                formatter: CheckBoxFormatter,
                isCustom: true,
                __deps: {
                    injector: data.injector
                },
                multiColumnSort: false,
                sortable: true,
                headerCssClass: "disable-reorder",

                width: 160,
            },
            {
                id: 4,
                name: data.translate.instant("cachemanager.dd.purge_period"),
                field: 'PURGE_PERIOD',
                resizable: true,
                sortable: true,
                width: 160,
            },
            {
                id: 5,
                name: data.translate.instant("cachemanager.dd.purge_preset"),
                field: 'PURGE_PRESET_ID',
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: data.injector,
                    lookupMap: this.convertToMap(data.purgePreset, "id")
                }
            },

            {
                id: 6,
                name: data.translate.instant("cachemanager.dd.purge_period_short"),
                field: 'SF_PURGE_PERIOD',
                resizable: true,
                sortable: true,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
            },

            {
                id: 7,
                name: data.translate.instant("cachemanager.dd.purge_preset_short"),
                field: 'SF_PURGE_PRESET_ID',
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                isCustom: true,
                __deps: {
                    injector: data.injector,
                    lookupMap: this.convertToMap(data.purgePreset, "id")
                },
                width: 160,
            },

            {
                id: 8,
                name: data.translate.instant("cachemanager.dd.max_look_ahead"),
                field: 'MAX_LOOK_AHEAD',
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
                id: 9,
                name: data.translate.instant("cachemanager.dd.tx_size"),
                field: 'TX_SIZE_24_HOURS',
                resizable: true,
                sortable: true,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: data.injector
                }
            },
        ];
        return defColumns.concat(columns)

    }
}
