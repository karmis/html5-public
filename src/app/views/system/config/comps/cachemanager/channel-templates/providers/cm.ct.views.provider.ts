import { Injectable } from '@angular/core';
import { SlickGridColumn, SlickGridRowData } from '../../../../../../../modules/search/slick-grid/types';
import { CheckBoxFormatter } from '../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import { CacheManagerCommonViewsProvider } from '../../common/cm.common.views.provider';
import { LookupCollectionFormatter } from '../../../../../../../modules/search/slick-grid/formatters/lookup-collection/lookup.collection.formatter';
import { LookupFormatter } from '../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter';
import { ArrayFormatter } from '../../../../../../../modules/search/slick-grid/formatters/array/array.formatter';

@Injectable()
export class CacheManagerChannelTemplatesViewsProvider extends CacheManagerCommonViewsProvider {
    public getCustomColumns(sgp, res: any, data: any): SlickGridColumn[] {
        const defColumns: SlickGridColumn[] = this.getCustomDefaultColumns(sgp, res, data);
        const columns: SlickGridColumn[] = [
            {
                id: 0,
                name: data.translate.instant("cachemanager.ct.name"),
                field: 'NAME',
                cssClass: 'value-by-center',
                width: 80,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            },
            {
                id: 2,
                name: data.translate.instant("cachemanager.ct.active"),
                field: 'ACTIVE',
                cssClass: 'value-by-center',
                formatter: CheckBoxFormatter,
                isCustom: true,
                __deps: {
                    injector: data.injector
                },
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
                width: 80,
            },
            {
                id: 3,
                name: data.translate.instant("cachemanager.ct.comps"),
                field: 'COMPONENTS',
                cssClass: 'value-by-center',
                formatter: CheckBoxFormatter,
                isCustom: true,
                __deps: {
                    injector: data.injector
                },
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
                width: 80,
            },
            {
                id: 4,
                name: data.translate.instant("cachemanager.ct.channels"),
                cssClass: 'value-by-center',
                field: 'MediaFormats',
                resizable: true,
                sortable: true,
                formatter: ArrayFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 160,
                __deps: {
                    injector: data.injector,
                    mapFn: this.mapFn
                }
            },
            // {
            //     id: 4,
            //     name: data.translate.instant("cachemanager.ct.format"),
            //     field: 'MediaFormats',
            //     cssClass: 'value-by-center',
            //     resizable: true,
            //     isCustom: true,
            //     formatter: LookupFormatter,
            //     width: 120,
            //     __deps: {
            //         mapFn: this.explodeStr()
            //         // injector: data.injector,
            //         // lookupMap: this.convertToMap(data.MediaFileTypeLookup || [], "Id", "Value")
            //     }
            // },
            {
                id: 5,
                name: data.translate.instant("cachemanager.ct.definition"),
                field: 'VideoDefinitions',
                resizable: true,
                sortable: true,
                formatter: LookupCollectionFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 190,
                minWidth: 190,
                __deps: {
                    injector: data.injector,
                    lookupMap: this.convertToMap(data.TvStandardsLookup || [], "Id", "Value")
                }
            },
            {
                id: 6,
                name: data.translate.instant("cachemanager.ct.tx_period"),
                field: 'TX_PERIOD',
                cssClass: 'value-by-center',
                width: 100,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            },
            {
                id: 7,
                name: data.translate.instant("cachemanager.ct.hiatus"),
                field: 'HIATUS',
                cssClass: 'value-by-center',
                width: 100,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            },
            {
                id: 8,
                name: data.translate.instant("cachemanager.ct.dest_devices"),
                field: 'DestDevices',
                resizable: true,
                sortable: true,
                formatter: LookupCollectionFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 190,
                __deps: {
                    injector: data.injector,
                    lookupMap: this.convertToMap(data.DestDevices || [], "DEVICE_ID", "DeviceName")
                }
            },
            {
                id: 9,
                name: data.translate.instant("cachemanager.ct.source_devices"),
                field: 'SrcDevices',
                resizable: true,
                sortable: true,
                formatter: LookupCollectionFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 210,
                __deps: {
                    injector: data.injector,
                    lookupMap: this.convertToMap(data.SrcDevices || [], "DEVICE_ID", "DeviceName")
                }
            },
            {
                id: 10,
                name: data.translate.instant("cachemanager.ct.source_devices_promo"),
                field: 'SrcDevicesPromo',
                resizable: true,
                sortable: true,
                formatter: LookupCollectionFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 210,
                __deps: {
                    injector: data.injector,
                    lookupMap: this.convertToMap(data.SrcDevices || [], "DEVICE_ID", "DeviceName")
                }
            },
        ];
        return defColumns.concat(columns);
    }

    public mapFn(data: SlickGridRowData|any): string {
        return  data.MediaFormats.join(",\n");
    }
}
