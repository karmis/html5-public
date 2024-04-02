import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { commonFormatter } from '../common.formatter';
import {
  SlickGridColumn, SlickGridFormatterData, SlickGridRowData,
  SlickGridTreeRowData
} from '../../types';
import { SlickGridProvider } from '../../providers/slick.grid.provider';
import { IMFXSubtitlesGrid } from '../../../detail/components/subtitles.grid.component/subtitles.grid.component';

@Component({
  selector: 'subtitle-formatter-comp',
  templateUrl: './tpl/index.html',
  styleUrls: [
    'styles/index.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [SlickGridProvider]
})

export class SubtitleFormatterComp {

  private params: SlickGridFormatterData;
  private column: SlickGridColumn;
  public injectedData: { data: SlickGridFormatterData };

  @ViewChild('subtitleText', {static: false}) subtitleText:ElementRef;
  private content: string[];
  private textMarkerOptions;


    constructor(private injector: Injector) {
    this.injectedData = this.injector.get('data');
    this.params = this.injectedData.data;
    this.column = (<any>this.injectedData).data.columnDef;
    this.content = this.params.value;


  }

  ngOnInit() {
    this.htmlValueParser();
  }

  ngAfterViewInit() {
      //add-on "imfx-select" attribute to highlight elements
      let els = $(this.subtitleText.nativeElement).find('.highlight');
      els.each((i: number, el: Element)=>{
        el.setAttribute("imfx-select",this.params.rowNumber.toString() );
      });
  }

  htmlValueParser() {
    let textMarkerConfig = this.column.__contexts.provider.componentContext['textMarkerConfig'];
    if (!!textMarkerConfig){
      let textMarkerOptions = textMarkerConfig.moduleContext.textMarkerOptions;
      if(!!textMarkerOptions){
        let temp = textMarkerOptions.searchText;
          if (!!temp) {
            this.content = this.params.value.replace(new RegExp(temp, 'ig'), '<span class="highlight ' + (textMarkerOptions.selectedItem == this.params.rowNumber ? 'selected' : '') + '">$&</span>');
          }
        }
      }
  };

}
export function SubtitleFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
  return commonFormatter(SubtitleFormatterComp, {
    rowNumber: rowNumber,
    cellNumber: cellNumber,
    value: value,
    columnDef: columnDef,
    data: dataContext
  });
}
