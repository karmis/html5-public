import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from "@angular/core";

import { ViewsProvider } from '../../../../../modules/search/views/providers/views.provider';
import { ViewsConfig } from '../../../../../modules/search/views/views.config';
import { SlickGridColumn } from '../../../../../modules/search/slick-grid/types';
import { CheckBoxFormatter } from '../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import { SettingsFormatter } from '../../../../../modules/search/slick-grid/formatters/settings/settings.formatter';
import { ProductionStatusFormatter } from '../../../../../modules/search/slick-grid/formatters/production-status/production-status';
import $ from "jquery";
import {DatetimeFormatter} from "../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";

@Injectable()
export class ProductionManagerViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumns() {
        let columns = [];
        // settings
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

    getFormatterByName(bindingName, col, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            switch (bindingName) {
                // Loc status
                case 'StatusText':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 80,
                        formatter: ProductionStatusFormatter,
                        enableColumnReorder: true,
                        __text_id: 'STATUS',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                case 'NeedSubs':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        // minWidth: 60,
                        formatter: CheckBoxFormatter,
                        enableColumnReorder: true,
                        __deps: {
                            injector: this.injector,
                            data: {
                                messageTrue: '',
                                messageFalse: ''
                            }
                        }
                    });
                    break;
                default:
                    break;
            }
            // Date
            if (bindingName == "ProductionCreated" || bindingName == "Production.ON_AIR" || bindingName == "Production.OFF_AIR" || bindingName == "Production.CREATED" || bindingName == "Programm.N_TX_DT") {
                // not sure MI_CHECKSUM_DT, MI_DELETED_DT, RETURN_DATE, TX_DATE, WIPE_DT
                colDef = $.extend(true, {}, colDef, {
                    isFrozen: false,
                    minWidth: 60,
                    resizable: true,
                    formatter: DatetimeFormatter,
                    enableColumnReorder: true,
                    __deps: {
                        injector: this.injector,
                        datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                    }
                });
            }
        }

        return colDef;
    }
    getFormatterByFormat(bindingFormat, col, colDef: any): any {
        if (bindingFormat) {
            const b = bindingFormat.toLowerCase()
            switch (b) {
                // Date
                case 'g':
                case 'ProductionCreated':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 60,
                        resizable: true,
                        formatter: DatetimeFormatter,
                        enableColumnReorder: true,
                        __deps: {
                            injector: this.injector,
                            datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                        }
                    });
                    break;
                default:
                    break;
            }
        }

        return colDef;
    }
}
