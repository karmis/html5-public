import { Injectable } from '@angular/core';
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';

@Injectable()
export class IMFXFileExplorerTabSlickGridProvider extends SlickGridProvider {
    // private storedId = null;

    buildPageByResponseData(resp: any[]) {
        this.clearData(false);
        const data = this.prepareData(resp, resp.length);
        this.setData(data, true);
        this.setSelectedRow();
    }
}
