import { NativeNavigatorProvider } from '../../../providers/common/native.navigator.provider';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { BasketService } from '../../../services/basket/basket.service';
import { SlickGridProvider } from '../../../modules/search/slick-grid/providers/slick.grid.provider';
import { HttpService } from '../../../services/http/http.service';
import { Router } from '@angular/router';
import { IMFXModalProvider } from '../../../modules/imfx-modal/proivders/provider';
import { Observable, Subscription } from 'rxjs';
import { SecurityService } from "../../../services/security/security.service";
import { EventsService } from "../../../services/events/events.service"


export class EventsReqsSlickGridProvider extends SlickGridProvider {

    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public basketService: BasketService;
    private modalProvider: IMFXModalProvider;
    private httpService: HttpService;
    private nativeNavigatorProvider: NativeNavigatorProvider;
    protected securityService: SecurityService;
    private eventsService: EventsService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.modalProvider = injector.get(IMFXModalProvider);
        this.httpService = injector.get(HttpService);
        this.nativeNavigatorProvider = injector.get(NativeNavigatorProvider);
        this.securityService = injector.get(SecurityService);
        this.eventsService = injector.get(EventsService);
    }

    onRowDoubleClicked(data) {
        if (this.config.options.type && data && (data.row as any)) {
            this.openEventDetail();
        }
    }

    isDisabledDelete(params): boolean {
        return !this.securityService.hasPermissionByName('delete-event-request');
    }

    deleteFromServer(data): Observable<Subscription> {
        return new Observable((observe) => {
            this.eventsService.removeEvent(data.data.ID).subscribe(() => {
                this.refreshGrid(true);
                observe.next();
                observe.complete();
            })
        })
    }

    deleteRow() {
        console.error('😠');
    }


    openEventDetail() {
        if ((<any>this.getSelectedRow()).IsMulti == "Yes") {
            this.router.navigate(['events', 'multi', 'detail', this.getSelectedRow().ID]);
        } else {
            this.router.navigate(['events', 'single', 'detail', this.getSelectedRow().ID]);
        }
    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-addbasket') ||
            $(event.target).hasClass('icons-inbasket') ||
            $(event.target).hasClass('media-basket-button') ||
            $(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).closest('.slick-cell').hasClass('selected');
    }
}
