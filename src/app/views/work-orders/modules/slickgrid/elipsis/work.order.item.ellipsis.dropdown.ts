import {
    Component,
    Input,
    ViewEncapsulation
} from "@angular/core";
import { SecurityService } from '../../../../../services/security/security.service';

@Component({
    selector: 'work-order-item-ellipsis-dropdown',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [

    ]
})

export class WorkOrderItemEllipsisDropdownComponent {

    @Input('slickGridComp') protected slickGridComp;
    @Input('externalClass') protected externalClass: string = "";

    constructor(protected securityService: SecurityService) {

    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }
}
