import { Injectable } from '@angular/core';
import { SearchFormProvider } from 'app/modules/search/form/providers/search.form.provider';
import {SearchModel} from "../../../../../../models/search/common/search";
import {BaseSearchModel} from "../../../../../../models/search/common/base.search";
import {AdvancedSearchModel} from "../../../../../../models/search/common/advanced.search";
import {TitlesSearchModalComponent} from "../titles.modal.component";

@Injectable()
export class TitlesSearchModalSearchFormProvider extends SearchFormProvider {
    isEnabledSearchButton(): boolean {
        return true
    }
}
