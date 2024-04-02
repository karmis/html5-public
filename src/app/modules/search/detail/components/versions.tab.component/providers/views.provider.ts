import {TitlesVersionViewsProvider} from "../../../../../../views/titles/modules/versions/providers/views.provider";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector} from "@angular/core";

@Injectable()
export class VersionsTabViewsProvider extends TitlesVersionViewsProvider {
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }
}
