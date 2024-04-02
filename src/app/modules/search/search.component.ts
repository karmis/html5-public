import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import { Subscription } from 'rxjs';
export class IMFXSearchComponent {

    protected viewsProvider;
    protected searchGridService;
    protected searchGridProvider;
    protected SearchColumnsProvider;
    protected saveViewModalProvider;
    protected searchSettingsProvider;
    protected searchThumbsProvider;
    protected searchFacetsProvider;
    protected mediaDetailProvider;
    public searchFormProvider;
    protected searchRecentProvider;
    protected searchAdvancedProvider;
    protected appSettings;
    protected searchGridConfig;
    protected searchViewsConfig;
    public routerEventsSubscr: Subscription;

    constructor(protected router: Router,
                protected route: ActivatedRoute) {
    }

    ngOnInit() {
        //this instanceof this.route.component
        // let componentRef = this;
        this.routerEventsSubscr = this.router.events.subscribe((event: NavigationEnd) => {
            // let router = this.router;
            // let route = this.route;
            // let currentComponent = this.route.component as Function;
            if (event instanceof NavigationEnd && this instanceof (this.route.component as Function)) {
                ///*debugger*/;
                this.searchGridProvider.refreshGridScroll();
            }
        }, error => console.error(error));
    }

    ngOnDestroy(){
        this.routerEventsSubscr.unsubscribe();
    }

    public getSearchGridProvider() {
        return this.searchGridProvider;
    }

    public getSearchFormProvider() {
        return this.searchFormProvider;
    }

    public getSearchGridConfig() {
        return this.searchGridConfig;
    }

    public getSearchViewsConfig() {
        return this.searchViewsConfig;
    }
}
