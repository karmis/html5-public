/**
 * Created by Sergey Trizna on 03.04.2018.
 */
import { SearchFormProvider } from '../../../../../modules/search/form/providers/search.form.provider';
import { AdvancedSearchModel } from '../../../../../models/search/common/advanced.search';
import { SearchModel } from '../../../../../models/search/common/search';
import { BaseSearchModel } from '../../../../../models/search/common/base.search';
import { Inject, Injector } from '@angular/core';
import { ServerStorageService } from '../../../../../services/storage/server.storage.service';
import { Observable, Subscription } from 'rxjs';

export class MediaInsideMappingSearchFormProvider extends SearchFormProvider {
    private loadningHandler: Observable<Subscription>;

    constructor(@Inject(Injector) private injector: Injector) {
        super();
    }

    isEnabledSearchButton(): boolean {
        return true;
    }

    getModel(withTitle: boolean = true, withAdv: boolean = true): SearchModel {
        let searchModel = new SearchModel();
        if (withTitle) {
            let baseSearchModel = new BaseSearchModel();
            baseSearchModel.setValue(this.getSearchString());
            searchModel.setBase(baseSearchModel);
        }

        let advModel = new AdvancedSearchModel();
        advModel.setDBField('pgm_parent_id');
        advModel.setField('pgm_parent_id');
        advModel.setOperation('=');
        advModel.setValue(0);
        searchModel.setAdvanced([advModel]);

        return searchModel;
    }

}

