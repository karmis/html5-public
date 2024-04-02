/**
 * Created by Ivan Banan 26.04.2022.
 */
import { Inject, Injector } from '@angular/core';
import { MediaSlickGridProvider } from 'app/views/media/providers/media.slick.grid.provider';
import { SlickGridService } from 'app/modules/search/slick-grid/services/slick.grid.service';


export class AssociatedMediaSlickGridProvider extends MediaSlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        if (rowId == null) {
            this.setNullRow(suppressDataUpdated);
        } else {
            this.getSlick().setSelectedRows([rowId]);
            this._selectedRowsIds = [rowId];
            this.setNotNullRow(eventData, suppressDataUpdated, rowId);
        }
    }

    refreshGrid(withOverlays: boolean = false) {
        // super.refreshGrid(withOverlays);
        let service: any = this.injector.get(SlickGridService);
        const extendColumns = this.extendedColumns;
        let data = this.getSelectedRow();

        let versionId = (data) ?
            (<any>data).PGM_PARENT_ID //|| (<any>data).PGM_RL_ID
            : null;

        if (versionId) {
            withOverlays && this.showOverlay();
            service.getRowsByIdVersionsToMedia(versionId, extendColumns).subscribe((resp: any) => {
                this.config.componentContext.clearResultForAssociatedMediaGrid();
                this.buildPageByData(resp);

                this.config.componentContext.slickGridComp.provider.refreshGrid();
            }, () => {
                withOverlays && this.hideOverlay();
            }, () => {
                withOverlays && this.hideOverlay();
            });
        }
    }

    updateExtendsColumnsCallback() {
        if (this.config.componentContext.supplierPortalComponent) {
            this.config.componentContext.supplierPortalComponent.slickGridComp.provider.onRowChanged();
        }
    }

    afterRequestData(resp, searchModel) {
        super.afterRequestData(resp, searchModel);
        this.applyColumns();
    }
}
