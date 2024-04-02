/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import { Subject } from "rxjs";
import { VersionsInsideTitlesComponent } from "../versions.component";
import { MediaInsideTitlesComponent } from "../../media/media.component";
import { TitlesMediaSlickGridProvider } from "../../media/providers/titles.media.slickgrid.provider";

import { TitlesSlickGridService } from "../services/slickgrid.service";
import { TitlesComponent } from "../../../titles.component";
import { SlickGridEventData } from "../../../../../modules/search/slick-grid/types";
import { appRouter } from '../../../../../constants/appRouter';
import { SlickGridService } from '../../../../../modules/search/slick-grid/services/slick.grid.service';
import { TitlesSlickGridProvider } from "../../../providers/titles.slick.grid.provider";
import { VersionSlickGridProvider } from '../../../../version/providers/version.slick.grid.provider';

export class TitlesVersionsSlickGridProvider extends VersionSlickGridProvider {
    lastData: SlickGridEventData;
    titleId: number = null;
    versionsUpdate: Subject<any> = new Subject<any>();

    /**
     * On row changed
     * @param d
     */
    onRowChanged(d?: SlickGridEventData): any {
        const versComp: VersionsInsideTitlesComponent = (<VersionsInsideTitlesComponent>this.config.componentContext);
        const comp: TitlesComponent = versComp.moduleTitleContext;
        if (!comp) {
            return;
        }
        let data = d;
        if (!d || !d.row) {
            data = this.lastData;
        }
        if (!data) {
            return;
        }
        let service: TitlesSlickGridService | any = this.injector.get(SlickGridService);
        let mediaGridRef: MediaInsideTitlesComponent = comp.mediaGridRef;
        let provider: TitlesMediaSlickGridProvider = (mediaGridRef.slickGridComp.provider as TitlesMediaSlickGridProvider);
        const extendColumns = mediaGridRef.slickGridComp.provider.extendedColumns;
        comp.clearResultForMediaGrid();
        this.lastData = data;
        if (mediaGridRef && data.row) {
            provider.showOverlay();
            provider.versionId = data.row.ID;
            service.getRowsByIdVersionsToMedia(data.row.ID, extendColumns).subscribe((resp: any) => {
                provider.buildPageByData(resp);
                this.versionsUpdate.next(resp);
                versComp.expandedAll = versComp._expandedAllDefault;
                // versComp.expandCollapseAll(versComp.expandedAll, false);
            }, () => {
                provider.hideOverlay();
            }, () => {
                provider.hideOverlay();
            });
        }
    }

    onRowDoubleClicked(data: SlickGridEventData) {
        if (this.config.options.type) {
            let destination = this.config.options.type.replace('inside-', '').toLowerCase();
            this.router.navigate([
                appRouter[destination].detail.substr(0, appRouter[destination].detail.lastIndexOf('/')),
                (<any>data.row).ID
            ]);
        }
    }

    updateExtendsColumnsCallback() {
        let comp: TitlesComponent = (<VersionsInsideTitlesComponent>this.config.componentContext).moduleTitleContext;
        if (comp) {
            setTimeout(() => {
                (<TitlesSlickGridProvider>comp.slickGridComp.provider).onRowChanged(null, true);
            });
        }
    }

    afterRequestData(resp, searchModel) {
        this.getSlick().setSelectedRows(0);
        super.afterRequestData(resp, searchModel);
    }

    refreshGrid(withOverlays: boolean = false) {
        // super.refreshGrid(withOverlays);
        const provider = (this.componentContext as VersionsInsideTitlesComponent).moduleTitleContext.slickGridComp.provider;
        provider.onRowChanged(provider.lastData ? provider.lastData : null, true);
    }

    getExportUrl() {
        return '/api/v3/title/' + this.titleId + '/versions/export';
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        if (this.plugin.suppressSelection == true) {
            return;
        }
        this.prevSelectedRows = this.getSlick().getSelectedRows();
        this.beforeSetSelectedRow(rowId, eventData, suppressDataUpdated);
        if (rowId == null) {
            this.getSlick().setSelectedRows([]);
            this._selectedRowsIds = [];
            this.prevRowId = null;
            if (!suppressDataUpdated) {
                this.onDataUpdated.emit({
                    row: null,
                    cell: null,
                } as SlickGridEventData);
            }
        } else {
            this.getSlick().setSelectedRows([rowId]);
            this._selectedRowsIds = [rowId];
            if (!suppressDataUpdated) {
                // emit data updated
                const d = this.getSelectedRowData();
                let c = 0;
                if (eventData) {
                    c = eventData.cell;
                }

                this.onDataUpdated.emit({
                    row: d,
                    cell: c,
                } as SlickGridEventData);

                this.onSelectRow.emit([rowId]);
            }
        }
    }
}
