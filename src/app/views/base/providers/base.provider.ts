/**
 * Created by Sergey Trizna on 08.01.2018.
 */
import {
    ApplicationRef,
    Compiler, ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    EmbeddedViewRef,
    Inject,
    Injectable,
    InjectionToken,
    Injector,
    NgModuleFactory,
    Provider,
    ReflectiveInjector,
    Type, ViewContainerRef,
    // ViewContainerRef
} from "@angular/core";

@Injectable()
export class BaseProvider {
    private _buildMode: 'dev_version' | string;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector,
                private compiler: Compiler,
                // private vcr: ViewContainerRef
    ) {
        this._buildMode = (<any>window).IMFX_VERSION;
    }

    get isDevMode(): boolean {
        return this._buildMode === 'dev_version';
    }

    get isDevServer(): boolean {//for dev and branches
        return ((<any>window).IMFX_VERSION.indexOf('d') > -1) || ((<any>window).IMFX_VERSION.indexOf('px-') > -1);
    }

    get isTestServer(): boolean {
        return (<any>window).IMFX_VERSION.indexOf('t') > -1;
    }

    get isCloudServer(): boolean {
        return (<any>window).location.host === 'imfxv3.tmd.tv';
    }

    private _outletComponent: any;

    get outletComponent(): any {
        return this._outletComponent;
    }

    set outletComponent(comp: any) {
        this._outletComponent = comp;
    }

    // buildComponent(comp: any, data: Object, element: HTMLElement | any, delay: boolean = false): ComponentRef<any> {
    //     if (!element) {
    //         return;
    //     }
    //     let componentRef = this.createComponent(comp, [{provide: 'data', useValue: data}]);
    //     this.insertComponent(componentRef, element);
    //
    //     return componentRef;
    // }

    /**
     *
     * @param componentRef
     * @param element
     * Attach View to root app View
     */
    public insertComponent(componentRef, element) {
        this.appRef.attachView(componentRef.hostView);
        let domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // debugger;
        if (element) {
            (<any>$(element)).html(domElem);
        } else {
            throw new Error('Element not found');
        }
    }

    /**
     *
     * @param containerRef
     * @param compRef
     * @param elementContainer
     * Attach View to defined view
     */
    public insertComponentIntoView(containerRef: ViewContainerRef, compRef: ComponentRef<any>, elementContainer) {
        let domElem = (compRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // sourceView.clear()
        containerRef.insert(compRef.hostView);
        compRef.changeDetectorRef.markForCheck();

        if (elementContainer) {
            (<any>$(elementContainer)).html(domElem);
        } else {
            throw new Error('Element not found');
        }

        return compRef;
    }

    public createComponent(comp: any, resolveData: Provider[]): ComponentRef<any> {
        let factory = this.compFactoryResolver.resolveComponentFactory(comp);
        let resolvedInputs = ReflectiveInjector.resolve(resolveData);

        let injector = ReflectiveInjector.fromResolvedProviders(
            resolvedInputs
        );
        return factory.create(injector);

        // let factory = this.compFactoryResolver.resolveComponentFactory(comp);
        // // Injector.create([{provide: SomeClass, deps: []], parentInjector);
        // const injector = Injector.create({providers: [{provide: comp, deps: resolveData}]});
        // // let resolvedInputs = ReflectiveInjector.resolve(resolveData);
        // //
        // // let injector = ReflectiveInjector.fromResolvedProviders(
        // //     resolvedInputs
        // // );
        // return factory.create(injector);

    }

    // public createComponentByPath(path: string, comp: any, resolveData: Provider[]): Promise<ComponentRef<any>> {
    //     return new Promise<ComponentRef<any>>((resolve, reject) => {
    //         this._loader.load(path).then((_ngModuleFactory: NgModuleFactory<any>) => {
    //             const _ngModuleRef: NgModuleRef<any> = _ngModuleFactory.create(this.injector);
    //             const factory = _ngModuleRef.componentFactoryResolver.resolveComponentFactory(comp);
    //             const resolvedInputs = ReflectiveInjector.resolve(resolveData);
    //             const injector = ReflectiveInjector.fromResolvedProviders(
    //                 resolvedInputs
    //             );
    //             resolve(factory.create(injector));
    //         }).catch((e) => {
    //             console.error(e);
    //             reject(e);
    //
    //         });
    //     });
    // }

    // https://github.com/angular/angular/issues/31886#issuecomment-516872268
    createComponentByPath(path: any, comp: Type<any>, resolveData): Promise<ComponentFactory<any>> {
        return new Promise<ComponentFactory<any>>((resolve, reject) => {
            return path.loadChildren().then(moduleOrFactory => {
                if (moduleOrFactory instanceof NgModuleFactory) {
                    return moduleOrFactory;
                } else {
                    return this.compiler.compileModuleAsync(moduleOrFactory);
                }
            }).then(factory => {
                const providers = [resolveData];
                const lazyModuleInjector = Injector.create({
                    providers,
                    parent: this.injector,
                    name: 'LAZY_MODULE_PROVIDER'
                });

                const lazyModuleRef = factory.create(lazyModuleInjector);
                const componentType: Type<any> = lazyModuleRef.instance.entry;
                const componentFactory: ComponentFactory<any> = lazyModuleRef.componentFactoryResolver.resolveComponentFactory(componentType);
                resolve(componentFactory);
            });
        });


        // return path.loadChildren().then(moduleOrFactory => {
        //     if (moduleOrFactory instanceof NgModuleFactory) {
        //         return moduleOrFactory;
        //     } else {
        //         return this.compiler.compileModuleAsync(moduleOrFactory);
        //     }
        // }).then((factory: NgModuleFactory<any>) => {
        //     this.lazyModuleRef = factory.create(lazyModuleInjector);
        //     const componentType: Type<any> = this.lazyModuleRef.instance.entryComponentsType;
        //     const componentFactory = this.lazyModuleRef.componentFactoryResolver.resolveComponentFactory(componentType);
        //     // ... either using ViewComponentRef interface: https://angular.io/api/core/ViewContainerRef
        //     const componentRefA = this.viewContainerRef.createComponent(componentFactory);
        //     // ... or using direct ComponentFactory interface: https://angular.io/api/core/ComponentFactory
        //     const componentRefB = componentFactory.create(anyInjector, ...);
        // });
        //



        ///////
        // // ROUTES;
        // // './modules/create.subversion.modal'
        // debugger

        //
        // return new Promise<ComponentRef<any>>((resolve, reject) => {
        //
        // });


        // const moduleRef = factory.create(this.injector);
        // const eps: any = moduleRef.injector.get((<any>factory.moduleType).eps);
        // return eps;
        // });
        ///////


        // return import(path.src)
        //     .then(m => m.MyModule)
        //     .then(moduleOrFactory => {
        //         debugger
        //         if (moduleOrFactory instanceof NgModuleFactory) {
        //             return moduleOrFactory;
        //         } else {
        //             return this.compiler.compileModuleAsync(moduleOrFactory);
        //         }
        //     })
        //     .then(module => {
        //         debugger
        //         // module.get
        //     })
    }


}
