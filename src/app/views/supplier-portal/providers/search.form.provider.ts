/**
 * Created by Ivan Banan on 07.11.2019.
 */
import { SearchFormProvider } from '../../../modules/search/form/providers/search.form.provider';
import { Inject, Injector } from '@angular/core';
import { SearchModel } from '../../../models/search/common/search';
import { AdvancedSearchModel } from '../../../models/search/common/advanced.search';
import { BaseSearchModel } from '../../../models/search/common/base.search';
import { Observable, Subscription } from 'rxjs';
import { AdvancedCriteriaType } from '../../../modules/search/advanced/types';
import { ServerGroupStorageService } from '../../../services/storage/server.group.storage.service';

export class SupplierPortalSearchFormProvider extends SearchFormProvider {
    constructor(@Inject(Injector) private injector: Injector) {
        super();
    }
}

