import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Router} from "@angular/router";
import {BasketService} from "../../../../../../services/basket/basket.service";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {MediaDetailAttachmentsResponse} from "../../../../../../models/media/detail/attachments/media.detail.detail.attachments.response";

export class TabMisrSlickGridProvider extends SlickGridProvider {
    public router: Router;
    private basketService: BasketService;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }

    onRowDoubleClicked(){
        return;
    }

    public buildPageByResponseData(resp: Array<MediaDetailAttachmentsResponse>) {
      this.clearData(false);
      let data = this.prepareData(resp, resp.length);
      this.setData(data, true);
      // selected first row
      if (data.length > 0) {
        this.setSelectedRow(0, data[0]);
      }
     // this.onGridRowsUpdated.emit(resp);
    }
}
