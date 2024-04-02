import {
    Component,
    Input,
    ViewEncapsulation
} from "@angular/core";
import {SecurityService} from "../../../services/security/security.service";

@Component({
    selector: 'media-item-ellipsis-dropdown',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
    ]
})

export class MediaItemEllipsisDropdownComponent {

    @Input('slickGridComp') private slickGridComp;
    @Input('type') private type = '';
    @Input('externalClass') private externalClass: string = "";
    protected context: MediaItemEllipsisDropdownComponent = this;
    constructor(protected securityService: SecurityService) {
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    hasPermission(path) {
        //return true;
        return this.securityService.hasPermissionByPath(path);
    }
}
