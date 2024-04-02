import { Injectable } from '@angular/core';
import { MisrCommonService } from '../../common/misr.common.service';

@Injectable()
export class MisrAudioService extends MisrCommonService {
    public path: string = 'config';
}
