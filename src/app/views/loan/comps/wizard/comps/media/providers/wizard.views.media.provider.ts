import {MediaViewsProvider} from "../../../../../../media/providers/views.provider";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector} from "@angular/core";
import { ThumbnailFormatter } from '../../../../../../../modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter';
import { IconsFormatter } from '../../../../../../../modules/search/slick-grid/formatters/icons/icons.formatter';
import {ViewsProvider} from "../../../../../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../../../../../modules/search/views/views.config";
import {RESTColumSetup, SlickGridColumn} from "../../../../../../../modules/search/slick-grid/types";
import {StatusFormatter} from "../../../../../../../modules/search/slick-grid/formatters/status/status.formatter";
import {DatetimeFormatter} from "../../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";

@Injectable()
export class VersionWizardMediaViewsProvider extends ViewsProvider {
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
            isFrozen: true,
            id: -3,
            name: 'File Type',
            field: '*',
            width: 80,
            minWidth: 80,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: IconsFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'icons',
            __deps: {
                injector: this.injector
            }
        });

        // thumbs
        columns.unshift({
            isFrozen: true,
            id: -4,
            name: 'Thumbnail',
            field: '*',
            width: 175,
            minWidth: 175,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: ThumbnailFormatter,
            headerCssClass: "disable-reorder",
            cssClass: 'thumb-wrapper',
            __isCustom: true,
            __text_id: 'thumbnails',
            __deps: {
                injector: this.injector
            }
        });


        return columns;
    }


    getFormatterByName(bindingName: string, col: RESTColumSetup, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {

            let bn = bindingName.toLowerCase();
            switch (bn) {
                // Loc status
                case 'status_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 60,
                        formatter: StatusFormatter,
                        // enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                //need for display 'description' field data in 'Notes' column
                case 'description_nobreaks':
                    colDef = $.extend(true, {}, colDef, {
                        field: "DESCRIPTION"
                    });
                    break;
                default:
                    break;
            }
            // Date
            if (bn == 'created_dt' || bn == 'destroy_dt' || bn == 'modified_dt' || bn == 'last_tx_date') {
                // not sure MI_CHECKSUM_DT, MI_DELETED_DT, RETURN_DATE, TX_DATE, WIPE_DT
                colDef = $.extend(true, {}, colDef, {
                    isFrozen: false,
                    minWidth: 60,
                    formatter: DatetimeFormatter,
                    // enableColumnReorder: true,
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
