import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TagFormatter} from "../../../../slick-grid/formatters/tag/tag.formatter";
import {ColorIndicatorFormatter} from "../../../../slick-grid/formatters/color-indicator/color.indicator.formatter";
import {TimecodeStringFormatter} from "../../../../slick-grid/formatters/timecode-string/timecode.string.formatter";
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import {SlickGridColumn} from "../../../../slick-grid/types";

export class TaggingViewsProvider extends ViewsProvider {
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
  getCustomColumns(sgp: SlickGridProvider = null, hasTagColumn?: boolean) {
      let columns = <SlickGridColumn>[
          {
              id: -1,
              field: "*",
              name: "",
              width: 20,
              sortable: false,
              resizable: false,
              formatter: ColorIndicatorFormatter,
              __deps: {
                  injector: this.injector
              }
          }, {
              id: 2,
              field: "InTc",
              name: "In",
              width: 110,
              formatter: TimecodeStringFormatter,
              sortable: true,
              resizable: true,
              __deps: {
                  injector: this.injector
              }
          }, {
              id: 3,
              field: "OutTc",
              name: "Out",
              width: 110,
              formatter: TimecodeStringFormatter,
              sortable: true,
              resizable: true,
              __deps: {
                  injector: this.injector
              }
          }, {
              id: 4,
              field: "DurationTc",
              name: "Duration",
              width: 110,
              sortable: false,
              resizable: true
          }, {
              id: 5,
              field: "Notes",
              name: "Notes",
              width: 330,
              sortable: true,
              resizable: true
          }
      ]
      if (hasTagColumn) {
          columns.push({
              id: 6,
              field: "Tags",
              name: "Tags",
              width: 240,
              sortable: true,
              resizable: true,
              formatter: TagFormatter,
              __isCustom: true,
              __text_id: 'tags',
              __deps: {
                  injector: this.injector,
                  data: {tagsEditable: false}
              }
          });
      }
      columns.push({
          id: 7,
          field: "TagType",
          name: "Type",
          width: 100,
          sortable: true,
          resizable: true
      });
      return columns;
  }
}
