/**
 * Created by Ivan Banan 03.11.2019.
 */
import { Inject, Injector } from '@angular/core';
import { MediaInsideSupplierPortalComponent } from '../media.component';
import { AssociatedMediaSlickGridProvider } from 'app/providers/associated.media/associated.media.slick.grid.provider';
import { SearchModel } from 'app/models/search/common/search';
import { SlickGridService } from 'app/modules/search/slick-grid/services/slick.grid.service';

export class AssociatedMediaInsideSupplierPortalSlickGridProvider extends AssociatedMediaSlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    buildPage(searchModel: SearchModel, resetSearch: boolean = false, withOverlays: boolean = true): void {
        this.hookSearchModel(searchModel).subscribe((searchModel: SearchModel) => {
            const service: any = this.injector.get(SlickGridService);
            const extendColumns = this.extendedColumns;
            const comp = (this.componentContext as MediaInsideSupplierPortalComponent);
            const data = comp.supplierPortalComponent.slickGridComp.provider.lastData;
            let page = this.PagerProvider.getCurrentPage() || 1;

            if (comp && data.row) {
                this.showOverlay();

                service.getRowsByIdVersionsToMedia(data.row.ID, extendColumns, page, this)
                    .subscribe((resp: any) => {
                        this.buildPageByData(resp);
                    }, () => {
                        this.hideOverlay();

                    }, () => {
                        this.hideOverlay();

                    });
            }
        });
    }
}
