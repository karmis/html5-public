import { Injectable } from '@angular/core';
import { CacheManagerCommonViewsProvider } from '../../common/cm.common.views.provider';
import { SlickGridColumn } from '../../../../../../../modules/search/slick-grid/types';

@Injectable()
export class CacheManagerWfMatrixViewsProvider extends CacheManagerCommonViewsProvider {
    public getCustomColumns(sgp, res: any, data: any): SlickGridColumn[] {
        //const defColumns: SlickGridColumn[] = this.getCustomDefaultColumns(sgp, res, data);
        const columns: SlickGridColumn[] = [];
        const source = data.SourceLookup || {};
        let i = 0;
        Object.keys(source).forEach((key) => {
            columns.push({
                id: i,
                name: source[key]?source[key]:'noname',
                field: 'MODIFIED_BY',
                cssClass: 'value-by-center',
                resizable: true,
                sortable: true,
                // formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: false,
                width: 160,
            });
            i++;
        });
        return columns;
    }
}
