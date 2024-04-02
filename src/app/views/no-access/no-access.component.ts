import { Component } from "@angular/core";
import {NavigationStart, Router, RouterEvent} from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { ProfileService } from "../../services/profile/profile.service";
import { ConfigService } from '../../services/config/config.service';

@Component({
    selector: 'no-access',
    template: `
        <div style="
    display: flex;
    width: 100%;
    height: 100%;
    text-align: center;
    flex-direction:  column;
    opacity: 0.5;
">
            <div style="background-image: url(./assets/imfx-icons/access-denied.png);
            height: 100px;background-position: center;background-size: contain;display: block;width: 100%;position: relative;top: calc(50% - 50px);"></div>
            <h1 style="
    display: block;
    width: 100%;
    position: relative;
    top: calc(50% - 20px);
">Sorry, you don't have access to this page</h1>
        </div>
    `
})
export class NoAccessComponent {

    private defaultPage: string;
    private timeout;
    private defaultPageSubscription;
    private routerEventsSubscr;


    constructor(private router: Router,
                public localStorage: LocalStorageService,
                private profileService: ProfileService) {
        var compRef = this;
        this.profileService.defaultPage.subscribe((page) => {
            this.defaultPage = page;
            if (compRef.defaultPageSubscription) {
                compRef.defaultPageSubscription.unsubscribe();
            }
        });

        this.routerEventsSubscr = router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationStart) {
                this.ngOnDestroy();
            }
        });
    }

    ngAfterViewInit() {
        this.timeout = setTimeout(() => {
            if (this.defaultPage) {
                // this.router.navigate([ConfigService.getSetupsForRoutes().main]);
                this.router.navigate([this.defaultPage]);
            } else {
                this.router.navigate([ConfigService.getSetupsForRoutes().login]);
            }

        }, 5000);
    }

    ngOnDestroy() {
        clearTimeout(this.timeout);
        if(this.routerEventsSubscr)
            this.routerEventsSubscr.unsubscribe();
    }
}
