import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { Router } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector, Injectable } from '@angular/core';
import {
    MediaDetailHistoryResponse
} from '../../../../../../models/media/detail/history/media.detail.detail.history.response';

@Injectable()
export class HistorySlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;

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
}
