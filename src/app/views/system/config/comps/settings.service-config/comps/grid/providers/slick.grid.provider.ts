
import {Router} from "@angular/router";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { Subscription ,  Observable } from 'rxjs';
import { SlickGridProvider } from '../../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {ServiceConfigService} from "../../../../../../../../services/system.config/settings.service-config.service";

export class ServiceConfigSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public serviceConfigService: ServiceConfigService

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.serviceConfigService = injector.get(ServiceConfigService);
    }


    deleteFromServer(data) : Observable<Subscription>{
        return this.serviceConfigService.deleteServiceConfigById(data.data.ID);
    }
}
