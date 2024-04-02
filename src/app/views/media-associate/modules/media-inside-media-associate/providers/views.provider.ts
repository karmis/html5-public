/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ViewsProvider} from "../../../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../../../modules/search/views/views.config";
import {ThumbnailFormatter} from "../../../../../modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {RESTColumSetup, SlickGridColumn} from "../../../../../modules/search/slick-grid/types";
import {StatusFormatter} from "../../../../../modules/search/slick-grid/formatters/status/status.formatter";
import {SettingsFormatter} from "../../../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import {BasketFormatter} from "../../../../../modules/search/slick-grid/formatters/basket/basket.formatter";
import {IconsFormatter} from "../../../../../modules/search/slick-grid/formatters/icons/icons.formatter";
import {DatetimeFormatter} from "../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";
import {DragDropFormatter} from "../../../../../modules/search/slick-grid/formatters/dragdrop/dragdrop.formatter";
import { CustomStatusFormatter } from '../../../../../modules/search/slick-grid/formatters/custom-status/custom.status.formatter';
import { MediaInsideMediaAssociateSlickGridProvider } from './media.slick.grid.provider';
import { EmptyFormatter } from '../../../../../modules/search/slick-grid/formatters/empty/empty.formatter';
import { PgmMediaStatusFormatter } from '../../../../../modules/search/slick-grid/formatters/pgm-media-status/pgm.media.status.formatter';
import { MediaViewsProvider } from '../../../../media/providers/views.provider';

export class MediaInsideMappingViewsProvider extends MediaViewsProvider {
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
    getCustomColumns(sgp?) {
        let columns = [];

        // icons
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

        // Basket
        columns.unshift({
            isFrozen: true,
            id: -5,
            name: '',
            field: '*',
            width: 50,
            minWidth: 50,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: BasketFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'basket',
            __deps: {
                injector: this.injector
            }
        });

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

        if (sgp.config.options.parentConfig.providerType === MediaInsideMediaAssociateSlickGridProvider) {
            columns.unshift({
                isFrozen: true,
                id: -7,
                name: '',
                field: '*',
                width: 22,
                minWidth: 22,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                cssClass: 'absolute-w100-h100',
                formatter: DragDropFormatter,
                headerCssClass: "disable-reorder",
                __isCustom: true,
                __text_id: 'drag-drop-control',
                __deps: {
                    injector: this.injector,
                    data: {
                        ddSelector: '#version-inside-mapping-grid'
                    }
                }
            });
        } else {
            columns.unshift({
                isFrozen: true,
                id: -7,
                name: '',
                field: '*',
                width: 22,
                minWidth: 22,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: EmptyFormatter,
                headerCssClass: "disable-reorder",
            });
        }



        return columns;
    }
}
