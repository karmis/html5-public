import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {VersionInsideUploadSearchFormProvider} from "./search.form.provider";
import {SlickGridProvider} from "../../../../search/slick-grid/providers/slick.grid.provider";

export class VersionInsideUploadSlickGridProvider extends SlickGridProvider {
  public compFactoryResolver?: ComponentFactoryResolver;
  public appRef?: ApplicationRef;
  public searchFormProvider?: VersionInsideUploadSearchFormProvider;
  constructor(@Inject(Injector) public injector: Injector) {
    super(injector);
    this.searchFormProvider = injector.get(VersionInsideUploadSearchFormProvider);
    this.compFactoryResolver = injector.get(ComponentFactoryResolver);
    this.appRef = injector.get(ApplicationRef);
  }
  /**
   * On double click by row
   * @param $event
   */
  onRowDoubleClicked() {
  }
}
