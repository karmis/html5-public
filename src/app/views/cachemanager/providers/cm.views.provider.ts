import {ViewsProvider} from "../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../modules/search/views/views.config";
import {ExpandContentFormatter} from "../../../modules/search/slick-grid/formatters/expand/expand.content.formatter";
import {ExpandControlFormatter} from "../../../modules/search/slick-grid/formatters/expand/expand.control.formatter";
import {RESTColumSetup, SlickGridColumn} from "../../../modules/search/slick-grid/types";
import {SettingsFormatter} from "../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import {DatetimeFormatter} from "../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";
import {CacheManagerStatusFormatter} from "../modules/status/cm-status";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";

export class CMViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        let columns = [];


        columns.unshift({
            isFrozen: false,
            id: -3,
            name: '',
            field: '*',
            width: 0.1,
            minWidth: 0.1,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: ExpandContentFormatter,
            headerCssClass: "disable-reorder hidden",
            cssClass: 'hidden',
            __isCustom: true,
            __text_id: 'expand-content',
            __deps: {
                injector: this.injector
            }
        });

        columns.unshift({
            isFrozen: false,
            id: -2,
            name: '',
            field: '*',
            width: 39,
            minWidth: 39,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: ExpandControlFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'expand-control',
            __deps: {
                injector: this.injector
            }
        });

        // columns.unshift({
        //     isFrozen: false,
        //     id: -8,
        //     name: '',
        //     field: '*',
        //     width: 1,
        //     minWidth: 1,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: EmptyFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'empty-control',
        //     __deps: {

        //
        //
        //         injector: this.injector
        //     }
        // });


        // settings
        columns.unshift({
            isFrozen: false,
            id: -1,
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


        // // settings
        // columns.unshift({
        //     isFrozen: false,
        //     id: -4,
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

        //
        //
        //         injector: this.injector
        //     }
        // });


        // });
        //


        return columns;
    }

    getFormatterByName(bindingName: string, col: RESTColumSetup, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            let bn = bindingName.toLowerCase();
            switch (bn) {
                // status
                case 'status_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 60,
                        multiColumnSort: false,
                        formatter: CacheManagerStatusFormatter,
                        // enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                case 'tx_time':
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
                    break;
                default:
                    break;
            }
        }

        return colDef;
    }
}
