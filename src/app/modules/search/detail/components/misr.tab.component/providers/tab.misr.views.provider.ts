import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {MisrViewsProvider} from "../../../../../../views/misr/providers/views.provider";
import {RESTColumSetup, SlickGridColumn} from "../../../../slick-grid/types";
import {StatusFormatter} from "../../../../slick-grid/formatters/status/status.formatter";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";

export class TabMisrViewsProvider extends MisrViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumns() {
        // let columns = [];

        return [];
    }

    getFormatterByName(bindingName: string, col: RESTColumSetup, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            let bn = bindingName.toLowerCase();
            console.log('misr-in-detail', bn);
            switch (bn) {
                // status
                case 'misr_status_text':
                    colDef = $.extend(true, {}, colDef, {
                        minWidth: 60,
                        formatter: StatusFormatter,
                        // enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                default:
                    break;
            }
            if ( bindingName == 'MISR_DT' ||  bindingName == 'MODIFIED' ||  bindingName == 'CREATED') {
                colDef = $.extend(true, {}, colDef, {
                    isFrozen: false,
                    minWidth: 60,
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
}
