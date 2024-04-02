import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewEncapsulation } from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {BasketService} from "../../../../../services/basket/basket.service";
import { Subscription } from 'rxjs';

@Component({
    selector: 'basket-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BasketFormatterComp {
    private params;
    private isOrdered;
    private itemsSubscriber: Subscription;
    private depsData: any;
    private itemType: string;
    public injectedData: SlickGridFormatterData;



    constructor(private injector: Injector,
                private basketService: BasketService,
                private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.depsData = this.params.columnDef.__deps.data;

        if (this.depsData && this.depsData.itemType) {
            this.itemType = this.depsData.itemType;
        } else {
            this.params.data.searchType = this.params.columnDef.__contexts.provider.module.searchType;
            const searchType = this.params.data.searchType.replace("inside-", ""); // prevent crashes for media and versions grid inside titles or version details
            this.itemType = searchType == 'versions' ? "Version" : searchType;
        }
    }
    ngOnInit() {
        this.isOrdered = this.getIsOrdered();
        //for observing all manipulations with basket instead of ChangeDetectionStrategy.Default
        this.itemsSubscriber = this.basketService.items
            .subscribe((updatedItems) => {
                this.isOrdered = this.getIsOrdered();
                this.cdr.detectChanges();
            });
    }

    ngOnDestroy() {
        try {
            this.itemsSubscriber.unsubscribe();
        } catch (e) {}

    }

    onMousedown($event) {
        //cancel bubbling (for cancel slick-grid row selection)
        $event.stopPropagation();
    }

  toggleBasket($event) {
      $event.stopPropagation();
      let searchType = this.itemType as any;
      let selectedRows = this.params.columnDef.__contexts.provider.getSelectedRowsData();
      if (this.params.columnDef.__contexts.provider.plugin.multiSelect && selectedRows.length > 1) {
          let alreadyInBasket = this.getIsOrdered(this.params.data);
          for (let e in selectedRows) {
              let data: SlickGridRowData | SlickGridTreeRowData = selectedRows[e];
              delete selectedRows[e].__contexts;
              if (!alreadyInBasket) {
                  ( !this.getIsOrdered(data) ) && this.basketService.addToBasket(data, searchType);
              } else {
                  this.basketService.removeFromBasket([data]);
              }
          }
      } else {
          let data: SlickGridRowData | SlickGridTreeRowData = this.params.data;
          delete data.__contexts;
          this.isOrdered ? this.basketService.removeFromBasket([data]) : this.basketService.addToBasket(data, searchType);
      }
  }

    getIsOrdered(data?: SlickGridRowData | SlickGridTreeRowData) {
        (!data) && (data = this.params.data)
        return this.basketService.hasItem(data);
    }


}
export function BasketFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {

    return commonFormatter(BasketFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



