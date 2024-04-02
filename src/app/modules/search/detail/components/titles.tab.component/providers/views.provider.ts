import {TitlesViewsProvider} from "../../../../../../views/titles/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";

export class DetailTitlesTabViewsProvider extends TitlesViewsProvider {
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
    // getCustomColumns() {
    //     let columns = [];
    //
    //     columns.push({
    //         id: -3,
    //         name: '',
    //         field: '*',
    //         width: 80,
    //         isFrozen: false,
    //         resizable: false,
    //         __isCustom: true,
    //         __text_id: 'tree',
    //         sortable: false,
    //         multiColumnSort: false,
    //         formatter: TreeFormatter,
    //         enableColumnReorder: false,
    //         headerCssClass: "disable-reorder",
    //         __deps: {
    //             injector: this.injector
    //         }
    //     });
    //
    //     return columns;
    // }
    //
    // getFormatterByName(bindingName: string, col: RESTColumSetup, colDef: SlickGridColumn): SlickGridColumn {
    //     if (bindingName) {
    //         let bn = bindingName.toLowerCase();
    //         switch (bn) {
    //             // Loc status
    //             case 'status_text':
    //                 colDef = $.extend(true, {}, colDef, {
    //                     isFrozen: false,
    //                     minWidth: 60,
    //                     formatter: StatusFormatter,
    //                     enableColumnReorder: true,
    //                     // __text_id: 'status',
    //                     __deps: {
    //                         injector: this.injector
    //                     }
    //                 });
    //                 break;
    //             default:
    //                 break;
    //         }
    //         if ( bn == 'g' /*bn == 'created_dt' ||  bn == 'abs_deleted_dt' ||  bn == 'bfc_cla_dt' ||  bn == 'modified_dt'*/) {
    //             colDef = $.extend(true, {}, colDef, {
    //                 isFrozen: false,
    //                 minWidth: 60,
    //                 formatter: DatetimeFormatter,
    //                 enableColumnReorder: true,
    //                 __deps: {
    //                     injector: this.injector,
    //                     datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
    //                 }
    //             });
    //         }
    //     }
    //
    //     return colDef;
    // }
}
