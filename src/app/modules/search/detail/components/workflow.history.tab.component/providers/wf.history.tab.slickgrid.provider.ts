import {Inject, Injectable, Injector} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {SlickGridResp, SlickGridRowData} from "../../../../slick-grid/types";
import {WorkflowSlickGridProvider} from "../../../../../../views/workflow/providers/workflow.slick.grid.provider";

@Injectable()
export class WFHistorySlickGridProvider extends WorkflowSlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }
    /**
     * get rows by id
     * @param id
     * @returns {Observable<Subscription>}
     */
    getRowsById(id: number, isCarrierDetail: boolean = false): Observable<SlickGridResp> {
        return new Observable((observer: any) => {
            this.config.componentContext.slickGridComp.service.getRowsByIdWFHistory([id]).subscribe(
                (resp: SlickGridRowData[]) => {
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
        });
    }

    public buildPageByResponseData(resp: Array<any>) {
        this.clearData(false);
        let data = this.prepareData(resp, resp.length);
        this.setData(data, true);
        // selected first row
        if (data.length > 0) {
            this.setSelectedRow(0, data[0]);
        }

    }

}
