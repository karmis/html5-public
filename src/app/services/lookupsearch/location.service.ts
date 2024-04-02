/**
 * Created by Sergey Trizna on 17.01.2017.
 */
import {Injectable} from "@angular/core";
import {HttpService} from "../http/http.service";
import {Observable} from "rxjs";
import {LocationsListLookupTypes} from "../../modules/search/location/types";
import {LookupSearchService} from "./common.service";

@Injectable()
export class LookupSearchLocationService {
    constructor(private httpService: HttpService,
                private lookupSearchService: LookupSearchService) {
    }

    /**
     * Returned list of users by params
     * @returns {any}
     */
    public getLocations(): Observable<LocationsListLookupTypes> {
        return new Observable((observer: any) => {
                this.lookupSearchService.getLookup('locations')
                    // .pipe(map((res:any) => res.body))
                    .subscribe(
                        (res: LocationsListLookupTypes) => {
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });

            }
        );
/*      return new Observable((observer: any) => {
            observer.next([
                {
                    "$id": "1",
                    "ID": 5.0,
                    "PAR_ID": 2.0,
                    "LOC_TYP": 1.0,
                    "NAM": "ACTON",
                    "Parent": null,
                    "Children": [
                        {
                            "$id": "2",
                            "ID": 10.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "ACCESS_COMMERCIAL",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": [
                                {
                                    "$id": "3",
                                    "ID": 656.0,
                                    "PAR_ID": 10.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "CINEMA",
                                    "Parent": {
                                        "$ref": "2"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "4",
                                    "ID": 655.0,
                                    "PAR_ID": 10.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "COLLECTION_REFERENCE",
                                    "Parent": {
                                        "$ref": "2"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "5",
                                    "ID": 63828.0,
                                    "PAR_ID": 10.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "DISTRIBUTION_SALES",
                                    "Parent": {
                                        "$ref": "2"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "6",
                                    "ID": 657.0,
                                    "PAR_ID": 10.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "LIBRARY",
                                    "Parent": {
                                        "$ref": "2"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "7",
                                    "ID": 658.0,
                                    "PAR_ID": 10.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "RESEARCH_PROGRAMS",
                                    "Parent": {
                                        "$ref": "2"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "8",
                                    "ID": 63825.0,
                                    "PAR_ID": 10.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "RIGHTS_MANAGEMENT",
                                    "Parent": {
                                        "$ref": "2"
                                    },
                                    "Children": []
                                }
                            ]
                        },
                        {
                            "$id": "9",
                            "ID": 634.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "ACTON_BASEMENT",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        },
                        {
                            "$id": "10",
                            "ID": 659.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "COLLECTION_STEWARDSHIP",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        },
                        {
                            "$id": "11",
                            "ID": 646.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "COMMUNICATIONS",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        },
                        {
                            "$id": "12",
                            "ID": 9.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "DATA_MANAGEMENT",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        },
                        {
                            "$id": "13",
                            "ID": 17.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "DOCUMENTS_ARTEFACTS",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        },
                        {
                            "$id": "14",
                            "ID": 695.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "ENGAGEMENT",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": [
                                {
                                    "$id": "15",
                                    "ID": 67930.0,
                                    "PAR_ID": 695.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "EXHIBITIONS",
                                    "Parent": {
                                        "$ref": "14"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "16",
                                    "ID": 696.0,
                                    "PAR_ID": 695.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "VISITOR_EXPERIENCE",
                                    "Parent": {
                                        "$ref": "14"
                                    },
                                    "Children": []
                                }
                            ]
                        },
                        {
                            "$id": "17",
                            "ID": 652.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "FILM",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        },
                        {
                            "$id": "18",
                            "ID": 15.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "INDIGENOUS_CONNECTIONS",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        },
                        {
                            "$id": "19",
                            "ID": 645.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "INFOCOMMS",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": [
                                {
                                    "$id": "20",
                                    "ID": 649.0,
                                    "PAR_ID": 645.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "COLLECTION_SYSTEMS",
                                    "Parent": {
                                        "$ref": "19"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "21",
                                    "ID": 67469.0,
                                    "PAR_ID": 645.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "I6000_QUANTUM_LIBRARY",
                                    "Parent": {
                                        "$ref": "19"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "22",
                                    "ID": 68062.0,
                                    "PAR_ID": 645.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "INFRASTRUCTURE_AND_STORAGE",
                                    "Parent": {
                                        "$ref": "19"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "23",
                                    "ID": 647.0,
                                    "PAR_ID": 645.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "QC_STANDARDS_&_BORN _DIGITAL",
                                    "Parent": {
                                        "$ref": "19"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "24",
                                    "ID": 648.0,
                                    "PAR_ID": 645.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "TECH_SERVICES",
                                    "Parent": {
                                        "$ref": "19"
                                    },
                                    "Children": []
                                }
                            ]
                        },
                        {
                            "$id": "25",
                            "ID": 8.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "PATS",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": [
                                {
                                    "$id": "26",
                                    "ID": 37.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "AUDIO_SERVICES",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "27",
                                    "ID": 34.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "AUDIO_VISUAL_CONSERVATION_LAB",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "28",
                                    "ID": 40.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "CONS_PREP_RESEARCH",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "29",
                                    "ID": 63845.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "DIG_TECH_ENGINEERING",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "30",
                                    "ID": 35.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "FILM_SERVICES",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": [
                                        {
                                            "$id": "31",
                                            "ID": 68526.0,
                                            "PAR_ID": 35.0,
                                            "LOC_TYP": 1.0,
                                            "NAM": "FAST_FORWARD_ROOM",
                                            "Parent": {
                                                "$ref": "30"
                                            },
                                            "Children": []
                                        }
                                    ]
                                },
                                {
                                    "$id": "32",
                                    "ID": 643.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "PAPER_CONSERVATION_LAB",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "33",
                                    "ID": 39.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "PAPER_STILLS",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": [
                                        {
                                            "$id": "34",
                                            "ID": 68033.0,
                                            "PAR_ID": 39.0,
                                            "LOC_TYP": 1.0,
                                            "NAM": "ACTON_5",
                                            "Parent": {
                                                "$ref": "33"
                                            },
                                            "Children": []
                                        }
                                    ]
                                },
                                {
                                    "$id": "35",
                                    "ID": 644.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "THEATRE",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": []
                                },
                                {
                                    "$id": "36",
                                    "ID": 36.0,
                                    "PAR_ID": 8.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "VIDEO_SERVICES",
                                    "Parent": {
                                        "$ref": "25"
                                    },
                                    "Children": [
                                        {
                                            "$id": "37",
                                            "ID": 68767.0,
                                            "PAR_ID": 36.0,
                                            "LOC_TYP": 1.0,
                                            "NAM": "CINEWORLD",
                                            "Parent": {
                                                "$ref": "36"
                                            },
                                            "Children": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "$id": "38",
                            "ID": 653.0,
                            "PAR_ID": 5.0,
                            "LOC_TYP": 1.0,
                            "NAM": "SOUND_BROADCASTING",
                            "Parent": {
                                "$ref": "1"
                            },
                            "Children": []
                        }
                    ]
                },
                {
                    "$id": "39",
                    "ID": 64267.0,
                    "PAR_ID": 0.0,
                    "LOC_TYP": 0.0,
                    "NAM": "COMPLETED_ACQUISITION_CONTAINERS_ONLY",
                    "Parent": null,
                    "Children": []
                },
                {
                    "$id": "40",
                    "ID": 66465.0,
                    "PAR_ID": 0.0,
                    "LOC_TYP": 0.0,
                    "NAM": "DE-ACCESSIONED_ITEMS",
                    "Parent": null,
                    "Children": []
                },
                {
                    "$id": "41",
                    "ID": 66705.0,
                    "PAR_ID": 0.0,
                    "LOC_TYP": 0.0,
                    "NAM": "ITEMS_UNDER_INVESTIGATION",
                    "Parent": null,
                    "Children": []
                },
                {
                    "$id": "42",
                    "ID": 636.0,
                    "PAR_ID": 7.0,
                    "LOC_TYP": 1.0,
                    "NAM": "MELBOURNE",
                    "Parent": null,
                    "Children": [
                        {
                            "$id": "43",
                            "ID": 30927.0,
                            "PAR_ID": 636.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MELBOURNE_STATE_OFFICE",
                            "Parent": {
                                "$ref": "42"
                            },
                            "Children": []
                        }
                    ]
                },
                {
                    "$id": "44",
                    "ID": 4.0,
                    "PAR_ID": 2.0,
                    "LOC_TYP": 1.0,
                    "NAM": "MITCHELL",
                    "Parent": null,
                    "Children": [
                        {
                            "$id": "45",
                            "ID": 42258.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "COLLECTION_MANAGEMENT",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": [
                                {
                                    "$id": "46",
                                    "ID": 68094.0,
                                    "PAR_ID": 42258.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "READY FOR EXTERNAL DESPATCH",
                                    "Parent": {
                                        "$ref": "45"
                                    },
                                    "Children": []
                                }
                            ]
                        },
                        {
                            "$id": "47",
                            "ID": 630.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MITCHELL_ANNEXE",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": []
                        },
                        {
                            "$id": "48",
                            "ID": 51885.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MITCHELL_FIVE",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": []
                        },
                        {
                            "$id": "49",
                            "ID": 628.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MITCHELL_FOUR",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": []
                        },
                        {
                            "$id": "50",
                            "ID": 629.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MITCHELL_NITRATE",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": []
                        },
                        {
                            "$id": "51",
                            "ID": 6.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MITCHELL_ONE",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": [
                                {
                                    "$id": "52",
                                    "ID": 68890.0,
                                    "PAR_ID": 6.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "CLIENT_AREA",
                                    "Parent": {
                                        "$ref": "51"
                                    },
                                    "Children": []
                                }
                            ]
                        },
                        {
                            "$id": "53",
                            "ID": 627.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MITCHELL_TWO",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": []
                        },
                        {
                            "$id": "54",
                            "ID": 631.0,
                            "PAR_ID": 4.0,
                            "LOC_TYP": 1.0,
                            "NAM": "MITCHELL_WAREHOUSE",
                            "Parent": {
                                "$ref": "44"
                            },
                            "Children": []
                        }
                    ]
                },
                {
                    "$id": "55",
                    "ID": 3.0,
                    "PAR_ID": 0.0,
                    "LOC_TYP": 0.0,
                    "NAM": "NEW_SOUTH_WALES",
                    "Parent": null,
                    "Children": [
                        {
                            "$id": "56",
                            "ID": 624.0,
                            "PAR_ID": 3.0,
                            "LOC_TYP": 1.0,
                            "NAM": "SYDNEY",
                            "Parent": {
                                "$ref": "55"
                            },
                            "Children": [
                                {
                                    "$id": "57",
                                    "ID": 640.0,
                                    "PAR_ID": 624.0,
                                    "LOC_TYP": 1.0,
                                    "NAM": "SYDNEY_STATE_OFFICE",
                                    "Parent": {
                                        "$ref": "56"
                                    },
                                    "Children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "$id": "58",
                    "ID": 637.0,
                    "PAR_ID": 2.0,
                    "LOC_TYP": 1.0,
                    "NAM": "PARKES",
                    "Parent": null,
                    "Children": [
                        {
                            "$id": "59",
                            "ID": 639.0,
                            "PAR_ID": 637.0,
                            "LOC_TYP": 1.0,
                            "NAM": "NLA",
                            "Parent": {
                                "$ref": "58"
                            },
                            "Children": []
                        }
                    ]
                }
            ]);
        }) */
    }

    public getUrl() {
        return this.lookupSearchService.getLookupUrl('locations');
    }
}
