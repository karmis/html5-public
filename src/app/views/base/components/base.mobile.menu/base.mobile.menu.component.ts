import {
    Component,
    ViewEncapsulation
} from "@angular/core";

@Component({
    selector: 'base-mobile-menu',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

/**
 * Shown small info about user
 */
export class BaseMobileMenuComponent {
    isOpen = false;

    constructor() {
    }

    onToggle(status?) {
       this.isOpen = status !== undefined ? status : !this.isOpen;
    }
}
