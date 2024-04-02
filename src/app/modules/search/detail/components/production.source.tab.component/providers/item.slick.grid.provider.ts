import { Inject, Injectable, Injector } from '@angular/core';
import { SlickGridEventData } from '../../../../slick-grid/types';
import { Observable, Subscription } from 'rxjs';
import { ProductionService } from '../../../../../../services/production/production.service';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { ProductionDetailProvider } from '../../../../../../views/detail/production/providers/production.detail.provider';

@Injectable()
export class ItemSlickGridProvider extends SlickGridProvider {
    selectedSubRow?: { id?: number, index?: number } = {};
    productionService: ProductionService;
    productionDetailProvider: ProductionDetailProvider;
    typeGrid: 'ItemSlickGridProvider';

    isThumbnails(state: boolean = null, render: boolean = false): boolean {
        return super.isThumbnails(false, true);
    }

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.productionService = injector.get(ProductionService);
        this.productionDetailProvider = injector.get(ProductionDetailProvider);
        this.onRowDelete.subscribe(data => {
            this.productionDetailProvider.removeMediaTitleItems(this.config.componentContext.typeGrids, 'item', data);
        })
    }

    onRowDoubleClicked(data: SlickGridEventData) {

    }

    deleteFromServer(data): Observable<Subscription> {
        return new Observable(obs => {
            obs.next()
            obs.complete()
        });
    }


    // for delete formatter
    isDisabledDelete(params): boolean {
        if (this.productionDetailProvider.typePage === 'create') {
            return false
        }
        if (params.data.__ISNEW) {
            return false
        }
        return (params.data.ProdJobId > 0); // If the ProdJobId>0 then these cannot be deleted.
    }
}
