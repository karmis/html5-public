import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ViewEncapsulation
} from "@angular/core";
import { BasketService } from "../../../../services/basket/basket.service";
import { BaseProvider } from "../../providers/base.provider";
import { Subscription } from 'rxjs';

// import {SlickGridProvider} from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
@Component({
    selector: 'media-basket-panel-component',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // SlickGridProvider
    ]
})

/**
 * Top bar media basket panel
 */
export class MediaBasketPanelComponent {
    public status: { isopen: boolean } = {isopen: false};
    private items: Array<any>;
    private shectChanges: boolean = false;
    private changesTimer;
    private itemsSubscriber: Subscription;
    // private sgp: SlickGridProvider;

    constructor(private cdr: ChangeDetectorRef,
                private basketService: BasketService,
                private baseProivder: BaseProvider) {
    }

    ngOnInit() {
        this.basketService.retrieveItems();
        this.itemsSubscriber = this.basketService.items.subscribe(updatedItems => {

            //disabled flashing after first onInit async update
            if (this.items) {
                this.shectChanges = true;
            }
            this.items = updatedItems || [];
            // update state of formatters at row
            if (this.baseProivder && this.baseProivder.outletComponent) {
                // let sgp: SlickGridProvider = this.baseProivder.outletComponent.slickGridComp.provider;
                // let slick = sgp.getSlick();
                // if (slick) {
                //     for (let i = 0; i < updatedItems.length; i++) {
                //         let id = updatedItems[i].id;
                //         // slick.invalidateRow(id);
                //     }
                //     // slick.render();
                // }
            }

            if (this.changesTimer) {
                clearTimeout(this.changesTimer);
            }
            this.cdr.markForCheck();
            this.changesTimer = setTimeout(() => {
                this.shectChanges = false;
                this.cdr.detectChanges();
            }, 500);
        });
    }

    ngOnDestroy() {
        this.itemsSubscriber.unsubscribe();
        clearTimeout(this.changesTimer);
    }

    itemClick($event) {
        console.log('parent click');
    }

    getCount() {
        return this.items.length;
    }

    closeBasket() {
        this.status.isopen = false;
    }

}
