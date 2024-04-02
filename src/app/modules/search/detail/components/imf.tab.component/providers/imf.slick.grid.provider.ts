import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Router} from "@angular/router";
import {BasketService} from "../../../../../../services/basket/basket.service";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {SlickGridEventData} from "../../../../slick-grid/types";
import {appRouter} from "../../../../../../constants/appRouter";

export class IMFSlickGridProvider extends SlickGridProvider {
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

    /**
     * On mousedown
     * @param data
     */
    onRowMousedown(data) {

    }
    /**
     * On double click by row
     * @param data
     */
    onRowDoubleClicked(data: SlickGridEventData) {
        if ((<any>data.row).MediaId) {
            let destination = 'media';
            this.router.navigate([
                appRouter[destination].detail.substr(0, appRouter[destination].detail.lastIndexOf('/')),
                (<any>data.row).MediaId
            ]);
        }
    }
}
