import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import {AdvancedSearchGroupRef} from "../../../../../modules/search/advanced/types";
import {SearchAdvancedProvider} from "../../../../../modules/search/advanced/providers/search.advanced.provider";

@Injectable()
export class ProductionManagerSearchAdvancedProvider extends SearchAdvancedProvider {
    getStructure(): Observable<AdvancedSearchGroupRef[]> {
        let now = new Date();
        let utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(),
            now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        return new Observable((observer: any) => {
            let data = [{
                "id": "0",
                "mode": "builder",
                "criterias": [{
                    "selectedField": "StatusText",
                    "selectedOperator": "!=",
                    "value": {"value": "9|8", "humanValue": "Completed|Rejected"}
                }]
            }];

            observer.next(data);
            observer.complete();
        });
    }
}
