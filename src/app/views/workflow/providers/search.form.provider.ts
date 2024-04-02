/**
 * Created by Sergey Trizna on 22.03.2018.
 */
import {SearchFormProvider} from "../../../modules/search/form/providers/search.form.provider";
import {ChangeDetectorRef, Injectable, Injector} from "@angular/core";
import {SearchAdvancedProvider} from "../../../modules/search/advanced/providers/search.advanced.provider";
import {TasksUsersProvider} from "../comps/users/providers/users.provider";
import {SearchModel} from "../../../models/search/common/search";
import {BaseSearchModel} from "../../../models/search/common/base.search";
import {AdvancedSearchModel} from "../../../models/search/common/advanced.search";

@Injectable()
export class WorkflowSearchFormProvider extends SearchFormProvider{
    public showCompleted: boolean = false;
    public hideFailed: boolean = true;
    constructor(private injector: Injector, private cdr: ChangeDetectorRef){
        super()
    }
    /**
     * Is  enabled search button
     * @returns {boolean}
     */
    // isEnabledSearchButton(): boolean {
    //     let res: boolean = true;
    //     let sac = this.injector.get(SearchAdvancedProvider);
    //
    //     if (sac) {
    //         // throw new Error('this.config.moduleContext.config.componentContext.searchAdvancedConfig is not available')
    //         res = sac.isValidStructure();
    //     }
    //
    //     if(!res) {
    //         let tup = this.injector.get(TasksUsersProvider);
    //         if(tup.selectedNodes.length > 0){
    //             res = true;
    //         }
    //     }
    //
    //     // debugger
    //     // setTimeout(() => {
    //     //     this.cdr.markForCheck();
    //     // });
    //
    //     return res;
    // }

    getModel(withTitle: boolean = true, withAdv: boolean = true): SearchModel {
        let searchModel = new SearchModel();
        if (withTitle) {
            let baseSearchModel = new BaseSearchModel();
            baseSearchModel.setValue(this.getSearchString());
            searchModel.setBase(baseSearchModel);
        }

        // get data from adv
        let advProv: SearchAdvancedProvider = this.injector.get(SearchAdvancedProvider);
        let advModels: AdvancedSearchModel[] = [];
        if (advProv && withAdv) {
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

    getCustomCriterias() {
        let models = [];

        if(this.showCompleted){
            let showCompleted = new AdvancedSearchModel();
            showCompleted.setDBField("SHOW_COMPLETED");
            showCompleted.setField("Show Completed");
            showCompleted.setOperation("=");
            showCompleted.setGroupId(undefined);
            showCompleted.setValue(true);
            models.push(showCompleted);
        }

        if(this.hideFailed){
            let hideFailed = new AdvancedSearchModel();
            hideFailed.setDBField("HIDE_FAILED");
            hideFailed.setField("Hide Resolved");
            hideFailed.setOperation("=");
            hideFailed.setGroupId(undefined);
            hideFailed.setValue(true);
            models.push(hideFailed);
        }

        return models;
    }

    changeJobFilterFailed(state: boolean){
        this.hideFailed = !state;
        this.submit();
    }

    changeJobFilterCompleted(state: boolean){
        this.showCompleted = !state;
        this.submit();
    }
}
