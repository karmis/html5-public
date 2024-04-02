import { SlickGridProvider } from '../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { Injectable } from '@angular/core';

@Injectable()
export class CacheManagerChannelTemplatesSlickGridProvider extends SlickGridProvider {
    // for delete formatter
    isDisabledDelete(params): boolean {
        return false;
    }
}
