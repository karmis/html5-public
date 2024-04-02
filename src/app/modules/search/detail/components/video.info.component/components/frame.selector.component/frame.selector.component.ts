import {
  Component, Input, ViewEncapsulation, Output, EventEmitter, ChangeDetectorRef, ViewChild, Injectable
} from '@angular/core';
import * as $ from 'jquery';
import { VideoData } from '../../video.info.component';
import { TMDTimecode } from '../../../../../../../utils/tmd.timecode';

@Component({
    selector: 'frame-selector',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
@Injectable()
export class IMFXFrameSelectorComponent {

  public timecodeStringArray;
  @Input() private title;
  @Input() private config: VideoData;
  @Input() private sceneMode: boolean = false;
  @Input() private showScrollable: boolean = false;
  @Output() private setPercent: EventEmitter<number> = new EventEmitter<number>();
  @Output() private setTimecode: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('cursor', {static: false}) private cursor;
  @ViewChild('cursorScroll', {static: false}) private cursorScroll;
  @ViewChild('cursorFrame', {static: false}) private cursorFrame;
  @ViewChild('cursorFrameScroll', {static: false}) private cursorFrameScroll;
  @ViewChild('elemFull', {static: false}) private elemFull;
  @ViewChild('elemScroll', {static: false}) private elemScroll;
  @ViewChild('frame', {static: false})  private frame;
  private width: boolean = false;
  private fullWidth: boolean = false;
  private oldx = 0;
  private percent;
  private offsetX;
  private timeFrame = 170;

  private currentPercentString: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    let compRef = this;
    if (this.elemScroll) {
      $(this.elemScroll.nativeElement).parent().scroll(() => {
        compRef.updateCursorFramePosition();
      });
    }
    this.setResizeEvent(compRef);
    $(this.frame.nativeElement).find('iframe')[0].onload = function() {
      compRef.updateCursorFramePosition();
      compRef.setResizeEvent(compRef);
    };
    $(this.cursor.nativeElement).mousedown(() => {
      if (compRef.elemScroll && $(compRef.elemScroll.nativeElement).parent().hasClass('hide-elem-scroll')) {
        compRef.mouseDownCursor();
      }
    });
    $(this.cursorFrame.nativeElement).mousedown(() => {
      if (compRef.elemScroll && !$(compRef.elemScroll.nativeElement).parent().hasClass('hide-elem-scroll')) {
        compRef.mouseDownCursorFrame();
      }
    });
    $(this.cursor.nativeElement).mouseup(() => {
      $(compRef.elemFull.nativeElement).off('mousemove');
    });
    $(this.cursorFrame.nativeElement).mouseup(() => {
      $(compRef.elemFull.nativeElement).off('mousemove');
    });
    if ( compRef.elemScroll ) {
      $(this.elemScroll.nativeElement)[0].onload = function() {
        compRef.updateCursorFramePosition();
        if (compRef.cursorFrameScroll) {
          compRef.updateCursorFrameScrollPosition();
        }
        compRef.resizeScreen();
        compRef.cdr.markForCheck();
      };
    }
  }

  mouseDownCursorFrame() {
    let compRef = this;
    $(this.elemFull.nativeElement).mousemove((event) => {
      compRef.mouseMoveCursorFrame(event);
    });
  }

  mouseMoveCursorFrame(event) {
    let percent = this.getPercent(event, false);

    if (event.offsetX < this.oldx) {
      // left
      $(this.cursorFrame.nativeElement).css('left', event.offsetX);
      $(this.cursor.nativeElement).css('left', event.offsetX);
    } else if (event.offsetX > this.oldx) {
      // right
      $(this.cursorFrame.nativeElement).css('left', event.offsetX);
      $(this.cursor.nativeElement).css('left', event.offsetX);
    }
    this.oldx = event.offsetX;

    let $elemScrollLongWidth = $(this.elemScroll.nativeElement).width();
    let $elemScrollShortWidth = $(this.elemScroll.nativeElement).parent().width();
    let scrollPosition = ($elemScrollLongWidth - $elemScrollShortWidth / 2);
    if (scrollPosition < 0) {
      scrollPosition = 0;
    }

    $(this.elemScroll.nativeElement).parent().scrollLeft(scrollPosition * percent);
    this.updateCursorFramePosition();
  }

  mouseDownCursor() {
    let compRef = this;
    $(this.elemFull.nativeElement).mousemove((event) => {
      compRef.mouseMoveCursor(event);
    });
  }

  mouseMoveCursor(event) {
    if (event.offsetX < this.oldx) {
      // left
      $(this.cursor.nativeElement).css('left', event.offsetX);
    } else if (event.offsetX > this.oldx) {
      // right
      $(this.cursor.nativeElement).css('left', event.offsetX);
    }
    this.oldx = event.offsetX;
  };

  resizeScreen() {
      let $elemFrameWidth = $(this.frame.nativeElement).width();
      let $elemFullWidth = $(this.elemFull.nativeElement).width();
      let $elemScrollLongWidth = $(this.elemScroll.nativeElement).width();
      if ((($elemScrollLongWidth <= $elemFullWidth)
      && ($elemScrollLongWidth !== 0)) || ($elemFullWidth < $elemFrameWidth)) {
        this.width = true;
      } else {
        this.width = false;
      }
  }

  updateCursorFramePosition() {
    let $elemFullWidth = $(this.elemFull.nativeElement).width();
    let $elemScrollShortWidth = $(this.elemScroll.nativeElement).parent().width();
    let $elemScrollShortLeft = $(this.elemScroll.nativeElement).parent().scrollLeft();
    let $elemScrollLongWidth = $(this.elemScroll.nativeElement).width();

    let frameLeft = $elemScrollShortLeft / $elemScrollLongWidth * 100 + '%';
    let widthUpdate;

    if (this.title !== 'Waveform') {
      let frameWidth = $elemFullWidth * $elemScrollShortWidth / $elemScrollLongWidth;
      widthUpdate = frameWidth + (frameWidth * 0.4);
    } else {
      let frameWidth = $elemFullWidth * $elemScrollShortWidth / $elemScrollLongWidth;
      widthUpdate = frameWidth;
    }

    $(this.cursorFrame.nativeElement).css('left', frameLeft);
    $(this.cursorFrame.nativeElement).css('width', widthUpdate);
  }

  updateCursorFrameScrollPosition(offsetx?: number) {
    let $elemScrollShortLeft = $(this.elemScroll.nativeElement).parent().scrollLeft();
    let $leftcursorFrameScroll = $(this.cursorFrameScroll.nativeElement).css('left');
    let left = Number($leftcursorFrameScroll.substr(0, $leftcursorFrameScroll.indexOf('px')));

    let $elemScrollShortWidth = $(this.elemScroll.nativeElement).parent().width();
    let $elemScrollLongWidth = $(this.elemScroll.nativeElement).width();

    let frameLeft = $elemScrollShortLeft;
    $(this.cursorFrameScroll.nativeElement).css('left', frameLeft);
    $(this.cursorFrameScroll.nativeElement).css('width', 90);
  }

  getPercent($event: MouseEvent, isClickOnFrame: boolean) {
    let $currentTarget = isClickOnFrame ? $(
      this.elemScroll.nativeElement
    ) : $(this.elemFull.nativeElement);

    let x = $event.pageX - $($currentTarget).offset().left;
    let percent = x / $($currentTarget).width();
    return percent;
  }

  clickOnTape($event: MouseEvent) {
    this.percent = this.getPercent($event, false);
    this.clickOnFrame(this.percent);
  }

  clickOnFrameDirectly($event: MouseEvent) {
    let percent = this.getPercent($event, true);
    this.offsetX = $event.offsetX;
    this.clickOnFrame(percent);
  }

  clickOnFrame(percent: number) {
      /*debugger*/
    if (this.sceneMode) {
      this.doSetTimecode(percent);
    } else {
      this.doSetPercent(percent);
    }
  }

  doSetPercent(percent: number) {
      /*debugger*/
    this.setPercent.emit(percent);
  }
  doSetTimecode(percent: number) {
      /*debugger*/
    let frame = Math.floor(this.config.EventData.TotalFrames * percent);
    this.setTimecode.emit(this.config.EventData.StringTimecodes[frame]);
  }

  setProgressByPercent(percent: number) {
    if (!this.sceneMode) {
      this.currentPercentString = percent * 100 + '%';
      $(this.cursor.nativeElement).css('left', this.currentPercentString);
      if (this.cursorScroll) {
        let $widthFull = $(this.elemFull.nativeElement).width();
        let $widthScroll = $(this.elemScroll.nativeElement).width();
        let factor = $widthScroll / $widthFull;
        let perc = (percent * factor) * 100 + '%';
        $(this.cursorScroll.nativeElement).css('left', perc);
      }

      let $offsetLeftFrame = $(this.cursorFrame.nativeElement).offset().left;
      let $elemFullWidth = $(this.cursorFrame.nativeElement).width();
      let scrollLeft = $offsetLeftFrame + $elemFullWidth;
      let $position = $(this.cursor.nativeElement).offset().left;

      this.updateCursorFramePosition();
      if ($position > scrollLeft || $position < $offsetLeftFrame) {
        this.updateElemScroll(percent);
      }
    }
  }

  setProgressByTimecode(tc: string) {
    if (this.sceneMode) {
      let percent = this.getScenePercentFromTimecode(tc);
      this.currentPercentString = percent * 100 + '%';
      $(this.cursor.nativeElement).css('left', this.currentPercentString);

      let $offsetLeftFrame = $(this.cursorFrame.nativeElement).offset().left;
      let $elemFullWidth = $(this.cursorFrame.nativeElement).width();
      let scrollLeft = $offsetLeftFrame + $elemFullWidth;
      let $position = $(this.cursor.nativeElement).offset().left;

      this.updateFrameSceneSmudge(tc);
      this.updateCursorFramePosition();
      if ($position > scrollLeft || $position < $offsetLeftFrame) {
        this.updateElemScroll(percent);
      }
    } else {
      this.updateFrameSceneSmudge(tc);
    }
  }

  updateFrameSceneSmudge(tc: string) {
    let tcs = this.config.EventData.StringTimecodes;
    for (let i in tcs) {
      if (TMDTimecode.compareStrings(tc, tcs[i]) >= 0) {
        let K = parseInt(i);
        let left = K * 90;
        $(this.cursorFrameScroll.nativeElement).css('left', left);
      }
    }
  }

  // updateFrameSmudge(tc: string) {
  //   let tcs = this.config.EventData.StringTimecodes;
  //   for (let i in tcs) {
  //     if (TMDTimecode.compareStrings(tc, tcs[i]) >= 0) {
  //       let intI = parseInt(i);
  //       $(this.cursorFrameScroll.nativeElement).css('left', Number(i) * 90);
  //     }
  //   }
  // }

  updateElemScroll(percent) {
    let $elemScrollLongWidth = $(this.elemScroll.nativeElement).width();
    let $elemScrollShortWidth = $(this.elemScroll.nativeElement).parent().width();
    let scrollPosition = ($elemScrollLongWidth - $elemScrollShortWidth / 2);
    if (scrollPosition < 0) {
      scrollPosition = 0;
    }

    $(this.elemScroll.nativeElement).parent().scrollLeft(scrollPosition * percent);
  }

  getScenePercentFromTimecode(tc: string) {
    let tcs = this.config.EventData.StringTimecodes;
    for (let i in tcs) {
      if (TMDTimecode.compareStrings(tc, tcs[i]) <= 0) {
        let intI = parseInt(i);
        return (intI / this.config.EventData.TotalFrames);
      }
    }
  }

  ngOnDestroy() {
    if (this.elemScroll) {
      $(this.elemScroll.nativeElement).off('scroll');
    }
    $(this.cursor.nativeElement).off('mousedown');
    $(this.cursor.nativeElement).off('mouseup');
    $(this.cursorFrame.nativeElement).off('mousedown');
    $(this.cursorFrame.nativeElement).off('mouseup');
  }

  setResizeEvent(compRef) {
    $($(this.frame.nativeElement).find('iframe')[0]['contentWindow']).resize(function () {
      compRef.resizeScreen();
      compRef.updateCursorFramePosition();
      compRef.cdr.markForCheck();
    });
  }
}
