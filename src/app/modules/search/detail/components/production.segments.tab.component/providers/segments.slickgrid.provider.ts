import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class SegmentsSlickGridProvider extends SlickGridProvider {
    private validGrid: boolean = true;
    constructor(public injector: Injector) {
        super(injector);
    }

    isValid(error) {
        // console.log(error);
        this.validGrid = this.validGrid && !error;
        // this.rowCountForValidation++;
        // if (this.getData().length * 2 === this.rowCountForValidation) {
        //     (<any>this.componentContext).getValidation(this.validGrid);
        // }
    }

    getTimecodeValid(id, data) {
        return !this.getRowValid(data);
    }

    getRowValid(row) {
        const tcIn = row.SOM;
        const tcOut = row.EOM;

        if (tcIn > tcOut || tcIn === null || tcOut === null) {
            return false;
        } else {
            return true;
        }
    }

    getCalcValidGrid() {
        let isValid = true;
        const rows = this.getData() as any;

        for (const row of rows) {
            isValid = isValid && this.getRowValid(row);
        }

        //init inner timecodeInput validation
        this.validGrid = true;
        this.formatterTimedcodeIsValid.emit();

        return isValid && this.validGrid;
    }
}
