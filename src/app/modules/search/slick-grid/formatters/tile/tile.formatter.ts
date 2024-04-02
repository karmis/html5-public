import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {ArrayType} from "@angular/compiler/src/output/output_ast";

@Component({
  selector: 'tile-formatter-comp',
  templateUrl: './tpl/index.html',
  styleUrls: [
    'styles/index.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TileFormatterComp {
  private params;
  public injectedData: SlickGridFormatterData;
  private showingFields: Array<string>;
  private isThumb: boolean = true;
  private isIcons: boolean = true;

  constructor(private injector: Injector) {
    this.injectedData = this.injector.get('data');
    this.params = this.injectedData.data;
    this.showingFields = this.params.columnDef.source || [];
    this.isThumb = this.params.columnDef.isThumbnails;
    this.isIcons = this.params.columnDef.isIcons;
  }
}
export function TileFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {

  return commonFormatter(TileFormatterComp, {
    rowNumber: rowNumber,
    cellNumber: cellNumber,
    value: value,
    columnDef: columnDef,
    data: dataContext
  });
}


