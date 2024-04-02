import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { SettingsFormatter } from '../../../../slick-grid/formatters/settings/settings.formatter';
import { TreeFormatter } from '../../../../slick-grid/formatters/tree/tree.formatter';
import { ProductionStatusFormatter } from '../../../../slick-grid/formatters/production-status/production-status';
import { CheckBoxFormatter } from '../../../../slick-grid/formatters/checkBox/checkbox.formatter';
import { Select2Formatter } from '../../../../slick-grid/formatters/select2/select2.formatter';
import { forkJoin, Observable } from 'rxjs';
import { LookupService } from '../../../../../../services/lookup/lookup.service';
import { ProductionMediaTypeFormatter } from "../../../../slick-grid/formatters/production-media-type/production-media-type";
import { DatetimeFormatter } from "../../../../slick-grid/formatters/datetime/datetime.formatter";
import { ProductionMultiSelectFormatter } from '../../../../slick-grid/formatters/production-multiselect/production-multiselect';

@Injectable()
export class ProductionListTabViewsProvider {
    lookup: LookupService;
    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";

    constructor(@Inject(Injector) public injector: Injector) {
        this.lookup = this.injector.get(LookupService)
    }

    getCustomColumnsProdTab() {
        let columns: any[] = [
            {
                id: 1,
                name: 'ID',
                field: 'ID',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Make',
                field: 'MAKE',
                // width: 150,
                resizable: true,
                sortable: false,
                isFrozen: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Version Name',
                field: 'VERSION_NAME',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 4,
                name: 'Version ID',
                field: 'VERSION_ID',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 5,
                name: 'PGM Status',
                field: 'PGM_STATUS',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 6,
                name: 'Compliance',
                field: 'COMPLIANCE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 7,
                name: 'Assistant',
                field: 'ASSISTANT',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 8,
                name: 'Next TX Date',
                field: 'NEXT_TX_Date',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            },
            {
                id: 9,
                name: 'Due Date',
                field: 'DUE_DATE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            },
            {
                id: 10,
                name: 'Status',
                field: 'STATUS_TEXT',
                formatter: ProductionStatusFormatter,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 11,
                name: 'Sub',
                field: 'SUB',
                formatter: CheckBoxFormatter,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                __deps: {
                    injector: this.injector,
                    data: {
                        isProduction: true
                    }
                }
            }
        ];

        columns.unshift({
            isFrozen: true,
            id: -6,
            name: '',
            field: '*',
            width: 50,
            minWidth: 50,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: SettingsFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'settings',
            __deps: {
                injector: this.injector
            }
        });


        return columns;
    }

    getCustomColumnsMultiLinesEvents() {
        let columns: any[] = [
            {
                id: 1,
                name: 'ID',
                field: 'ID',
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Make',
                field: 'MAKE',
                resizable: true,
                sortable: false,
                isFrozen: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Version Name',
                field: 'VERSION_NAME',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 4,
                name: 'Version ID',
                field: 'VERSION_ID',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 5,
                name: 'Owner',
                field: 'OWNER',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 6,
                name: 'Compliance',
                field: 'COMPLIANCE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 7,
                name: 'Assistant',
                field: 'ASSISTANT',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 8,
                name: 'Next TX Date',
                field: 'NEXT_TX_DATE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            },
            {
                id: 9,
                name: 'Event Start',
                field: 'EVENT_START',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            },
            {
                id: 10,
                name: 'Status',
                field: 'STATUS_TEXT',
                formatter: ProductionStatusFormatter,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 12,
                name: 'Type',
                field: 'TYPE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 13,
                name: 'Event ID',
                field: 'EVENT_ID',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 14,
                name: 'Event Status',
                field: 'EVENT_STATUS',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            }
        ];

        columns.unshift({
            isFrozen: true,
            id: -6,
            name: '',
            field: '*',
            width: 50,
            minWidth: 50,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: SettingsFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'settings',
            __deps: {
                injector: this.injector
            }
        });


        return columns;
    }

    getCustomColumnsTreeTab() {
        let columns: any[] = [
            {
                id: -3,
                name: '',
                field: '*',
                width: 30,
                isFrozen: true,
                resizable: false,
                __isCustom: true,
                __text_id: 'tree',
                sortable: false,
                multiColumnSort: false,
                formatter: TreeFormatter,
                enableColumnReorder: false,
                headerCssClass: "disable-reorder",
                __deps: {
                    injector: this.injector,
                    data: {
                        signColumn: 'Title_Type',
                        colorFilling: true
                    }
                }
            },
            // {
            //     isFrozen: true,
            //     id: -2,
            //     name: '',
            //     field: '*',
            //     width: 50,
            //     minWidth: 50,
            //     resizable: false,
            //     sortable: false,
            //     multiColumnSort: false,
            //     formatter: SettingsFormatter,
            //     headerCssClass: "disable-reorder",
            //     __isCustom: true,
            //     __text_id: 'settings',
            //     __deps: {
            //         injector: this.injector
            //     }
            // },
            {
                id: 1,
                name: 'Title',
                field: 'TITLE',
                // width: 150,
                resizable: true,
                sortable: false,
                isFrozen: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'ID',
                field: 'ID',
                // width: 150,
                resizable: true,
                sortable: false,
                isFrozen: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Duration',
                field: 'DURATION',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 4,
                name: 'Status',
                field: 'STATUS_TEXT',
                formatter: ProductionStatusFormatter,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 5,
                name: 'Type',
                field: 'TYPE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 6,
                name: 'Media File Type',
                field: 'MEDIA_FILE_TYPE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                formatter: ProductionMediaTypeFormatter,
                __deps: {
                    injector: this.injector
                }
            },
            {
                id: 7,
                name: 'House Number',
                field: 'HOUSE_NUMBER',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 8,
                name: 'Compliance',
                field: 'COMPLIANCE',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 9,
                name: 'Assistant',
                field: 'ASSISTANT',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
            },
            {
                id: 10,
                name: '',
                field: 'MULTI',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: false,
                isCustom: true,
                formatter: ProductionMultiSelectFormatter,
                __deps: {
                    injector: this.injector
                }
            }
        ];


        return columns;
    }

    getCustomColumnsMadeItems(): Observable<any[]> {
        return new Observable((obs) => {

            forkJoin([
                this.lookup.getLookups('AgeCertification'),
            ]).subscribe((data) => {
                const ageData = {
                    values: data[0],
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('AgeCertification'),
                    validationEnabled: true
                };

                let columns: any[] = [
                    {
                        id: 1,
                        name: 'ID',
                        field: 'ID',
                        // width: 150,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false
                    },
                    {
                        id: 2,
                        name: 'Status',
                        field: 'StatusText',
                        formatter: ProductionStatusFormatter,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                        isCustom: true,
                        __deps: {
                            injector: this.injector
                        }
                    },
                    {
                        id: 3,
                        name: 'Media ID1',
                        field: 'MIID1',
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                    },
                    {
                        id: 4,
                        name: 'Item Type',
                        field: 'ITEM_TYPE_text',
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                    },
                    {
                        id: 5,
                        name: 'Filename/Barcode',
                        field: 'FILENAME',
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                    },
                    {
                        id: 6,
                        name: 'Cert',
                        field: 'AGE_CERTIFICATION',
                        selectName: 'AGE_CERTIFICATION',
                        width: 100,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                        formatter: Select2Formatter,
                        __deps: {
                            injector: this.injector,
                            data: ageData
                        }
                    }
                ];
                obs.next(columns);
                obs.complete();
            })
        })
    }
}
