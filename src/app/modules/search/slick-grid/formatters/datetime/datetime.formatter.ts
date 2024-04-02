import {ChangeDetectionStrategy, Component, Inject, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'datetime-formatter-comp',
  templateUrl: './tpl/index.html',
  styleUrls: [
    'styles/index.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DatetimeFormatterComp {
  private params;
  public injectedData: SlickGridFormatterData;

  constructor(private injector: Injector,
              @Inject(TranslateService) protected translate: TranslateService) {
    this.injectedData = this.injector.get('data');
    this.params = this.injectedData.data;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}
export function DatetimeFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {

  return commonFormatter(DatetimeFormatterComp, {
    rowNumber: rowNumber,
    cellNumber: cellNumber,
    value: value,
    columnDef: columnDef,
    data: dataContext
  });
}


