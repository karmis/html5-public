/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import { ViewsProvider } from "../../../modules/search/views/providers/views.provider";
import { ViewsConfig } from "../../../modules/search/views/views.config";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from "@angular/core";
import { RESTColumSetup, SlickGridColumn } from "../../../modules/search/slick-grid/types";
import { StatusFormatter } from "../../../modules/search/slick-grid/formatters/status/status.formatter";
import { SettingsFormatter } from "../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import { DatetimeFormatter } from "../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";
import { LinkFormatter } from '../../../modules/search/slick-grid/formatters/link/link.formatter';
import { appRouter } from '../../../constants/appRouter';
import { CustomStatusFormatter } from '../../../modules/search/slick-grid/formatters/custom-status/custom.status.formatter';
import { PgmMediaStatusFormatter } from '../../../modules/search/slick-grid/formatters/pgm-media-status/pgm.media.status.formatter';

@Injectable()
export class ProductionMiViewsProvider extends ViewsProvider {
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

        // Is Live
        // columns.unshift({
        //     isFrozen: true,
        //     id: -2,
        //     name: '',
        //     field: '*',
        //     width: 60,
        //     minWidth: 60,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: IsLiveFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'settings',
        //     __deps: {

        //
        //
        //         injector: this.injector
        //     }
        // });

        // icons
        // columns.unshift({
        //     isFrozen: true,
        //     id: -3,
        //     name: 'File Type',
        //     field: '*',
        //     width: 80,
        //     minWidth: 80,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: IconsFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'icons',
        //     __deps: {
        //         injector: this.injector
        //     }
        // });

        // thumbs
        // columns.unshift({
        //     isFrozen: true,
        //     id: -4,
        //     name: 'Thumbnail',
        //     field: '*',
        //     width: 175,
        //     minWidth: 175,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: ThumbnailFormatter,
        //     headerCssClass: "disable-reorder",
        //     cssClass: 'thumb-wrapper',
        //     __isCustom: true,
        //     __text_id: 'thumbnails',
        //     __deps: {
        //         injector: this.injector
        //     }
        // });

        // // Basket
        // columns.unshift({
        //     isFrozen: true,
        //     id: -5,
        //     name: '',
        //     field: '*',
        //     width: 50,
        //     minWidth: 50,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: BasketFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'basket',
        //     __deps: {
        //         injector: this.injector
        //     }
        // });

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


    getFormatterByName(bindingName: string, col: RESTColumSetup, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            let bn = bindingName.toLowerCase();
            let fieldName;
            if (bn.indexOf('dynamic.custommediastatus') > -1 || bindingName.startsWith('xml|') || bn.indexOf('dynamic.alttitle') > -1) {
                bn = 'customstatuses';
                //if(bindingName.startsWith('xml|'))
                fieldName = bindingName;
            }
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
                case 'version':
                    colDef = $.extend(true, {}, colDef, {
                        field: "VERSION",
                        isFrozen: false,
                        formatter: LinkFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: appRouter.versions.detail,
                                valueField: 'PGM_PARENT_ID'
                            }
                        }
                    });
                    break;
                case 'ser_title':
                    colDef = $.extend(true, {}, colDef, {
                        field: "SER_TITLE",
                        isFrozen: false,
                        formatter: LinkFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: appRouter.title.detail,
                                valueField: 'SER_ABS_ID'
                            }
                        }
                    });
                    break;
                case 'ser_name':
                    colDef = $.extend(true, {}, colDef, {
                        field: "SER_NAME",
                        isFrozen: false,
                        formatter: LinkFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: appRouter.title.detail,
                                valueField: 'SER_ABS2_ID'
                            }
                        }
                    });
                    break;
                case 'title':
                    colDef = $.extend(true, {}, colDef, {
                        field: "TITLE",
                        isFrozen: false,
                        formatter: LinkFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: appRouter.title.detail,
                                valueField: 'PGM_ABS_ID'
                            }
                        }
                    });
                    break;
                case 'pgm_status_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        formatter: PgmMediaStatusFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                lookupValueField: 'STATUS',
                                storageKey: 'PgmStatus'
                            }
                        }
                    });
                    break;
                case 'media_status_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        formatter: PgmMediaStatusFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                lookupValueField: 'MEDIA_STATUS',
                                storageKey: 'MediaStatus'
                            }
                        }
                    });
                    break;
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
}
