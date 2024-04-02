import { Inject, Injectable, Injector } from '@angular/core';
import { ProductionService } from '../../../../../../services/production/production.service';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';

@Injectable()
export class GlobalSlickGridProvider extends SlickGridProvider {
    selectedSubRow?: { id?: number, index?: number } = {};
    productionService: ProductionService;
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.productionService = injector.get(ProductionService);
    }
}
