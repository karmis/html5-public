/**
 * Created by Sergey Trizna on 27.11.2017.
 */
import {CoreComp} from "./core.comp";
import { ActivatedRoute, Router } from "@angular/router";
import {Injector} from "@angular/core";
import {SlickGridComponent} from "../modules/search/slick-grid/slick-grid";
import {SearchThumbsComponent} from "../modules/search/thumbs/search.thumbs";
import {SplitProvider} from "../providers/split/split.provider";
import {SearchViewsComponent} from "../modules/search/views/views";
import {SlickGridConfigModuleSetups} from "../modules/search/slick-grid/slick-grid.config";
import { IMFXRouteReuseStrategy } from '../strategies/route.reuse.strategy';

export class CoreSearchComponent extends CoreComp {

    public slickGridComp: SlickGridComponent;
    public searchThumbsComp?: SearchThumbsComponent;
    public viewsComp?: SearchViewsComponent;
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
    public searchRecentProvider;
    protected searchAdvancedProvider;
    protected appSettings;
    protected searchGridConfig;
    protected searchViewsConfig;
    public searchAdvancedConfig;
    public searchFormConfig;
    public searchThumbsConfig;
    public exportProvider;
    public searchFacetsConfig;

    public splitProvider: SplitProvider;
    constructor(protected injector: Injector) {
        super(injector);

        this.splitProvider = injector.get(SplitProvider);
    }

    ngOnInit() {
        let route = this.injector.get(ActivatedRoute);


        route.parent && route.parent.url.subscribe((data)=>{
            //common change url handler
            if (this instanceof (route.component as Function)){
                this.splitProvider.resetToNavStart();
            }

            this.commonInitActions(data);
        }, error => console.error(error));
    }

    /**custom LC hook for not destroyed components(saved by reuseStrategy).
     * Work via(within callbackFn) ActivatedRoute.parent.url.subscribe.
     * Work always.
     */
    onInitCustomAlways() {
        // override
    }

    /**custom LC hook for not destroyed components(saved by reuseStrategy).
     * Work via(within callbackFn) ActivatedRoute.parent.url.subscribe.
     * Work if component is exist.
     */
    onInitCustomIfExist() {
        // override
    }

    commonInitActions(data){
        const router = this.injector.get(Router)
            , strategy = (<IMFXRouteReuseStrategy>router.routeReuseStrategy)
            , url = data.join('/');


        this.onInitCustomAlways();

        //if component not inited
        if (!strategy.initedComponents[url]) {
            return;
        }

        this.onInitCustomIfExist();

        this.slickGridComp && this.slickGridComp.whenGridReady((gridCompoment)=>{
            if(gridCompoment.provider.getGridEl()){
                setTimeout(() => {
                    if((<SlickGridConfigModuleSetups>gridCompoment.config.options.module).refreshOnNavigateEnd){
                        //This actions will be perfopmed after refreshGrid procedure
                        if (typeof gridCompoment.provider.refreshGridLazy == 'function') {
                            gridCompoment.provider.refreshGridScroll();
                            gridCompoment.provider.refreshGridLazy();
                        } else {
                            gridCompoment.whenGridRendered(()=>{
                                gridCompoment.provider.refreshGridScroll();
                            });
                            gridCompoment.provider.refreshGrid(true);
                        }
                    } else {
                        gridCompoment.provider.refreshGridScroll();
                    }
                });
            }
        });
    }

    /**
     * allow do something actions on inited marked pages(saved previously).
     * @param key
     * @param callBack
     */
    refreshSpecComps(key:string, callBack: () => void) {
        const router = this.injector.get(Router);
        let mustBeReload: Array<any> = (<IMFXRouteReuseStrategy>router.routeReuseStrategy).mustBeReload[key];
        if(mustBeReload) {
            const index = (Array.isArray(mustBeReload))
                ? mustBeReload.indexOf(this)
                : -1;

            if (index !== -1) {
                mustBeReload.splice(index,1);
                callBack();
            }
        }
    }

    public getSearchGridProvider() {
        return this.searchGridProvider;
    }

    public getSearchFormProvider() {
        return this.searchFormProvider;
    }

    //
    public getSearchGridConfig() {
        return this.searchGridConfig;
    }

    public getSearchViewsConfig() {
        return this.searchViewsConfig;
    }

    /**
     *
     * @param notInclude
     */
    public getSplitFlexSize(notInclude: number[]): number {
        return this.splitProvider.getFlexSize(notInclude);
    }

    /**
     *
     * @param order
     * @param defaultValue
     */
    public getSplitAreaSize(order: number[], defaultValue:number): number{
        return this.splitProvider.getAreaSize(order,defaultValue);
    }

    /**
     * Use for set minSize via px, when split actually uses 'percent' metrics
     *
     * @param pxSize
     * @param comp SplitComponent
     */
    public getSplitAreaMinSize(pxSize: number, comp): number{
        return this.splitProvider.getAreaMinSize(pxSize, comp);
    }

    /**
     *
     * @param order
     * @param value
     * @param defaultValue
     * @param context
     * @param callback
     * @param isAvailable
     */
    public getSplitAreaVisible(
        order: number[],
        value: boolean,
        defaultValue:boolean,
        context: any,
        callback: (a:boolean)=> void,
        isAvailable: boolean = false
    ): boolean {

        if (!isAvailable) {
            return false;
        }

        let isVisible = this.splitProvider.getAreaVisible(order, value, defaultValue);
        try{
            //reduce the number of change callbacks
            if (value != isVisible ){
                context = context ? context : this;

                if (typeof callback == 'function') {
                    callback.call(context, isVisible);
                }
                // console.log('callback is running', isVisible);
            }

        }catch(e){
            console.log('Callback for savingState don`t work!!', e);
        }

        return isVisible;
    }

    /**
     *
     * @param index
     * @param event
     */
    public saveSplitSizes(index: number, event: any/*SplitSizesFromEvent*/): void {
        this.splitProvider.saveSizes(index, event);
    }
}
