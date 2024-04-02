import {SearchAdvancedProvider} from "../../../modules/search/advanced/providers/search.advanced.provider";
import {AdvancedSearchGroupRef} from "../../../modules/search/advanced/types";
import {Observable} from "rxjs";

export class EventManagerSearchAdvancedProvider extends SearchAdvancedProvider {
    constructor() {
        super();
    }
    getStructure(): Observable<AdvancedSearchGroupRef[]> {
        let now = new Date();
        return new Observable((observer: any) => {
            let data = [
                {
                    id: 0,
                    mode: 'builder',
                    criterias: [
                        {
                            "selectedField": "STATUS",
                            "selectedOperator": "!=",
                            "value": {"value": 4}
                        },
                        {
                            "selectedField": "START_DATETIME",
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
                        }
                    ]
                }
            ];

            observer.next(data);
            observer.complete();
        });
    }
}
