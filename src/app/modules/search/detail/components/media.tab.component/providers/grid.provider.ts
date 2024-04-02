/**
 * Created by Sergey Trizna on 11.11.2017.
 */
import {Observable,  Subscription } from "rxjs";
import {appRouter} from "../../../../../../constants/appRouter";
import * as Cookies from 'js-cookie';
import {MediaSlickGridProvider} from "../../../../../../views/media/providers/media.slick.grid.provider";
import {Inject, Injector} from "@angular/core";
import { SlickGridService } from '../../../../slick-grid/services/slick.grid.service';
import {SlickGridResp, SlickGridRowData} from "../../../../slick-grid/types";

export class DetailMediaTabGridProvider extends MediaSlickGridProvider {
    public lastSelectedRow = null;
    // public formatterPlayButtonActiveId = 'none';

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    private storedId = null;
    private isAssoc = false;
    private isCarrierDetail = false;
    private isLinkedMedia = false;
    private isChildMedia = false;
    updateExtendsColumnsCallback() {
        if (this.lastSearchModel && this.storedId) {
            let apiUrl = '/api/v3/version/' + this.storedId + '/media';
            if(this.isAssoc) {
                apiUrl = '/api/v3/media/related/' + this.storedId;
            } else if (this.isCarrierDetail) {
                apiUrl = '/api/v3/carrier/' + this.storedId + '/media';
            } else if (this.isLinkedMedia) {
                apiUrl = '/api/v3/media/linked/' + this.storedId;
            } else if (this.isChildMedia) {
                apiUrl = '/api/v3/media/' + this.storedId + '/media';
            }
            this._buildPageRequest(
                this.config.options.searchType,
                this.lastSearchModel,
                false,
                true,
                apiUrl
            );
            // this.buildPage();
        }
    }

    /**
     * get rows by id
     * @param id
     * @returns {Observable<Subscription>}
     */
    getRowsById(id: number, isAssoc = false, isCarrierDetail = false, isLinkedMedia = false, isChildMedia = false): Observable<SlickGridResp> {
        return new Observable((observer: any) => {
            this.storedId = id;
            this.isAssoc = isAssoc;
            this.isCarrierDetail = isCarrierDetail;
            this.isLinkedMedia = isLinkedMedia;
            this.isChildMedia = isChildMedia;

            if(isAssoc) {
                this.config.componentContext.slickGridComp.service.getRowsByIdAssocMedia(id, this.extendedColumns, this).subscribe(
                    (resp: SlickGridRowData[]) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            } else if (isCarrierDetail) {
                this.config.componentContext.slickGridComp.service.getRowsByIdCarrierToMedia(id, this.extendedColumns, this).subscribe(
                    (resp: SlickGridRowData[]) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            } else if (isLinkedMedia) {
                this.config.componentContext.slickGridComp.service.getRowsByIdLinkedMedia(id, this.extendedColumns, this).subscribe(
                    (resp: SlickGridRowData[]) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            } else if (isChildMedia) {
                this.config.componentContext.slickGridComp.service.getRowsByIdChildMedia(id, this.extendedColumns, this).subscribe(
                    (resp: SlickGridRowData[]) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            }
            else {
                this.config.componentContext.slickGridComp.service.getRowsByIdVersionsToMedia(id, this.extendedColumns, undefined, this).subscribe(
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
    buildPage(): void { }// for px-4302

    /**
     * On double click by row
     * @param $event
     */
    onRowDoubleClicked(data): any {
        let force = this.config.componentContext ? this.config.componentContext.config.typeDetails : 'version-details';
        let destination = this.config.options.type.replace('inside-', '').toLowerCase();
        this.router.navigate(
            [
                appRouter[destination].detail.substr(
                    0,
                    appRouter[destination].detail.lastIndexOf('/')),
                (<any>data.row).ID
            ]
        );
    }

    onRowMousedown(data) {

    }

    onRowMouseclick(data) {
        let row = data.row
            , nextVal;

        let mediaType = row['MEDIA_TYPE'] || null
            , cMedia = (<any>this.componentContext).appSettings.mediaSubtypes.Media
            , cAudio = (<any>this.componentContext).appSettings.mediaSubtypes.Audio;

        //toggle off play button (formatter)
        if (this.lastSelectedRow && this.lastSelectedRow.$id == this.formatterPlayButtonActiveId) {
            this.formatterPlayButtonActiveId = 'none';
            this.moduleContext.cdr.markForCheck();
        }

        if (this.lastSelectedRow && this.lastSelectedRow.ID === data.row.ID) {
            //unselect markers
            nextVal = true;
            this.setSelectedRow(null);
            this.lastSelectedRow = null;
        } else {
            nextVal = {
                markers: [
                    {time: row.SOM_text.replace(';',':')},
                    {time: row.EOM_text.replace(';',':')}
                ],
                id: null
                // id: row.customId || row.Id
            };
            this.lastSelectedRow = row;
        }

        if (mediaType && (mediaType == cMedia || mediaType == cAudio)) {
            (<any>this.componentContext).setNode(nextVal);
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
                this.buildPageByData(resp);
                this.moduleContext.whenGridRendered((e,grid) => {
                    this.moduleContext.cdr.detectChanges();
                });
            }, () => {
                withOverlays && this.hideOverlay();
            }, () => {
                withOverlays && this.hideOverlay();
            });
        }
    }
    getExportUrl() {
        return  '/api/v3/' + (this.isCarrierDetail ? 'carrier' : 'version') + '/' + this.config.componentContext.config.file.ID + '/media/export'
    }
}
