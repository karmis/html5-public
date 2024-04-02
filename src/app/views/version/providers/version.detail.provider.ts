import {DetailProvider} from '../../../modules/search/detail/providers/detail.provider';
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {SessionStorageService} from "ngx-webstorage";
import {TranslateService} from "@ngx-translate/core";
import {Inject, Injector} from "@angular/core";
import {NotificationService} from "../../../modules/notification/services/notification.service";

export class VersionDetailProvider extends DetailProvider {
    constructor(@Inject(ActivatedRoute) public route: ActivatedRoute,
                @Inject(Location) public location: Location,
                @Inject(SessionStorageService) public storage: SessionStorageService,
                @Inject(Router) public router: Router,
                @Inject(TranslateService) public translate: TranslateService,
                @Inject(Injector) public injector: Injector,
                @Inject(NotificationService) protected notificationService: NotificationService) {
        super(route, location, storage, router, translate, injector, notificationService);
    }
}
