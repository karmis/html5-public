import { Router } from "@angular/router";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { Subscription, Observable } from 'rxjs';
import { SlickGridProvider } from '../../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SettingsGroupsService } from '../../../../../../../../services/system.config/settings.groups.service';
import { LoadingIconsService } from "./loading-icons.service";

export class LoadingsIconsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;

    constructor(@Inject(Injector) public injector: Injector, private loadingIconsService: LoadingIconsService) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }


    deleteFromServer(data): Observable<Subscription> {
        return this.loadingIconsService.deleteVisualAssetGroup(data.data.ID);
    }

    // isDisabledDelete(params): boolean {
    //     return params.data.Id === 0;
    //
    // }

}
