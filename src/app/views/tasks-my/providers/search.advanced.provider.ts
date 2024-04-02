/**
 * Created by Sergey Trizna on 15.03.2018.
 */
import { SearchAdvancedProvider } from "../../../modules/search/advanced/providers/search.advanced.provider";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { AdvancedModeTypes } from "../../../modules/search/advanced/types";


export class TasksMySearchAdvancedProvider extends SearchAdvancedProvider {
    constructor() {
        super();
    }
    getCustomModels(): AdvancedSearchModel[] {
        let models = [];
        let additionalModel = new AdvancedSearchModel();
        // Personal_tasks=true
        additionalModel.setDBField('personal_tasks');
        additionalModel.setField('Personal Tasks');
        additionalModel.setOperation('=');
        additionalModel.setValue(true);
        models.push(additionalModel);

        return models;
    }
}
