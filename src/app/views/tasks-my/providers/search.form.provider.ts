/**
 * Created by Sergey Trizna on 15.03.2018.
 */
import { SearchFormProvider } from "../../../modules/search/form/providers/search.form.provider";
import { Injectable, Injector } from "@angular/core";
import { SearchModel } from "../../../models/search/common/search";
import { BaseSearchModel } from "../../../models/search/common/base.search";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { SearchAdvancedProvider } from "../../../modules/search/advanced/providers/search.advanced.provider";
import { TasksMySearchAdvancedProvider } from './search.advanced.provider';


@Injectable()
export class TasksMySearchFormProvider extends SearchFormProvider {
    public showCompleted: boolean = false;
    public hideFailed: boolean = true;

    constructor(private injector: Injector) {
        super();
    }

    getModel(withTitle: boolean = true, withAdv: boolean = true): SearchModel {
        let searchModel = new SearchModel();
        if (withTitle) {
            let baseSearchModel = new BaseSearchModel();
            baseSearchModel.setValue(this.getSearchString());
            searchModel.setBase(baseSearchModel);
        }

        // get data from adv
        let advProv: TasksMySearchAdvancedProvider = this.injector.get(SearchAdvancedProvider);
        let advModels: AdvancedSearchModel[] = [];
        if (advProv && withAdv ) {
            advModels = advModels.concat(this.getCustomCriterias());
            advModels = advModels.concat(advProv.getCustomModels());
            if (advProv.getStateForPanel() === true) {
                advModels = advModels.concat(advProv.getModels());
            }
        }

        searchModel.setAdvanced(advModels);
        searchModel.setMode(advProv.getSearchMode());

        return searchModel;
    }


    getCustomCriterias(): AdvancedSearchModel[] {
        let models = [];
        if (this.showCompleted) {
            let showCompleted = new AdvancedSearchModel();
            showCompleted.setDBField("SHOW_COMPLETED");
            showCompleted.setField("Show Completed");
            showCompleted.setOperation("=");
            showCompleted.setGroupId(undefined);
            showCompleted.setValue(true);
            models.push(showCompleted);
        }

        if (this.hideFailed) {
            let hideFailed = new AdvancedSearchModel();
            hideFailed.setDBField("J_FAILURE_RESOLVED");
            hideFailed.setField("Hide Resolved");
            hideFailed.setOperation("=");
            hideFailed.setGroupId(undefined);
            hideFailed.setValue(false);
            hideFailed.setHumanValue(true); // wow
            models.push(hideFailed);
        }

        return models;
    }

    changeJobFilterFailed(state: boolean) {
        this.hideFailed = !state;
        this.submit();
    }

    changeJobFilterCompleted(state: boolean) {
        this.showCompleted = !state;
        this.submit();
    }

}
