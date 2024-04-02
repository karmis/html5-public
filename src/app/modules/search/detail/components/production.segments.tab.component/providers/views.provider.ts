import { ViewsConfig } from "../../../../views/views.config";
import { Observable } from "rxjs";
import { LookupService } from "../../../../../../services/lookup/lookup.service";
import { HiddenContentFormatter } from "../../../../slick-grid/formatters/hidden-content/hidden.content.formatter";
import { Select2Formatter } from "../../../../slick-grid/formatters/select2/select2.formatter";
import { TimecodeInputFormatter } from "../../../../slick-grid/formatters/timecode-input/timecode.input.formatter";
import { TextFormatter } from "../../../../slick-grid/formatters/text/text.formatter";
import { DeleteFormatter } from "../../../../slick-grid/formatters/delete/delete.formatter";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { ViewsProvider } from "../../../../views/providers/views.provider";
import { CheckBoxFormatter } from 'app/modules/search/slick-grid/formatters/checkBox/checkbox.formatter';

export class SegmentsViewsProvider extends ViewsProvider {
    config: ViewsConfig;
    lookup: LookupService;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
        this.lookup = this.injector.get(LookupService)
    }

    getColumns(): Observable<any[]> {
        return new Observable(obs => {
            this.lookup.getLookups('SegmentTypes')
                .subscribe((resp) => {
                    const selectTypeData = {
                        values: resp,
                        rule: this.lookup.getLookupRuleForConvertToSelect2Item('SegmentTypes'),
                        validationEnabled: false
                    };

                    const col = [
                        {
                            id: 1,
                            name: 'Part#',
                            field: 'PRT_NUM',
                            minWidth: 50,
                            width: 50,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false,
                            formatter: HiddenContentFormatter,
                            __deps: {
                                injector: this.injector,
                                data: []
                            }
                        },
                        {
                            id: 2,
                            name: 'Seq#',
                            field: 'SQ_NUM',
                            minWidth: 50,
                            width: 50,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false
                        },
                        {
                            id: 3,
                            name: 'Type',
                            field: 'SEG_TYPE',
                            minWidth: 300,
                            width: 300,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false,
                            formatter: Select2Formatter,
                            __deps: {
                                injector: this.injector,
                                data: selectTypeData
                            }
                        },
                        {
                            id: 4,
                            name: 'TX',
                            field: 'TxPart',
                            minWidth: 35,
                            width: 35,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false,
                            formatter: CheckBoxFormatter,
                            __deps: {
                                injector: this.injector,
                                data: {
                                    enabled: false,
                                    // enabledList: []
                                }
                            }
                        },
                        {
                            id: 5,
                            name: 'In',
                            field: 'SOMS',
                            minWidth: 100,
                            width: 100,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false,
                            formatter: TimecodeInputFormatter,
                            __deps: {
                                injector: this.injector,
                                data: [],
                                isDisplayArrow: false,
                                isDisabledTooltip: true
                            }
                        },
                        {
                            id: 6,
                            name: 'Out',
                            field: 'EOMS',
                            minWidth: 100,
                            width: 100,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false,
                            formatter: TimecodeInputFormatter,
                            __deps: {
                                injector: this.injector,
                                data: [],
                                isDisplayArrow: false,
                                isDisabledTooltip: true
                            }
                        },
                        {
                            id: 7,
                            name: 'Duration',
                            field: 'Duration_text',
                            minWidth: 100,
                            width: 100,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false,
                            cssClass: 'like-input-font'
                        },
                        {
                            id: 8,
                            name: 'Title',
                            field: 'PRT_TTL',
                            minWidth: 300,
                            width: 300,
                            resizable: true,
                            sortable: false,
                            multiColumnSort: false,
                            formatter: TextFormatter,
                            __deps: {
                                injector: this.injector,
                                data: {
                                    validationEnabled: false
                                }
                            }
                        },
                        {
                            id: 9,
                            field: 'Delete',
                            name: '',
                            width: 40,
                            resizable: false,
                            sortable: false,
                            multiColumnSort: false,
                            formatter: DeleteFormatter,
                            __deps: {
                                injector: this.injector
                            }
                        }
                    ]

                    obs.next(col);
                    obs.complete();
                },
                    error => obs.error);
        });
    }
}
