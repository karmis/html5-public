import { Injectable } from '@angular/core';
import { CacheManagerAvailableTypes, CacheManagerCommonService } from '../../cachemanager/common/cm.common.service';


@Injectable()
export class MisrCommonService extends CacheManagerCommonService {
    public path: string = 'config-table';
}
