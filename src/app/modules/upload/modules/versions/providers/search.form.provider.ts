/**
 * Created by Sergey Trizna on 14.10.2017.
 */
import {SearchFormProvider} from "../../../../search/form/providers/search.form.provider";
import {Injectable} from "@angular/core";

@Injectable()
export class VersionInsideUploadSearchFormProvider extends SearchFormProvider {
    isEnabledSearchButton(): boolean {
        return true
    }
}