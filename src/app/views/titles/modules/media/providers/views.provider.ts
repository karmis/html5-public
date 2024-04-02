/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ViewsProvider} from "../../../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../../../modules/search/views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector} from "@angular/core";
import {IconsFormatter} from "../../../../../modules/search/slick-grid/formatters/icons/icons.formatter";
import {ThumbnailFormatter} from "../../../../../modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter";
import {BasketFormatter} from "../../../../../modules/search/slick-grid/formatters/basket/basket.formatter";
import {RESTColumSetup, SlickGridColumn} from "../../../../../modules/search/slick-grid/types";
import {StatusFormatter} from "../../../../../modules/search/slick-grid/formatters/status/status.formatter";
import { LinkFormatter } from '../../../../../modules/search/slick-grid/formatters/link/link.formatter';
import { appRouter } from '../../../../../constants/appRouter';
import { SettingsFormatter } from '../../../../../modules/search/slick-grid/formatters/settings/settings.formatter';
import {CustomStatusFormatter} from "../../../../../modules/search/slick-grid/formatters/custom-status/custom.status.formatter";
import { PgmMediaStatusFormatter } from '../../../../../modules/search/slick-grid/formatters/pgm-media-status/pgm.media.status.formatter';
import { MediaViewsProvider } from '../../../../media/providers/views.provider';
import {TreeFormatter} from "../../../../../modules/search/slick-grid/formatters/tree/tree.formatter";
@Injectable()
export class TitlesMediaViewsProvider extends MediaViewsProvider {
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
        // settings
        columns.push({
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


        return columns;
    }
}
