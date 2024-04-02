import { SearchAdvancedProvider } from "../../../modules/search/advanced/providers/search.advanced.provider";
import { AdvancedSearchGroupRef } from "../../../modules/search/advanced/types";
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class MisrSearchAdvancedProvider extends SearchAdvancedProvider {
    getStructure(): Observable<AdvancedSearchGroupRef[]> {
        let now = new Date();
        let utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(),
            now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        return new Observable((observer: any) => {
            let data = [{
                "id": "0",
                "mode": "builder",
                "criterias": [{
                    "selectedField": "CH_CODE",
                    "selectedOperator": "=",
                    "value": {"value": "", "humanValue": ""}
                }, {
                    "selectedField": "IS_READY_PROB",
                    "selectedOperator": "=",
                    "value": {"value": "0", "humanValue": "Only Problem"}
                }, {
                    "selectedField": "TM_TX_DT",
                    "selectedOperator": ">=",
                    "value": {
                        "dirtyValue": {
                            "value": now,
                            "mode": {
                                "abs": true,
                                "intervalType": "d"
                            }
                        },
                        "options": {
                            'abs': true,
                            'withTime': true
                        }
                    }
                }, {
                    "selectedField": "SUPPRESS_REP",
                    "selectedOperator": "=",
                    "value": {"value": "0", "humanValue": "Show All"}
                }, {
                    "selectedField": "LONGSHORT_FORM",
                    "selectedOperator": "=",
                    "value": {"value": "2", "humanValue": "Show All"}
                }]
            }];

            observer.next(data);
            observer.complete();
        });
    }
}
