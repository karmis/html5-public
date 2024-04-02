import {SearchModel, StringNameForSearchModel} from "./search";
import {AdvancedCriteriaListTypes} from "../../../modules/search/advanced/types";
import {AdvancedSearchModel} from "./advanced.search";


// TODO lekaving: SearchModel and consumer don't have any diff
export class ConsumerSearchModel extends SearchModel {
    constructor() {
        super();
    }

    /**
     * Prepare parametes of advacned search to request
     * @returns {Array}
     */
    advancedToRequest(type: StringNameForSearchModel): AdvancedCriteriaListTypes {
        let res = [];
        this.getAdvanced().forEach((adv: AdvancedSearchModel) => {
            if (adv.getValue() !== undefined && adv.getValue() !== '') {
                if(type && type.toLowerCase() === 'SearchModel'.toLowerCase()){
                    res.push(adv._toJSON());
                } else {
                    res.push(adv.toSimpleRequest());
                }

            }
        });

        return res;
    }
}
