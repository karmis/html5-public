import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TimecodeInputFormatter} from "../../../../slick-grid/formatters/timecode-input/timecode.input.formatter";
import {DeleteFormatter} from "../../../../slick-grid/formatters/delete/delete.formatter";
import {TextFormatter} from "../../../../slick-grid/formatters/text/text.formatter";
import {Select2Formatter} from "../../../../slick-grid/formatters/select2/select2.formatter";
import { SectorsChannelsFormatter } from '../../../../slick-grid/formatters/sectors-channels/sectors.channels.formatter';
import { ImageLinkFormatter } from '../../../../slick-grid/formatters/image-link/image.link.formatter';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import {SlickGridColumn} from "../../../../slick-grid/types";

export class AVFaultsViewsProvider extends ViewsProvider {
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
  getCustomColumns(sgp: SlickGridProvider = null, readOnly?: boolean) {
      let columns = <SlickGridColumn>[{
          id: 0,
          name: 'Ctnr#',
          field: 'CTNR_NUM',
          minWidth: 50,
          width: 50,
          resizable: true,
          sortable: true,
          multiColumnSort: false
      }, {
          id: 1,
          name: 'Type',
          field: 'TypeName',
          minWidth: 50,
          width: 50,
          resizable: true,
          sortable: true,
          multiColumnSort: false
      }];
      if (readOnly) {
          columns.push({
              id: 2,
              name: 'Fault',
              field: 'FaultName',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: true,
              multiColumnSort: false,
          });
      } else {
          columns.push({
              id: 2,
              name: 'Fault',
              field: 'FAULT_ID',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: true,
              multiColumnSort: false,
              formatter: Select2Formatter,
              __deps: {
                  injector: this.injector,
                  data: {
                      withCheckboxes: true,
                      grouping: true
                  }
              }
          });
      }
      if (readOnly) {
          columns.push({
              id: 3,
              name: 'Sev.',
              field: 'SEVERITY',
              minWidth: 50,
              width: 50,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          });
      } else {
          columns.push({
              id: 3,
              name: 'Sev.',
              field: 'SEVERITY',
              minWidth: 100,
              width: 100,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: TextFormatter,
              __deps: {
                  injector: this.injector,
                  data: {
                      validationEnabled: false
                  }
              }
          });
      }
      if (readOnly) {
          columns.push({
              id: 4,
              name: 'Timecode In',
              field: 'TIMECODE_IN',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          });
          columns.push({
              id: 5,
              name: 'Timecode Out',
              field: 'TIMECODE_OUT',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          });
      } else {
          columns.push({
              id: 4,
              name: 'Timecode In',
              field: 'TIMECODE_IN',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: TimecodeInputFormatter,
              __deps: {
                  injector: this.injector
              },
          });
          columns.push({
              id: 5,
              name: 'Timecode Out',
              field: 'TIMECODE_OUT',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: TimecodeInputFormatter,
              __deps: {
                  injector: this.injector
              },
          });
      }

      if (readOnly) {
          columns.push({
              id: 6,
              name: 'Dur.',
              field: 'DURATION',
              minWidth: 150,
              width: 150,
              resizable: true,
              sortable: true,
              multiColumnSort: false
          });
          columns.push({
              id: 7,
              name: 'Sectors',
              field: 'SECTORS',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          });
      } else {
          columns.push({
              id: 6,
              name: 'Dur.',
              field: 'DURATION',
              minWidth: 150,
              width: 150,
              resizable: true,
              sortable: true,
              multiColumnSort: false,
              cssClass: 'like-input-font'
          });
          columns.push({
              id: 7,
              name: 'Sectors',
              field: 'SECTORS',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              cssClass: 'editable',
              multiColumnSort: false,
              formatter: SectorsChannelsFormatter,
              __deps: {
                  injector: this.injector
              }
          });
      }

      columns.push({
          id: 8,
          name: 'Attachments',
          field: 'Attaches',
          minWidth: 100,
          width: 200,
          resizable: true,
          sortable: false,
          multiColumnSort: false,
          formatter: ImageLinkFormatter,
          __deps: {
              injector: this.injector,
              datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
          }
      });
      if (readOnly) {
          columns.push({
              id: 9,
              name: 'Notes',
              field: 'NOTES',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false
          });
      } else {
          columns.push({
              id: 9,
              name: 'Notes',
              field: 'NOTES',
              minWidth: 100,
              width: 200,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: TextFormatter,
              __deps: {
                  injector: this.injector,
                  data: {
                      validationEnabled: false
                  }
              }
          });
      }

      if (!readOnly) {
          columns.push({
              id: 10,
              field: "Delete",
              name: "",
              width: 50,
              resizable: false,
              sortable: false,
              multiColumnSort: false,
              formatter: DeleteFormatter,
              __deps: {
                  injector: this.injector
              }
          });
      }

      return columns;
  }
}
