import { Injectable } from '@angular/core';
import { MisrCommonService } from '../../common/misr.common.service';

@Injectable()
export class MisrTemplatesService extends MisrCommonService {
    public path: string = 'config-table';
}
