import { Inject, Injectable, Injector } from '@angular/core';
import { appRouter } from '../../../../../../constants/appRouter';
import { Observable, Subscription } from 'rxjs';
import { ProductionService } from '../../../../../../services/production/production.service';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { ProductionSourceTabComponent } from '../production.source.tab.component';
import { ProductionDetailProvider } from '../../../../../../views/detail/production/providers/production.detail.provider';

@Injectable()
export class GlobalSlickGridProvider extends SlickGridProvider {
    selectedSubRow?: { id?: number, index?: number } = {};
    productionService: ProductionService;
    productionDetailProvider: ProductionDetailProvider;

    isThumbnails(state: boolean = null, render: boolean = false): boolean {
        return super.isThumbnails(false, true);
    }

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.productionService = injector.get(ProductionService);
        this.productionDetailProvider = injector.get(ProductionDetailProvider);
        this.onRowDelete.subscribe(data => {
            this.productionDetailProvider.removeMediaTitleItems(this.config.componentContext.typeGrids, 'production', data);
        })
    }

    onRowDoubleClicked() {
        let data = this.getSelectedRowData();
        let type = '';
        if ((this.config.componentContext as ProductionSourceTabComponent).typeGrids === 'media') {
            type ='media';
        } else {
            type ='versions';
        }

        this.router.navigate(
            [
                appRouter[type].detail.substr(
                    0,
                    appRouter[type].detail.lastIndexOf('/')
                ),
                data.ID
            ]
        );
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
        return (params.data.ProdJobId > 0);
    }
}
