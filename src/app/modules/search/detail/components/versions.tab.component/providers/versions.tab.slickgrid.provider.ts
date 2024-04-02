import {Injectable} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {SlickGridResp, SlickGridRowData} from "../../../../slick-grid/types";
import {VersionSlickGridProvider} from "../../../../../../views/version/providers/version.slick.grid.provider";

@Injectable()
export class VersionsTabSlickGridProvider extends VersionSlickGridProvider {
    private storedId = null;
    private isCarrierDetail = false;

    updateExtendsColumnsCallback() {
        if (this.lastSearchModel && this.storedId) {
            this._buildPageRequest(
                this.config.options.searchType,
                this.lastSearchModel,
                false,
                true,
                '/api/v3/title/' + this.storedId + '/versions'
            );
            // this.buildPage();
        }
    }

    refreshGrid(withOverlays: boolean = false) {
        if (!this.storedId) {
            return;
        }

        this.getRowsById(this.storedId).subscribe(
            (resp: SlickGridResp) => {
                this.buildPageByData(resp);
            });
    }

    /**
     * get rows by id
     * @param id
     * @returns {Observable<Subscription>}
     */
    getRowsById(id: number, isCarrierDetail: boolean = false): Observable<SlickGridResp> {
        return new Observable((observer: any) => {
            this.isCarrierDetail = isCarrierDetail;
            if (isCarrierDetail) {
                this.config.componentContext.versionSlickGrid.service.getRowsByIdCarrierToVersions(id, this.extendedColumns, this).subscribe(
                    (resp: SlickGridRowData[]) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            } else {
                this.storedId = id;
                this.config.componentContext.versionSlickGrid.service.getRowsByIdTitlesToVersions(id, this.extendedColumns, this).subscribe(
                    (resp: SlickGridRowData[]) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            }
        });
    }
}
