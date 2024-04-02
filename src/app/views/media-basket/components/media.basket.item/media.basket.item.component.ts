/**
 * Created by Pavel on 29.11.2016.
 */
import {Component, Input, ViewEncapsulation, Output, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {BasketService} from '../../../../services/basket/basket.service';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import { appRouter } from '../../../../constants/appRouter';

@Component({
    selector: 'media-basket-item-component',
    templateUrl: '/tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * Media basket item
 */
export class MediaBasketItemComponent {
  @Input() item;

  @Output() selectedId;

  constructor(private basketService: BasketService,
              private router: Router,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  remove($event) {
    this.basketService.removeFromBasket([this.item])
  }

  toggleSelected($event) {
    $event.stopPropagation();
    this.item.selected = !this.item.selected;
  }

  goToDetail($event) {
    $event.stopPropagation();
    $event.preventDefault();
    if(this.item.basket_item_type){
        let type = this.item.basket_item_type;
        let ref = (type == "Version")
            ? "versions"
            : (type == "Tape")
                ? 'carriers'
                :type.toLowerCase();
        console.log(appRouter, appRouter[ref]);
        if(appRouter[ref] && appRouter[ref].detail){
            this.router.navigate(
                [
                    appRouter[ref].detail.substr(
                        0,
                        appRouter[ref].detail.lastIndexOf('/')
                    ),
                    this.item.ID
                ]
            ).then(() => {});
        } else {
            throw new Error(ref + ' in appRouter not defined');
        }

    }

    return false;
  }
}
