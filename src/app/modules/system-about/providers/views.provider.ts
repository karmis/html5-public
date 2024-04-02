/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import { ViewsProvider } from "../../search/views/providers/views.provider";
import { ViewsConfig } from "../../search/views/views.config";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { TreeFormatter } from "../../search/slick-grid/formatters/tree/tree.formatter";
import { RESTColumSetup, SlickGridColumn } from "../../search/slick-grid/types";
import { CustomStatusFormatter } from "../../search/slick-grid/formatters/custom-status/custom.status.formatter";
import { StatusFormatter } from "../../search/slick-grid/formatters/status/status.formatter";
import { DatetimeFormatter } from "../../search/slick-grid/formatters/datetime/datetime.formatter";


export class SystemAboutViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    /**versiove
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        let columns = [];

        columns.push({
            id: -3,
            name: '',
            field: '*',
            width: 150,
            isFrozen: false,
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
        });

        return columns;
    }

    getFormatterByName(bindingName: string, col: RESTColumSetup, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            let bn = bindingName.toLowerCase();
            let fieldName;
            if (bn.indexOf('dynamic.customversionstatus') > -1 || bindingName.startsWith('xml|')) {
                bn = 'customstatuses';
                if (bindingName.startsWith('xml|'))
                    fieldName = bindingName;
            }
            switch (bn) {
                case 'customstatuses':
                    colDef = $.extend(true, {}, colDef, {
                        field: fieldName ? fieldName : "Custom Statuses",
                        isFrozen: false,
                        formatter: CustomStatusFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                column_name: bindingName
                            }
                        }
                    });
                    break;
                // Loc status
                case 'status_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 60,
                        formatter: StatusFormatter,
                        enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                default:
                    break;
            }
            if (bn == 'g' /*bn == 'created_dt' ||  bn == 'abs_deleted_dt' ||  bn == 'bfc_cla_dt' ||  bn == 'modified_dt'*/) {
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
