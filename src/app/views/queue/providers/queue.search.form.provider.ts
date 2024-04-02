/**
 * Created by Pavel on 16.03.2017.
 */
import { ChangeDetectorRef, Injectable, Injector } from '@angular/core';
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { SearchFormProvider } from "../../../modules/search/form/providers/search.form.provider";
import { SearchModel } from "../../../models/search/common/search";
import { BaseSearchModel } from "../../../models/search/common/base.search";
import { TasksMySearchAdvancedProvider } from '../../tasks-my/providers/search.advanced.provider';
import { SearchAdvancedProvider } from '../../../modules/search/advanced/providers/search.advanced.provider';
import { QueueSearchAdvancedProvider } from './queue.search.advanced.provider';

@Injectable()
export class QueueSearchFormProvider extends SearchFormProvider {
    constructor(private injector: Injector){
        super()
    }



    getModel(withTitle: boolean = true, withAdv: boolean = true): SearchModel {
        let searchModel = new SearchModel();
        if (withTitle) {
            let baseSearchModel = new BaseSearchModel();
            baseSearchModel.setValue(this.getSearchString());
            searchModel.setBase(baseSearchModel);
        }

        // get data from adv
        let advProv: QueueSearchAdvancedProvider = this.injector.get(QueueSearchAdvancedProvider);
        let advModels: AdvancedSearchModel[] = [];
        if (advProv && withAdv) {
            // if( this.config.componentContext.daysOffset > 0){
            //     advModels = advModels.concat(this.getCustomCriterias());
            // }

            advModels = advModels.concat(advProv.getCustomCriterias());
            if (advProv.getStateForPanel() === true) {
                advModels = advModels.concat(advProv.getModels());
            }
        }

        searchModel.setAdvanced(advModels);
        searchModel.setMode(advProv.getSearchMode());

        return searchModel;
    }

    getCustomCriterias() {
        let models = [];
        if (this.config.componentContext.daysOffset > 0) {
            let offset = new AdvancedSearchModel();
            offset.setDBField("CREATED_DT_offset");
            offset.setField("CREATED_DT_offset");
            offset.setOperation("=");
            offset.setGroupId(-1);
            offset.setValue(this.config.componentContext.daysOffset);
            models.push(offset);
        }

        return models;
    }

}
