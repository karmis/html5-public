/**
 * Created by Pavel on 29.11.2016.
 */
import {Component, Input, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import * as Cookies from 'js-cookie';
import {Router} from "@angular/router";
import { appRouter } from '../../../../../../constants/appRouter';

@Component({
    selector: 'media-item-component',
    templateUrl: '/tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None/*,
   changeDetection: ChangeDetectionStrategy.OnPush*/
})

/**
 * Media item
 */
export class MediaItemComponent {
    @Input() item;
    @Input() typeDetails = 'workflow-details';
    constructor(private router: Router) {
    }

    ngOnInit() {

    }

    goToDetail() {
        // this.router.navigate(['media'  + '/detail', this.item.ID]);
        this.router.navigate(
            [
                appRouter.media.detail.substr(
                    0,
                    appRouter.media.detail.lastIndexOf('/')
                ),
                this.item.ID
            ]
        );
    }
}
