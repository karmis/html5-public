
import {Router} from "@angular/router";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { Subscription, Observable, Subject } from 'rxjs';
import { SlickGridProvider } from '../../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SettingsGroupsService } from '../../../../../../../../services/system.config/settings.groups.service';

export class SettingsGroupsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public settingsGroupsService: SettingsGroupsService
    groupDeleted = new Subject<number>()


    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.settingsGroupsService = injector.get(SettingsGroupsService);
    }


    deleteFromServer(data) : Observable<Subscription>{
        this.groupDeleted.next(data.data.Id);
        return this.settingsGroupsService.delete(data.data.Id);
    }

    isDisabledDelete(params): boolean {
        return params.data.Id === 0;

    }
}
