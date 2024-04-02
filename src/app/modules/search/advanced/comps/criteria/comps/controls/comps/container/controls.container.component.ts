/**
 * Created by Sergey Trizna on 09.12.2016.
 */
import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver, EmbeddedViewRef,
    Input,
    ReflectiveInjector,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";

import {IMFXAdvancedCriteriaControlTextBoxComponent} from "./comps/textbox/textbox.component";
import {IMFXAdvancedCriteriaControlNumberBoxComponent} from "./comps/numberbox/numberbox.component";
import {IMFXAdvancedCriteriaControlDataSizeComponent} from "./comps/datasize/datasize.component";
import {IMFXAdvancedCriteriaControlCheckBoxComponent} from "./comps/checkbox/checkbox.component";
import {IMFXAdvancedCriteriaControlComboMultiComponent} from "./comps/combomulti/combomulti.component";
import {IMFXAdvancedCriteriaControlComboSingleComponent} from "./comps/combosingle/combosingle.component";
import {IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent} from "./comps/customstatus/custom.status.component";
import {IMFXAdvancedCriteriaControlSignedDateTimeComponent} from "./comps/signeddatetime/signeddatetime.component";
import {IMFXAdvancedCriteriaControlLookupSearchUsersComponent} from "./comps/lookupsearch/users/lookup.usres.comp";
import {IMFXAdvancedCriteriaControlLookupSearchUsersModalComponent} from "./comps/lookupsearch/users.modal/lookup.users.modal.comp";
import {IMFXAdvancedCriteriaControlHierarchicalLookupSearchLocationModalComponent} from "./comps/hierarchical/location/location.modal.comp";
import {IMFXAdvancedCriteriaControlXMLComponent} from "./comps/xml/xml.component";
import {AdvancedSearchControlRefType} from "../../../../../../types";
import {IMFXAdvancedCriteriaControlHierarchicalLookupSearchTaxonomyModalComponent} from "./comps/lookupsearch/taxonomy/taxonomy.modal.comp";
import {IMFXAdvancedCriteriaControlTimeComponent} from "./comps/time/time.component";
import {IMFXAdvancedCriteriaControlDateTypedComponent} from "./comps/datetyped/datetyped.component";

@Component({
    selector: 'advanced-criteria-controls-container',
    entryComponents: [
        IMFXAdvancedCriteriaControlTimeComponent,
        IMFXAdvancedCriteriaControlCheckBoxComponent,
        IMFXAdvancedCriteriaControlTextBoxComponent,
        IMFXAdvancedCriteriaControlComboMultiComponent,
        IMFXAdvancedCriteriaControlComboSingleComponent,
        IMFXAdvancedCriteriaControlNumberBoxComponent,
        IMFXAdvancedCriteriaControlDataSizeComponent,
        IMFXAdvancedCriteriaControlSignedDateTimeComponent,
        IMFXAdvancedCriteriaControlLookupSearchUsersComponent,
        IMFXAdvancedCriteriaControlLookupSearchUsersModalComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchLocationModalComponent,
        IMFXAdvancedCriteriaControlXMLComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchTaxonomyModalComponent,
        IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent,
        IMFXAdvancedCriteriaControlDateTypedComponent
    ], // Reference to the components must be here in order to dynamically create them
    templateUrl: "./tpl/index.html",
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaControlsContainerComponent {
    currentComponent = null;
    @ViewChild('controlsContainer', {read: ViewContainerRef, static: false}) dynamicComponentContainer: ViewContainerRef;
    // component: Class for the component you want to create
    // inputs: An object with key/value pairs mapped to input name/input value
    // @Input() set compData(data: AdvancedSearchControlRefType) {
    //     this.initControl()
    // }

    constructor(private resolver: ComponentFactoryResolver, private cdr: ChangeDetectorRef) {
    }

    initControl(data: AdvancedSearchControlRefType) {
        if (!data) {
            return;
        }

        // Inputs need to be in the following format to be resolved properly
        let inputProviders = Object.keys(data.inputs).map(
            (inputName) => {
                return {
                    provide: inputName, useValue: data.inputs[inputName]
                };
            });
        let resolvedInputs = ReflectiveInjector.resolve(inputProviders);

        // We create an injector out of the data we want to pass down and this components injector
        let injector = ReflectiveInjector.fromResolvedProviders(
            resolvedInputs, this.dynamicComponentContainer.parentInjector
        );

        // We create a factory out of the component we want to create
        let factory = this.resolver.resolveComponentFactory(data.component);

        // We create the component using the factory and the injector
        let component = factory.create(injector);

        // We insert the component into the dom container
        this.dynamicComponentContainer.insert(component.hostView);

        let domElem = (component.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
        // we add DOM elements according hierarchy
        (<any>$(this.dynamicComponentContainer.element.nativeElement)).html(domElem);

        // We can destroy the old component is we like by calling destroy
        if (this.currentComponent) {
            this.currentComponent.destroy();
        }

        this.currentComponent = component;
        this.cdr.detectChanges();
    }
}
