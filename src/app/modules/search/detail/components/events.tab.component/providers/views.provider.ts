import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TimecodeInputFormatter} from "../../../../slick-grid/formatters/timecode-input/timecode.input.formatter";
import {Select2Formatter} from "../../../../slick-grid/formatters/select2/select2.formatter";
import {DeleteFormatter} from "../../../../slick-grid/formatters/delete/delete.formatter";
import {TextFormatter} from "../../../../slick-grid/formatters/text/text.formatter";
import {HiddenContentFormatter} from "../../../../slick-grid/formatters/hidden-content/hidden.content.formatter";
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { SlickGridColumn } from '../../../../slick-grid/types';

export class EventsViewsProvider extends ViewsProvider {
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
      let columns = <SlickGridColumn>[
          {
              id: 0,
              field: "PRT_NUM",
              name: "Part#",
              width: 50,
              minWidth: 50,
              sortable: false,
              resizable: true,
              formatter: HiddenContentFormatter,
              __deps: {
                  injector: this.injector,
                  data: []
              }
          }, {
              id: 1,
              field: "SQ_NUM",
              name: "Seq#",
              width: 50,
              minWidth: 50,
              sortable: false,
              resizable: true
          }
      ];

      if (readOnly) {
          columns.push({
              id: 2,
              field: "TYPE_text",
              name: "Type",
              width: 330,
              minWidth: 330,
              resizable: true,
              sortable: false
          });
          columns.push({
              id: 3,
              field: "SOMS",
              name: "In",
              width: 190,
              minWidth: 190,
              sortable: false,
              resizable: true
          });
          columns.push({
              id: 4,
              field: "EOMS",
              name: "Out",
              width: 190,
              minWidth: 190,
              sortable: false,
              resizable: true
          });
      }
      else {
          columns.push({
              id: 2,
              field: "TYPE",
              name: "Type",
              width: 330,
              minWidth: 330,
              resizable: true,
              sortable: false,
              multiColumnSort: false,
              formatter: Select2Formatter,
              __deps: {
                  injector: this.injector,
                  data: []
              }
          });
          columns.push({
              id: 3,
              field: "SOMS",
              name: "In",
              width: 190,
              minWidth: 190,
              formatter: TimecodeInputFormatter,
              __deps: {
                  injector: this.injector,
              },
              sortable: false,
              resizable: true
          });
          columns.push({
              id: 4,
              field: "EOMS",
              name: "Out",
              width: 190,
              minWidth: 190,
              formatter: TimecodeInputFormatter,
              __deps: {
                  injector: this.injector
              },
              sortable: false,
              resizable: true
          });
      }

      if (!readOnly) {
          columns.push({
              id: 5,
              field: "DURATION_text",
              name: "Duration",
              width: 190,
              minWidth: 190,
              sortable: false,
              resizable: true,
              cssClass: 'like-input-font'
          });
          columns.push({
              id: 6,
              field: "PRT_TTL",
              name: "Title",
              width: 300,
              minWidth: 300,
              sortable: false,
              resizable: true,
              formatter: TextFormatter,
              __deps: {
                  injector: this.injector,
                  data: {
                      validationEnabled: false
                  }
              }
          });
          columns.push({
              id: 7,
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
      else {
          columns.push({
              id: 5,
              field: "DURATION_text",
              name: "Duration",
              width: 190,
              minWidth: 190,
              sortable: false,
              resizable: true
          });
          columns.push({
              id: 6,
              field: "PRT_TTL",
              name: "Title",
              width: 300,
              minWidth: 300,
              sortable: false,
              resizable: true
          });
      }
      return columns;
  }
}
