/**
 * Created by Pavel on 16.03.2017.
 */

import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from "@angular/router";
import {SessionStorageService} from "ngx-webstorage";
import {Inject, Injectable} from "@angular/core";
import {LoginComponent} from "../views/login/login.component";
import {RouteReuseProvider} from "./route.reuse.provider";
import {appRouter} from '../constants/appRouter';

@Injectable()
export class IMFXRouteReuseStrategy implements RouteReuseStrategy {

    handlers: { [key: string]: DetachedRouteHandle } = {};
    currentLanguage: string;
    public lastRouteConfigValues: { [key: string]: ActivatedRouteSnapshot } = {};
    public initedComponents = {};
    public mustBeReload = {};
    public currentComponentInstance = {};
    private reservedUrls = [
        /detail/,
        /loans\/create/,
        /production-search/,
        /media-logger/,
        /media-logger-task/,
        /assessment/,
        /segmenting/,
        /system\/config/,
        /dashboard/,
        /branding/,
        /consumer\/start/,
        /consumer/,
        // /simple/,
        // /media-logger-job/,
        /rce/,
        /clip-editor\/media/,
        /clip-editor\/version/,
        /acquisitions\/new-tpl/,
        /acquisitions\/new-tpl/,
        /acquisitions\/new/,
        /acquisitions\/edit/,
        /component-qc/,
        /events\/single/,
        /events\/multi/,
        /confidence-monitoring/
    ];
    private justFirstRestore: boolean = true;

    // : { [key: string]: ComponentRef }

    constructor(
        @Inject(SessionStorageService) private storage: SessionStorageService,
        @Inject(RouteReuseProvider) private routeReuseProvider: RouteReuseProvider,
    ) {
        this.currentLanguage = this.storage.retrieve('base.settings.lang');
        this.routeReuseProvider.clearRouteRequest.subscribe((url) => {
            this.clearCacheByUrl(url);
        })
    }

    isFirstLocation() {
        let router = appRouter.login;
        return !this.lastRouteConfigValues || this.lastRouteConfigValues.future.routeConfig.path == router;
    }

    storeInitedCompInstances(key: string, excludeCurrent: boolean = false) {
        const initedComps = this.initedComponents;
        let resArr = [];

        for (let prop in initedComps) {
            const inst = initedComps[prop].instance;
            if (this.currentComponentInstance !== inst)
                resArr.push(inst);
        }

        this.mustBeReload[key] = resArr;
    }

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // console.debug('CustomReuseStrategy:shouldDetach', route);
        let url = route.url.join("/") || route.parent.url.join("/");
        for (let reservedUrl of this.reservedUrls) {
            if (reservedUrl.test(url)) {
                return;
            }
        }
        return true;
    }

    store(route: any /*ActivatedRouteSnapshot*/, handle: DetachedRouteHandle): void {
        // console.debug('CustomReuseStrategy:store', route, handle);
        let url = route.url.join("/") || route.parent.url.join("/");
        this.handlers[url] = handle;
        if (handle) {
            this.initedComponents[url] = handle['componentRef'];
        }
        // this.handlers[route.routeConfig.path || route.routeConfig.routerPath] = handle;
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        // console.debug('CustomReuseStrategy:shouldAttach', route);
        let newLang = this.storage.retrieve('base.settings.lang');
        if (newLang != this.currentLanguage) {
            this.currentLanguage = newLang;
            this.handlers = {};
            console.debug('CustomReuseStrategy:shouldAttach', false);
            return false;
        }
        if (route.component == LoginComponent) {
            this.handlers = {};
            return false;
        }
        let url = route.url.join("/") || route.parent.url.join("/");
        for (let reservedUrl of this.reservedUrls) {
            if (reservedUrl.test(url)) {
                return false;
            }
        }
        let strategyRef = this;
        this.justFirstRestore && setTimeout(() => {
            delete strategyRef.handlers[url];
        });
        return !!route.routeConfig && !!this.handlers[url];
        // return !!route.routeConfig && !!this.handlers[route.routeConfig.path || route.routeConfig.routerPath];
    }

    retrieve(route: any /*ActivatedRouteSnapshot*/): DetachedRouteHandle {
        // console.debug('CustomReuseStrategy:retrieve', route);
        if (!route.routeConfig) return null;
        return this.handlers[route.url.join("/") || route.parent.url.join("/")];
        // return this.handlers[route.routeConfig.path || route.routeConfig.routerPath];
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        // console.debug('CustomReuseStrategy:shouldReuseRoute', future, curr);

        if (future.routeConfig !== curr.routeConfig) {
            this.lastRouteConfigValues = {
                'future': future,
                'curr': curr
            };
            return false;
        } else {
            return true;
        }

    }

    private clearCacheByUrl(url: string) {
        delete this.handlers[url];
    }

}
