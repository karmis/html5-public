import { ViewsProvider } from '../../../modules/search/views/providers/views.provider';
import { ViewsConfig } from "../../../modules/search/views/views.config";
import { ThumbnailFormatter } from "../../../modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter";
import { BasketFormatter } from "../../../modules/search/slick-grid/formatters/basket/basket.formatter";
import { SettingsFormatter } from "../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import { DropFormatter } from "../../../modules/search/slick-grid/formatters/drop/drop.formatter";

export class MediaViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        let columns = [];
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

        columns.unshift({
            isFrozen: true,
            id: -1,
            name: '',
            field: '*',
            width: 0,
            minWidth: 0,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: DropFormatter,
            cssClass: 'hidden',
            headerCssClass: "disable-reorder hidden",
            __isCustom: true,
            __text_id: 'drop-formatter',
            __deps: {
                injector: this.injector
            }
        });

        return columns;
    }
}
