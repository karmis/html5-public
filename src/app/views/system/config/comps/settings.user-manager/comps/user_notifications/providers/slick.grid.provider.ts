import { Router } from "@angular/router";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { Subscription, Observable } from 'rxjs';
import { SlickGridProvider } from '../../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { UserManagerService } from '../../../services/settings.user-manager.service';

export class UserNotificationsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public userManagerService: UserManagerService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.userManagerService = injector.get(UserManagerService);
    }


    deleteFromServer(data): Observable<Subscription> {
        data.data.ID = parseInt(data.data.ID) * -1;
        var removeData = $.extend({}, data.data);
        delete removeData.id;
        delete removeData.$id;
        return new Observable((observer: any) => {
            this.userManagerService.editSubscription(removeData).subscribe((res: any) => {
                (<any>this.moduleContext).componentContext.getSubscriptionsTable(false);
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }
}
