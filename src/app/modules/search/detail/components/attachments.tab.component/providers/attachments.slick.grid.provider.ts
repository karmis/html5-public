import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Router} from "@angular/router";
import {BasketService} from "../../../../../../services/basket/basket.service";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {MediaDetailAttachmentsResponse} from "../../../../../../models/media/detail/attachments/media.detail.detail.attachments.response";
import * as $ from "jquery";
import {SlickGridColumn} from "../../../../slick-grid/types";
import {ViewsProvider} from "../../../../views/providers/views.provider";

export class AttachmentsSlickGridProvider extends SlickGridProvider {
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
    /**
     * Apply changes of columns at grid
     */
    applyColumns() {
        $('.overlay-indicator').remove();
        this.clearPlaceholder();
        let cols = this.getActualColumns();

        this.hidePlaceholder();
        cols = cols.map((e: SlickGridColumn) => {
            if (!e.__contexts) {
                e.__contexts = this.getInjectedContexts();
            }
            return e;
        });

        let _cols = [];
        let viewsProvider: ViewsProvider = this.injector.get(ViewsProvider);
        $.each(cols, (k, o: SlickGridColumn) => {
            // apply formatters
            let col = o.__bindingFormat ? viewsProvider.getFormatterByFormat(o.__bindingFormat, o.__col, o) : viewsProvider.getFormatterByName(o.field, o.__col, o);
            _cols.push(col);
        });

        if (this.slick.getColumns().length === 0) {
            this.slick.setColumns(_cols);
        }

        this.slick.setColumns(_cols);

        return;
    }
}
