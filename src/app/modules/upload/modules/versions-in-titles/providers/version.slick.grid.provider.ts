import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {VersionInsideUploadSearchFormProvider} from "./search.form.provider";
import {SlickGridProvider} from "../../../../search/slick-grid/providers/slick.grid.provider";
import { appRouter } from '../../../../../constants/appRouter';

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

  openDetail() {
      const destination = this.config.options.type.replace('inside-', '').toLowerCase();
      this.router.navigate([
        appRouter[destination].detail.substr(0, appRouter[destination].detail.lastIndexOf('/')),
        this.getSelectedRow().ID
      ]);
  }
}
