import {SearchAdvancedProvider} from "../../../modules/search/advanced/providers/search.advanced.provider";
import {AdvancedSearchGroupRef} from "../../../modules/search/advanced/types";
import {Observable} from "rxjs";

export class CMSearchAdvancedProvider extends SearchAdvancedProvider {
    constructor() {
        super();
    }
    getStructure(): Observable<AdvancedSearchGroupRef[]> {
        let now = new Date();
        return new Observable((observer: any) => {
            // let data: Array<AdvancedSearchGroupRef> = [
            //     {
            //         id: 0,
            //         mode: 'builder',
            //         criterias: [
            //             {
            //                 selectedField: 'EVENT_ID',
            //                 selectedOperator: '=',
            //                 value: {value: '1'}
            //             },
            //         ]
            //     }
            // ];


            let data = [
                {
                    id: 0,
                    mode: 'builder',
                    criterias: [
                        {
                            "selectedField": "IS_READY",
                            "selectedOperator": "=",
                            "value": {"value": false}
                        },
                        {
                            "selectedField": "IS_MISSING",
                            "selectedOperator": "=",
                            "value": {"value": true}
                        },
                        {
                            "selectedField": "TX_TIME",
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
                                    'withTime': false
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
