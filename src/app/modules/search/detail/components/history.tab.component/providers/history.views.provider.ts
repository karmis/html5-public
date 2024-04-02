import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";

export class HistoryViewsProvider extends ViewsProvider {
    config: ViewsConfig;
    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm:ss";
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
              @Inject(ApplicationRef) public appRef: ApplicationRef,
              @Inject(Injector) public injector: Injector) {
      super(compFactoryResolver, appRef, injector);
    }

  /**
   * @inheritDoc
   * @returns {Array}
   */
  getCustomColumns() {
      let columns = [
          {
              id: 0,
              name: 'Created By',
              field: 'CREATED_BY',
              minWidth: 150,
              resizable: true,
              sortable: true,
              multiColumnSort: false
          }, {
              id: 1,
              name: 'Created',
              field: 'CREATED_DT',
              minWidth: 150,
              width: 200,
              resizable: true,
              sortable: true,
              multiColumnSort: false,
              formatter: DatetimeFormatter,
              __deps: {
                  injector: this.injector,
                  datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
              }
          }, {
              id: 2,
              name: 'Action',
              field: 'ACTION_NAME',
              minWidth: 100,
              width: 250,
              resizable: true,
              sortable: true,
              multiColumnSort: false
          }, {
              id: 3,
              name: 'Log Entry',
              field: 'LogEntry',
              minWidth: 100,
              width: 350,
              resizable: true,
              sortable: true,
              multiColumnSort: false
          }
      ];
      return columns;
  }
}
