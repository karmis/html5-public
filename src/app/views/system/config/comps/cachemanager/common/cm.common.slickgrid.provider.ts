import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { CacheManagerCommonComponent } from './cm.common';
import { Inject, Injector } from '@angular/core';
import { CacheManagerCommonService } from './cm.common.service';

export class CacheManagerCommonSlickGridProvider extends SlickGridProvider {
    public compContext: CacheManagerCommonComponent;

    constructor(@Inject(Injector) public injector: Injector, @Inject(CacheManagerCommonService) public ddService: CacheManagerCommonService) {
        super(injector);
    }

    deleteFromServer(data) {
        return this.ddService.delete(this.compContext.saveName, data.data);
    }
}
