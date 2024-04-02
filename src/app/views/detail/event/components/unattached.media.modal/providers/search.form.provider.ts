import { Injectable } from '@angular/core';
import { SearchFormProvider } from 'app/modules/search/form/providers/search.form.provider';
import {UnattachedMediaSearchModalComponent} from "../unattached.media.modal.component";
import {SearchModel} from "../../../../../../models/search/common/search";
import {BaseSearchModel} from "../../../../../../models/search/common/base.search";
import {AdvancedSearchModel} from "../../../../../../models/search/common/advanced.search";

@Injectable()
export class UnattachedMediaSearchModalSearchFormProvider extends SearchFormProvider {
    isEnabledSearchButton(): boolean {
        return true
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
