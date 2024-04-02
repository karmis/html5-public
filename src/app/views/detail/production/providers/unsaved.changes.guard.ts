import { CanDeactivate } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { ProductionDetailComponent } from "../production.detail.component";
import { ProductionDetailProvider } from "./production.detail.provider";
import { PromptDialogComponent } from "../../../../modules/prompt.dialog/prompt.dialog.component";
import { map } from "rxjs/operators";

@Injectable()
export class UnsavedChangesGuard implements CanDeactivate<ProductionDetailComponent> {

    constructor(private productionDetailProvider: ProductionDetailProvider,
                private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {

    }

    canDeactivate() {
        if (!this.productionDetailProvider.isChange) {
            return true;
        }

        // 1. Create a component reference from the component
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(PromptDialogComponent)
            .create(this.injector);

        // 2. Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(componentRef.hostView);

        // 3. Get DOM element from component
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // 4. Append DOM element to the body
        document.getElementsByClassName('common-app-wrapper')[0].append(domElem);

        return componentRef.instance.onSubmit.pipe(
            map(agree => {
                this.appRef.detachView(componentRef.hostView);
                componentRef.destroy();
                return agree
            })
        );

    }

}
