import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { Router } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector, Injectable } from '@angular/core';
import {
    MediaDetailHistoryResponse
} from '../../../../../../models/media/detail/history/media.detail.detail.history.response';

@Injectable()
export class AVFaultsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public rowCountForValidation: number = 0;
    public validGrid: boolean = true;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }

    public buildPageByResponseData(resp: Array<MediaDetailHistoryResponse>) {
        this.clearData(false);
        let data = this.prepareData(resp, resp.length);
        this.setData(data, true);
        // selected first row
        if (data.length > 0) {
            this.setSelectedRow(0, data[0]);
        }
    }
    onRowMousedown(data) {
        let row = data.row;
        (<any>this.componentContext).config.elem.emit('setMarkers', {
            markers: [
                {time: row.TIMECODE_IN},
                {time: row.TIMECODE_OUT}
            ],
            m_type: 'locator',
            id: row.id
        });
    }
    getTimecodeValid(id) {
        let faults = (<any>this.componentContext).config.file['Faults'];
        let valid = false;
        faults.forEach(el => {
            if (el.customId == id || el.ID == id) {
                valid = el.timecodesNotValid;
            }
        });
        return valid;
    }
    isValid(error) {
        this.validGrid = this.validGrid && !error;
        this.rowCountForValidation++;
        if (this.getData().length * 2 === this.rowCountForValidation) {
            (<any>this.componentContext).getValidation(this.validGrid);
        }
    }
}
