import { Injectable } from '@angular/core';
import { SearchFormProvider } from 'app/modules/search/form/providers/search.form.provider';

@Injectable()
export class VersionSearchModalSearchFormProvider extends SearchFormProvider {
    isEnabledSearchButton(): boolean {
        return true
    }
}
