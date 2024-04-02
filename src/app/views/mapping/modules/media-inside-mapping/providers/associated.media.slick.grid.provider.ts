/**
 * Created by IvanBanan on 16.08.2019.
 */
import { Inject, Injector } from '@angular/core';
import { AssociatedMediaSlickGridProvider } from 'app/providers/associated.media/associated.media.slick.grid.provider';
import { SearchModel } from 'app/models/search/common/search';
import { SlickGridService } from 'app/modules/search/slick-grid/services/slick.grid.service';
import { MediaInsideMappingComponent, MediaInsideMappingTabsEnum } from '../media.component';

export class AssociatedMediaInsideMappingSlickGridProvider extends AssociatedMediaSlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    buildPage(searchModel: SearchModel, resetSearch: boolean = false, withOverlays: boolean = true): void {
        this.hookSearchModel(searchModel).subscribe((searchModel: SearchModel) => {
            const service: any = this.injector.get(SlickGridService);
            const extendColumns = this.extendedColumns;
            const comp = (this.componentContext as MediaInsideMappingComponent);
            const data = comp.mappingComp.slickGridComp.provider.lastData;
            let page = this.PagerProvider.getCurrentPage() || 1;

            if (comp && data.row) {
                if (comp.currentTab === MediaInsideMappingTabsEnum.associated) {
                    this.showOverlay();
                }
                service.getRowsByIdVersionsToMedia(data.row.ID, extendColumns, page, this)
                    .subscribe((resp: any) => {
                        this.buildPageByData(resp);
                    }, () => {
                        if (comp.currentTab === MediaInsideMappingTabsEnum.associated) {
                            this.hideOverlay();
                        }
                    }, () => {
                        if (comp.currentTab === MediaInsideMappingTabsEnum.associated) {
                            this.hideOverlay();
                        }
                    });
            }
        });
    }
}
