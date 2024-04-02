import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { ViewsProvider } from '../../../../views/providers/views.provider';
import { ViewsConfig } from '../../../../views/views.config';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { DeleteFormatter } from "../../../../slick-grid/formatters/delete/delete.formatter";

@Injectable()
export class RightViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    public getSlickGridProviders(): SlickGridProvider[] {
        let gridProviders = this.config.moduleContext.gridProviders;
        let sgc = this.config.componentContext.slickGridComp;
        let providerType = (sgc && sgc.config) ? sgc.config.providerType : SlickGridProvider;
        let sgp = (sgc && sgc.provider) ? sgc.provider : this.injector.get(providerType);


        let arrSgp: SlickGridProvider[] = (gridProviders && gridProviders.length > 0)
            ? gridProviders
            : !!sgp
                ? [sgp]
                : [];

        return arrSgp;
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
