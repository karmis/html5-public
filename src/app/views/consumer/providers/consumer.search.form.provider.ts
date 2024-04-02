/**
 * Created by Sergey Trizna on 24.10.2017.
 */
import { SearchFormProvider } from '../../../modules/search/form/providers/search.form.provider';
import { Injectable } from '@angular/core';

@Injectable()
export class ConsumerSearchFormProvider extends SearchFormProvider {
    constructor() {
        super();
    }
    /**
     * Is  enabled search button
     * @returns {boolean}
     */
    isEnabledSearchButton(): boolean {
        return !!this.getSearchString();
    }
}
