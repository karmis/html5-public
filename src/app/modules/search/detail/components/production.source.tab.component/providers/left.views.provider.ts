import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { ViewsProvider } from '../../../../views/providers/views.provider';
import { ViewsConfig } from '../../../../views/views.config';
import { Observable } from 'rxjs';
import { ViewsOriginalType } from '../../../../views/types';
import { SlickGridProvider } from "../../../../slick-grid/providers/slick.grid.provider";
import { IconsFormatter } from "../../../../slick-grid/formatters/icons/icons.formatter";
import { ThumbnailFormatter } from "../../../../slick-grid/formatters/thumbnail/thumbnail.formatter";
import { PlayButtonFormatter } from "../../../../slick-grid/formatters/play-button/play-button.formatter";
import { BasketFormatter } from "../../../../slick-grid/formatters/basket/basket.formatter";
import { SettingsFormatter } from "../../../../slick-grid/formatters/settings/settings.formatter";
import { DeleteFormatter } from "../../../../slick-grid/formatters/delete/delete.formatter";

@Injectable()
export class LeftViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    load(): Observable<ViewsOriginalType | null> {
        return super.load();
    }

    getCustomColumns(sgp: SlickGridProvider = null) {
        return [
            {
                id: -2,
                field: "*",
                name: " ",
                width: 38,
                sortable: false,
                resizable: false,
                formatter: DeleteFormatter,
                __deps: {
                    injector: this.injector,
                    data: {
                        withModal: true,
                        modalData: {
                            text: 'common.remove_question',
                            textParams: {},
                            message: 'common.removed_successfully'
                        }
                    }
                }
            }
        ]
    }

}
