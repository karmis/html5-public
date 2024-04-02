import { Inject, Injectable, Injector } from '@angular/core';
import { SlickGridProvider } from '../../../../search/slick-grid/providers/slick.grid.provider';

@Injectable()
export class VersionAlreadySlickGridProvider extends SlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    onRowDoubleClicked($event): any {
        return false;
    }

    onRowMousedown(data): any {
    }
}
