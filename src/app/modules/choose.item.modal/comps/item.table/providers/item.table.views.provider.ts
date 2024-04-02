import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { ViewsConfig } from '../../../../search/views/views.config';
import { IconsFormatter } from '../../../../search/slick-grid/formatters/icons/icons.formatter';
import { ViewsProvider } from '../../../../search/views/providers/views.provider';
import { RESTColumSetup, SlickGridColumn } from '../../../../search/slick-grid/types';
import { DatetimeFormatter } from '../../../../search/slick-grid/formatters/datetime/datetime.formatter';
import { ThumbnailFormatter } from '../../../../search/slick-grid/formatters/thumbnail/thumbnail.formatter';
import { StatusFormatter } from '../../../../search/slick-grid/formatters/status/status.formatter';
import { TreeFormatter } from '../../../../search/slick-grid/formatters/tree/tree.formatter';

@Injectable()
export class ItemTableViewsProvider extends ViewsProvider {
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
       if (this.config.options.type === 'VersionGrid') {
           columns.unshift(
               {
                   id: -99,
                   name: '',
                   field: '*',
                   width: 80,
                   isFrozen: false,
                   resizable: false,
                   __isCustom: true,
                   __text_id: 'tree',
                   sortable: false,
                   multiColumnSort: false,
                   cssClass: 'overflow-visible',
                   formatter: TreeFormatter,
                   enableColumnReorder: false,
                   headerCssClass: "disable-reorder",
                   __deps: {
                       injector: this.injector
                   }
               });
       }
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
            if (bn == 'created_dt' || bn == 'destroy_dt' || bn == 'modified_dt' || bn == 'last_tx_date' || bn == "created" || bn == "on_air" || bn == "off_air") {
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
