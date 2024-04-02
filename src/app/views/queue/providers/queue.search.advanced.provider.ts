/**
 * Created by Pavel on 16.03.2017.
 */
import { Injectable } from '@angular/core';

import { SearchAdvancedProvider } from "../../../modules/search/advanced/providers/search.advanced.provider";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { QueueSearchParams } from "../model/queue.search.params";
import * as $ from "jquery";
import { AdvancedModeTypes } from '../../../modules/search/advanced/types';

@Injectable()
export class QueueSearchAdvancedProvider extends SearchAdvancedProvider {

    private customFields: QueueSearchParams = new QueueSearchParams();

    isOpenPanel(): boolean {
        let isOpenFilters = this.config.componentContext.isOpenQueueParams;
        let isOpenAdvSearch = this.getStateForPanel();
        return isOpenFilters || isOpenAdvSearch;
    }

    withAdvChecking(): boolean {
        let isOpen = this.isOpenPanel();
        if (!isOpen) {
            return false;
        }

        // Is any of advanced searching criteries active?
        let isExistAdvCrit = !!this.models.builder && !!this.models.builder[0];
        let isExistFacetsCrit = !!this.customFields.services.length || this.customFields.showError || this.customFields.showCompleted;

        return isExistAdvCrit || isExistFacetsCrit;
    }

    setCustomFields(f) {
        this.customFields = f;
    }

    getCustomCriterias() {
        let models = [];

        let actionModel = new AdvancedSearchModel();
        actionModel.setDBField("ACTION");
        actionModel.setField("ACTION");
        actionModel.setOperation("=");
        actionModel.setGroupId(-1);
        actionModel.setValue(this.customFields.services.map(el => el.id).join("|"));
        models.push(actionModel);

        let showCompleted = new AdvancedSearchModel();
        showCompleted.setDBField("SHOW_COMPLETED");
        showCompleted.setField("SHOW_COMPLETED");
        showCompleted.setOperation("=");
        showCompleted.setGroupId(-1);
        showCompleted.setValue(this.customFields.showCompleted + "|" + this.customFields.showError);
        models.push(showCompleted);

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
