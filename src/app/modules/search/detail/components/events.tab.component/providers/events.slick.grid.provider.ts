import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Router} from "@angular/router";
import {BasketService} from "../../../../../../services/basket/basket.service";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";

export class EventsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    private basketService: BasketService;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public rowCountForValidation: number = 0;
    public validGrid: boolean = true;

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
        let row = data.row;
        (<any>this.componentContext).config.elem.emit('setMarkers', {
            markers: [
                {time: row.SOMS},
                {time: row.EOMS}
            ],
            m_type: 'locator',
            id: row.id
        });
    }

    isValid(error) {
        this.validGrid = this.validGrid && !error;
        this.rowCountForValidation++;
        if (this.getData().length * 2 === this.rowCountForValidation) {
            (<any>this.componentContext).getValidation(this.validGrid);
        }
    }
    getTimecodeValid(id) {
        let events = (<any>this.componentContext).config.file['Events'];
        let valid = false;
        events.forEach(el => {
            if (el.customId == id || el.ID == id) {
                valid = el.timecodesNotValid;
            }
        });
        return valid;
    }
}
