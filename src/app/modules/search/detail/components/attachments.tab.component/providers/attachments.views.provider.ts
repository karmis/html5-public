import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";
import {PreviewFilesFormatter} from "../../../../slick-grid/formatters/preview-files/preview-files.formatter";
import {DownloadFormatter} from "../../../../slick-grid/formatters/download/download.formatter";

export class AttachmentsViewsProvider extends ViewsProvider {
  config: ViewsConfig;

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
              name: 'Filename',
              field: 'Filename',
              minWidth: 150,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          },
          {
              id: 1,
              name: 'Title',
              field: 'Title',
              minWidth: 150,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          },
          {
              id: 2,
              name: 'Added By',
              field: 'CreatedBy',
              minWidth: 50,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          },
          {
              id: 3,
              name: 'Added On',
              field: 'Created',
              minWidth: 50,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: DatetimeFormatter,
              __deps: {
                  injector: this.injector,
                  datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
              }
          },
          {
              id: 4,
              name: '',
              field: 'Download',
              minWidth: 50,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: DownloadFormatter,
              __deps: {
                  injector: this.injector
              }
          },
          {
              id: 5,
              name: '',
              field: 'PreviewFiles',
              minWidth: 50,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: PreviewFilesFormatter,
              __deps: {
                  injector: this.injector
              }
          }
      ];
      return columns;
  }
}
