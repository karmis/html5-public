import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";

import {NotificationService} from "../../notification/services/notification.service";
import {Subject} from 'rxjs';
import {
    IMFXInfiniteTimeline,
    IMFXInfiniteTimelineRow, IMFXInfiniteTimelineRowItem,
    IMFXInfiniteTimelineVisibilityRange
} from "./models/imfx.infinite.timeline.model";
import {TimelineBaseComponent} from "../../../utils/TimelineBaseComponent";

declare let window: any;

@Component({
    selector: 'imfx-infinite-timeline',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})

export class IMFXInfiniteTimelineComponent extends TimelineBaseComponent implements OnInit {
    public timelineType: string = 'IMFXInfiniteTimeline';

    @Output() onClickLayout: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClickObject: EventEmitter<any> = new EventEmitter<any>();
    @Output() onChangeVisibleRange: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('scrollableArea', {static: false}) scrollableArea: ElementRef;
    @ViewChild('rowsWrapper', {static: false}) rowsWrapper: ElementRef;
    @ViewChild('timelineScrollWrapper', {static: false}) timelineScrollWrapper: ElementRef;
    @ViewChild('timelineScroll', {static: false}) timelineScroll: ElementRef;
    @ViewChild('timeRowMonthYearCanvas', {static: false}) timeRowMonthYearCanvas: ElementRef;
    @ViewChild('timeRowWeekDayCanvas', {static: false}) timeRowWeekDayCanvas: ElementRef;
    @ViewChild('timeRowHourMinutesCanvas', {static: false}) timeRowHourMinutesCanvas: ElementRef;
    @ViewChildren('timelineRow') canvasesArray: QueryList<ElementRef>;

    private data: IMFXInfiniteTimeline = {
        ShowLogos: true,
        ShowLabels: true,
        Rows: []
    };
    private visibleRange: IMFXInfiniteTimelineVisibilityRange = null;
    private keyModifiers = {
        Shift: false,
        Alt: false
    };
    private loading = false;
    private destroyed$: Subject<any> = new Subject();
    private daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    private daysOfWeekShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    private month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    private maxDayWidth = 0;
    private maxDayWidthShort = 0;
    private maxDayWidthNumber = 0;
    private maxMinuteSecondWidth = 0;
    private hoveredItem : IMFXInfiniteTimelineRowItem = null;

    private canvasColors = {
        secondsText: '#818181',
        daysText: '#818181',
        yearsText: '#818181',
        secondsDash: '#818181',
        daysDash: '#ffbb37',
        eventBorder: '#78b0c1',
        eventColor: '#3a7aa4'
    }

    private daysLinesDrawRange = 5;

    constructor(protected notificationRef: NotificationService,
                public cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        window["infinite_timeline"] = this;

        let startDate = new Date();
        let endDate = new Date();
        startDate.setHours(startDate.getHours() - 12);
        endDate.setHours(endDate.getHours() + 12);

        this.visibleRange = {
            From: startDate,
            To: endDate
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.cdr.detach();
    }

// <editor-fold desc="Data refresh logic">
    public InitTimelineData(data : IMFXInfiniteTimeline, withRedraw: boolean) {
        this.data = data;
        this.cdr.detectChanges();
        let myCtx = this.refreshCanvasSize(this.timeRowMonthYearCanvas.nativeElement);
        this.maxDayWidth = Math.ceil(myCtx.measureText("Wednesday 55").width);
        this.maxDayWidthShort = Math.ceil(myCtx.measureText("Wed 23").width);
        this.maxDayWidthNumber = Math.ceil(myCtx.measureText("55").width);
        this.maxMinuteSecondWidth = Math.ceil(myCtx.measureText("55m").width);

        if(withRedraw)
            this.redrawAllCanvases();

        this.updateScroll();
    }

    public GoToDate(date: Date, visibleRange: IMFXInfiniteTimelineVisibilityRange = null) {
        if(visibleRange != null)
            this.visibleRange = visibleRange;

        let from = this.visibleRange.From.getTime();
        let to = this.visibleRange.To.getTime();
        let offsetFromDate = (to - from) / 2;

        let newFrom = date.getTime() - offsetFromDate;
        let newTo = date.getTime() + offsetFromDate;

        this.visibleRange = {
            From: new Date(newFrom),
            To: new Date(newTo)
        };

        this.redrawAllCanvases();
    }

    public SetVisibleRange(visibleRange) {
        this.visibleRange = visibleRange;
        this.redrawAllCanvases();
    }
// </editor-fold>

// <editor-fold desc="Click and scroll logic">
    private clickTimeRow(e) {

    }

    private clickLayout(e, row, rowIndex) {
        let mouseTime = this.calcMouseTime(e);

        let returnItem = null;
        for (let i = 0; i < row.Events.length; i++) {
            let evt = row.Events[i];
            if(mouseTime >= evt.StartDateTime.getTime() && mouseTime <= evt.EndDateTime.getTime()) {
                returnItem = evt;
                break;
            }
        }
        if(returnItem != null)
            this.onClickObject.emit(returnItem);
        else
            this.onClickLayout.emit();
    }

    private scrollLayout(e) {
        let value = e && e.deltaY != 0 ? e.deltaY : 0;

        if(value != 0) {
            let fromSeconds = Math.round(this.visibleRange.From.getTime() / 1000);
            let toSeconds = Math.round(this.visibleRange.To.getTime() / 1000);
            let secondsDiff = toSeconds - fromSeconds;
            let minutesDiff = secondsDiff / 60;
            let hoursDiff = minutesDiff / 60;
            let daysDiff = hoursDiff / 24;

            if(minutesDiff <= 1) {
                value /= 50;
            }
            else if(hoursDiff <= 1) {
                value /= 5;
            }
            else if(daysDiff > 30) {
                value = value < 0 ? -86400 : 86400;
            }
            else if(daysDiff > 15) {
                value = value < 0 ? -43200 : 43200;
            }
            else if(daysDiff > 1) {
                value *= 50;
            }
            else {
                value *= 10;
            }
        }

        //Make zoom or horizontal scroll
        if(this.keyModifiers.Alt || this.keyModifiers.Shift) {
            //move reduce or expand visible range in both sides
            let fromSeconds = this.visibleRange.From.getTime() / 1000;
            let toSeconds = this.visibleRange.To.getTime() / 1000;
            if(this.keyModifiers.Alt) {
                fromSeconds -= value;
                toSeconds += value;
            }
            else {
                fromSeconds -= value;
                toSeconds -= value;
            }

            if(!this.keyModifiers.Alt) {
                this.visibleRange.From = new Date(fromSeconds * 1000);
                this.visibleRange.To = new Date(toSeconds * 1000);
                this.redrawAllCanvases();
            }
            else if(fromSeconds < toSeconds) {
                if((toSeconds - fromSeconds) / 60 / 60 / 24 >= 31) {
                    let diff = Math.round(((toSeconds - fromSeconds) - 31 * 24 * 60 * 60) / 2);
                    toSeconds -= diff;
                    fromSeconds += diff;
                }
                this.visibleRange.From = new Date(fromSeconds * 1000);
                this.visibleRange.To = new Date(toSeconds * 1000);
                this.redrawAllCanvases();
            }
            this.onChangeVisibleRange.emit(this.visibleRange);
        }
        //Make vertical scroll
        else {
            let wrapperHeight = $(this.rowsWrapper.nativeElement).outerHeight();
            let scrollableHeight = $(this.scrollableArea.nativeElement).outerHeight();

            let diff = this.clamp(wrapperHeight / scrollableHeight, 0, 1);
            let scrollWrapperHeight = $(this.timelineScrollWrapper.nativeElement).outerHeight();
            this.timelineScroll.nativeElement.style.height = scrollWrapperHeight * diff + "px";

            let min = wrapperHeight >= scrollableHeight ? 0 : wrapperHeight - scrollableHeight;
            let scrollValue = e ? -e.deltaY : 0;
            let initialTop = parseInt($(this.scrollableArea.nativeElement).css('top'), 10);
            let newTop = this.clamp(initialTop + scrollValue, min, 0);
            if (initialTop != newTop) {
                $(this.scrollableArea.nativeElement).css('top', newTop);
                this.timelineScroll.nativeElement.style.top = -newTop * (scrollWrapperHeight / scrollableHeight) + "px";
            }
        }

        if(e) {
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
            return false;
        }
    }
// </editor-fold>

// <editor-fold desc="Redraw logic">
    private redrawAllCanvases() {
        this.redrawTimelineCanvases();
        this.redrawEventsOnCanvases();
        this.cdr.detectChanges();
    }

    private redrawTimelineCanvases() {
        if(!this.timeRowMonthYearCanvas.nativeElement)
            return;

        let myCtx = this.refreshCanvasSize(this.timeRowMonthYearCanvas.nativeElement);
        let wdCtx = this.refreshCanvasSize(this.timeRowWeekDayCanvas.nativeElement);
        let hmCtx = this.refreshCanvasSize(this.timeRowHourMinutesCanvas.nativeElement);

        let rowsCanvases = this.canvasesArray.toArray();
        let rowsCtx = [];

        for (let i = 0; i < rowsCanvases.length; i++) {
            rowsCtx.push(this.refreshCanvasSize(rowsCanvases[i].nativeElement));
        }

        let fromSeconds = Math.round(this.visibleRange.From.getTime() / 1000);
        let fromHour = this.visibleRange.From.getHours();
        let fromDay = this.visibleRange.From.getDate();
        let fromWeek = this.visibleRange.From.getDay();
        let fromMonth = this.visibleRange.From.getMonth();
        let fromYear = this.visibleRange.From.getFullYear();

        let toYear = this.visibleRange.To.getFullYear();
        let toMonth = this.visibleRange.To.getMonth();
        let toDay = this.visibleRange.To.getDate();
        let toSeconds = Math.round(this.visibleRange.To.getTime() / 1000);

        let secondsDiff = toSeconds - fromSeconds;
        let minutesDiff = secondsDiff / 60;
        let hoursDiff = minutesDiff / 60;
        let daysDiff = hoursDiff / 24;

        let diffDrawSeconds = secondsDiff / this.timeRowMonthYearCanvas.nativeElement.width;

        //<editor-fold desc="Redraw Week-Day and Month-Year canvases">
        wdCtx.font = "10px sinkin_sans600_semibold";
        myCtx.font = "10px sinkin_sans600_semibold";

        if(daysDiff > 1 || fromDay != toDay || fromMonth != toMonth || fromYear != toYear) {
            let startDate = new Date(this.visibleRange.From.getTime());
            let secondsToDayEnd = this.secondsToDayEnd(this.visibleRange.From);
            let leftOffset = 0;
            let lastYear = startDate.getFullYear();
            let hasYearEnd = false;
            let daysDiffRaw = Math.ceil(daysDiff);
            for (let i = 0; i <= daysDiffRaw; i++) {
                if(startDate > this.visibleRange.To)
                    continue;

                let currentYear = startDate.getFullYear();
                let leftWidth = secondsToDayEnd / diffDrawSeconds;
                let leftCenter = leftOffset + Math.round(leftWidth / 2);
                if(this.maxDayWidth < leftWidth || this.maxDayWidthShort < leftWidth) {
                    let source = this.maxDayWidth < leftWidth ? this.daysOfWeek : this.daysOfWeekShort;
                    let textLeft = source[startDate.getDay()] + " " + startDate.getDate();
                    let textLeftWidth = Math.round(myCtx.measureText(textLeft).width);
                    wdCtx.fillStyle = this.canvasColors.daysText;
                    wdCtx.fillText(textLeft, leftCenter - textLeftWidth / 2, 11);
                }
                else if(this.maxDayWidthNumber < leftWidth) {
                    let textLeft = startDate.getDate();
                    let textLeftWidth = Math.round(myCtx.measureText(String(textLeft)).width);
                    wdCtx.fillStyle = this.canvasColors.daysText;
                    wdCtx.fillText(String(textLeft), leftCenter - textLeftWidth / 2, 11);
                }

                if(lastYear != currentYear) {
                    hasYearEnd = true;
                    let rightWidth = this.timeRowMonthYearCanvas.nativeElement.width - leftOffset;
                    let textLeft = this.month[fromMonth] + " " + fromYear;
                    let textRight = this.month[toMonth] + " " + toYear;
                    let textLeftWidth = Math.round(myCtx.measureText(textLeft).width);
                    let textRightWidth = Math.round(myCtx.measureText(textRight).width);
                    let leftCenter = Math.round(leftOffset / 2);
                    let rightCenter = leftOffset + Math.round(rightWidth / 2);

                    myCtx.fillStyle = this.canvasColors.yearsText;
                    if(textLeftWidth < leftOffset)
                        myCtx.fillText(textLeft, leftCenter - textLeftWidth / 2, 11);
                    if(textRightWidth < rightWidth)
                        myCtx.fillText(textRight, rightCenter - textRightWidth / 2, 11);
                }

                if(lastYear != currentYear && daysDiff > this.daysLinesDrawRange) {
                    myCtx.fillStyle = this.canvasColors.daysDash;
                    myCtx.fillRect(leftOffset, 0, 1, 16);
                }
                if(i != daysDiffRaw) {
                    if(daysDiff > this.daysLinesDrawRange) {
                        wdCtx.fillStyle = this.canvasColors.daysDash;
                        wdCtx.fillRect(leftOffset + leftWidth, 0, 1, 16);

                        hmCtx.fillStyle = this.canvasColors.daysDash;
                        hmCtx.fillRect(leftOffset + leftWidth, 0, 1, 16);

                        for (let j = 0; j < rowsCtx.length; j++) {
                            rowsCtx[j].fillStyle = this.canvasColors.daysDash;
                            rowsCtx[j].fillRect(leftOffset + leftWidth, 0, 1, rowsCtx[j].canvas.height);
                        }
                    }

                    leftOffset += leftWidth;
                    lastYear = currentYear;
                    startDate = new Date(startDate.getTime() + secondsToDayEnd * 1000);

                    if(i + 1 == daysDiffRaw ||
                        startDate.getFullYear() == toYear && startDate.getMonth() == toMonth && startDate.getDate() == toDay)
                        secondsToDayEnd = this.secondsFromDayStart(this.visibleRange.To);
                    else
                        secondsToDayEnd = this.secondsToDayEnd(startDate);
                }
            }

            if(!hasYearEnd)
                this.fillDateCanvasText(this.month, myCtx, fromMonth, fromYear);
        }
        else {
            this.fillDateCanvasText(this.daysOfWeek, myCtx, fromWeek, fromDay);
            this.fillDateCanvasText(this.month, myCtx, fromMonth, fromYear);
        }
        //</editor-fold>

        // <editor-fold desc="Redraw Hour-Minute-Second canvas">
        hmCtx.font = "10px sinkin_sans400_regular";
        //1 minute wide screen - show every second
        if(minutesDiff <= 1) {
            let startSeconds = this.visibleRange.From.getSeconds();
            let x = 0;
            let lastDrawPosRightBorder = -1;
            for (let i = 0; i <= secondsDiff; i++) {
                hmCtx.fillStyle = this.canvasColors.secondsText;
                let seconds = startSeconds + x;
                seconds = seconds >= 60 ? seconds - 60 : seconds;

                if(seconds == 0 && fromDay != toDay) {
                    hmCtx.fillStyle = this.canvasColors.daysDash;
                    hmCtx.fillRect(Math.round(x / diffDrawSeconds), 0, 1, 16);
                    wdCtx.fillStyle = this.canvasColors.daysDash;
                    wdCtx.fillRect(Math.round(x / diffDrawSeconds), 0, 1, 16);

                    if(fromYear != toYear) {
                        myCtx.fillStyle = this.canvasColors.daysDash;
                        myCtx.fillRect(Math.round(x / diffDrawSeconds), 0, 1, 16);
                    }

                    for (let j = 0; j < rowsCtx.length; j++) {
                        rowsCtx[j].fillStyle = this.canvasColors.daysDash;
                        rowsCtx[j].fillRect(Math.round(x / diffDrawSeconds), 0, 1, rowsCtx[j].canvas.height);
                    }
                }
                else {
                    let secondDiff = Math.round(1 / diffDrawSeconds);
                    let divider = Math.ceil(this.maxMinuteSecondWidth / secondDiff);
                    divider = divider % 2 == 1 ? divider + 1 : divider;
                    if(secondDiff >= this.maxMinuteSecondWidth || seconds % divider == 0) {
                        let text = seconds + "s";
                        let textWidth = Math.round(myCtx.measureText(text).width);
                        let xDiff = Math.round(x / diffDrawSeconds);
                        let leftDrawPos = xDiff - this.maxMinuteSecondWidth;

                        hmCtx.fillText(text, xDiff - textWidth / 2, 8);
                        lastDrawPosRightBorder = leftDrawPos + this.maxMinuteSecondWidth;

                        hmCtx.fillStyle = this.canvasColors.secondsDash;
                        hmCtx.fillRect(Math.round(x / diffDrawSeconds), 11, 1, 5);

                        for (let j = 0; j < rowsCtx.length; j++) {
                            rowsCtx[j].fillStyle = this.canvasColors.secondsDash;
                            rowsCtx[j].fillRect(x / diffDrawSeconds, 0, 1, rowsCtx[j].canvas.height);
                        }
                    }
                }
                x++;
            }
        }
        //1 hour wide screen - show every minute
        else if(minutesDiff <= 60) {
            let startDate = new Date(this.visibleRange.From.getTime());
            let secondsToMinuteEnd = this.secondsToMinuteEnd(this.visibleRange.From);
            let offset = 0;
            let lastSegmentWidth = secondsToMinuteEnd / diffDrawSeconds;
            let lastDay = startDate.getDate();
            let lastYear = startDate.getFullYear();
            let minutesDiffRaw = Math.ceil(minutesDiff);
            for (let i = 0; i <= minutesDiffRaw; i++) {
                let currentDay = startDate.getDate();
                let currentYear = startDate.getFullYear();
                if(lastDay == currentDay) {
                    let divider = Math.ceil(this.maxMinuteSecondWidth / lastSegmentWidth);
                    divider = divider % 2 == 1 ? divider + 1 : divider;
                    if(lastSegmentWidth >= this.maxMinuteSecondWidth || startDate.getMinutes() % divider == 0){
                        let text = startDate.getMinutes() + "m";
                        this.fillSecondsDashes(myCtx, hmCtx,rowsCtx, text, offset);
                    }
                }
                else
                    this.fillDaysDashes(hmCtx, wdCtx, myCtx, rowsCtx, offset, lastYear, currentYear);

                lastSegmentWidth = secondsToMinuteEnd / diffDrawSeconds;
                offset += lastSegmentWidth;
                lastDay = currentDay;
                lastYear = currentYear;
                startDate = new Date(startDate.getTime() + secondsToMinuteEnd * 1000);
                secondsToMinuteEnd = this.secondsToMinuteEnd(startDate);
            }
        }
        //1 day wide view - show every hour
        else if(daysDiff <= this.daysLinesDrawRange) {
            let startDate = new Date(this.visibleRange.From.getTime());
            let secondsToHourEnd = this.secondsToHourEnd(this.visibleRange.From);
            let offset = 0;
            let lastSegmentWidth  = secondsToHourEnd / diffDrawSeconds;
            let lastDay = startDate.getDate();
            let lastYear = startDate.getFullYear();
            let hoursDiffRaw = Math.ceil(hoursDiff);
            for (let i = 0; i <= hoursDiffRaw; i++) {
                let currentDay = startDate.getDate();
                let currentYear = startDate.getFullYear();
                if (lastDay == currentDay) {
                    let divider = Math.ceil(this.maxMinuteSecondWidth / lastSegmentWidth);
                    divider = divider % 2 == 1 ? divider + 1 : divider;
                    if(lastSegmentWidth >= this.maxMinuteSecondWidth || startDate.getHours() % divider == 0)
                    {
                        let text = startDate.getHours() + "h";
                        this.fillSecondsDashes(myCtx, hmCtx,rowsCtx, text, offset);
                    }
                } else
                    this.fillDaysDashes(hmCtx, wdCtx, myCtx, rowsCtx, offset, lastYear, currentYear);
                lastSegmentWidth  = secondsToHourEnd / diffDrawSeconds;
                offset += lastSegmentWidth;
                lastDay = currentDay;
                lastYear = currentYear;
                startDate = new Date(startDate.getTime() + secondsToHourEnd * 1000);
                secondsToHourEnd = this.secondsToHourEnd(startDate);
            }
        }
        // </editor-fold>
    }

    private redrawEventsOnCanvases() {
        let rowsCanvases = this.canvasesArray.toArray();
        let fromSecondsVisible = Math.round(this.visibleRange.From.getTime() / 1000);
        let toSecondsVisible = Math.round(this.visibleRange.To.getTime() / 1000);
        let secondsDiffVisible = toSecondsVisible - fromSecondsVisible;
        let diffDrawSeconds = secondsDiffVisible / this.timeRowMonthYearCanvas.nativeElement.width;

        for (let i = 0; i < this.data.Rows.length; i++) {
            let row = this.data.Rows[i];
            let ctx = rowsCanvases[i].nativeElement.getContext('2d');
            for (let j = 0; j < row.Events.length; j++) {
                let event = row.Events[j];
                let from = Math.round(event.StartDateTime.getTime() / 1000);
                let to = Math.round(event.EndDateTime.getTime() / 1000);
                let widthSeconds = to - from;
                let width = Math.ceil(widthSeconds / diffDrawSeconds);
                if(width > 4) {
                    ctx.fillStyle = this.canvasColors.eventBorder;
                    ctx.fillRect((from - fromSecondsVisible) / diffDrawSeconds, 0, width, ctx.canvas.height);
                    ctx.fillStyle = this.canvasColors.eventColor;
                    ctx.fillRect((from - fromSecondsVisible) / diffDrawSeconds + 2, 2, width - 4, ctx.canvas.height - 4);
                }
                else {
                    ctx.fillStyle = this.canvasColors.eventBorder;
                    ctx.fillRect((from - fromSecondsVisible) / diffDrawSeconds, 0, width, ctx.canvas.height);
                }
            }
        }
    }
// </editor-fold>

// <editor-fold desc="Canvas hover">
    private checkHoverInCanvas(e, row : IMFXInfiniteTimelineRow, rowIndex) {
        let mouseTime = this.calcMouseTime(e);
        for (let i = 0; i < row.Events.length; i++) {
            let evt = row.Events[i];
            if(mouseTime >= evt.StartDateTime.getTime() && mouseTime <= evt.EndDateTime.getTime()) {
                this.hoveredItem = evt;
                this.cdr.detectChanges();
                this.showHoverTooltip(e);
                this.cdr.detectChanges();
                this.showHoverTooltip(e);
                return;
            }
        }
        this.hoveredItem = null;
    }

    private clearHoverOnCanvas(e, row, rowIndex) {
        this.hoveredItem = null;
    }
// </editor-fold>

// <editor-fold desc="Layout drag">
    private startLayoutDrag(e, row, rowIndex) {
        //TODO
    }

    private checkLayoutDrag(e) {
        //TODO
    }

    private endLayoutDrag(e) {
        //TODO
    }
// </editor-fold>

// <editor-fold desc="Key modifiers">
    private checkKeyDown(e) {
        //Shift
        if (e.keyCode == 16)
            this.keyModifiers.Shift = true;

        //Alt
        if (e.keyCode == 18) {
            this.keyModifiers.Alt = true;
            e.preventDefault();
            e.stopPropagation();
            e.returnValue = false;
            return false;
        }
    }

    private checkKeyUp(e) {
        //Shift
        if (e.keyCode == 16)
            this.keyModifiers.Shift = false;

        //Alt
        if (e.keyCode == 18) {
            this.keyModifiers.Alt = false;
            e.preventDefault();
            e.stopPropagation();
            e.returnValue = false;
            return false;
        }
    }

// </editor-fold>

// <editor-fold desc="Utility">
    private calcMouseTime(e) {
        let canvas = e.target;
        let mousePos = this.getMousePosInCanvas(canvas, e);
        let fromSeconds = Math.round(this.visibleRange.From.getTime() / 1000);
        let toSeconds = Math.round(this.visibleRange.To.getTime() / 1000);
        let secondsDiff = toSeconds - fromSeconds;
        let diffDrawSeconds = secondsDiff / this.timeRowMonthYearCanvas.nativeElement.width;
        return fromSeconds * 1000 + mousePos.x * diffDrawSeconds * 1000;
    }

    private secondsFromYearStart(date: Date) {
        let dateInit = new Date(date.getFullYear(), 0, 1);
        let dateInitSeconds = Math.round(dateInit.getTime()/1000);
        let dateCurrent = Math.round(date.getTime()/1000);
        return dateCurrent - dateInitSeconds;
    }

    private secondsInYear(year) {
        return this.daysInYear(year) * 24 * 60 * 60;
    }

    private daysInYear(year)
    {
        return this.isLeapYear(year) ? 366 : 365;
    }

    private isLeapYear(year) {
        return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
    }

    private secondsFromMonthStart(date: Date) {
        let dateInit = new Date(date.getFullYear(), date.getMonth(), 1);
        let dateInitSeconds = Math.round(dateInit.getTime()/1000);
        let dateCurrent = Math.round(date.getTime()/1000);
        return dateCurrent - dateInitSeconds;
    }

    private secondsInMonth(year, month)
    {
        return this.daysInMonth(year, month) * 24 * 60 * 60;
    }

    private daysInMonth(year, month)
    {
        return new Date(year, month + 1, 0).getDate();
    }

    private secondsToDayEnd(date)
    {
        return 86400 - this.secondsFromDayStart(date);
    }

    private secondsToHourEnd(date)
    {
        return 3600 - this.secondsFromHourStart(date);
    }

    private secondsToMinuteEnd(date)
    {
        return 60 - this.secondsFromMinuteStart(date);
    }

    private secondsFromDayStart(date)
    {
        return (date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 1000;
    }

    private secondsFromHourStart(date)
    {
        return (date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime()) / 1000;
    }

    private secondsFromMinuteStart(date)
    {
        return (date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()).getTime()) / 1000;
    }

    private refreshCanvasSize(canvas) {
        let tmp = canvas.getContext('2d');

        tmp.webkitImageSmoothingEnabled = false;
        tmp.mozImageSmoothingEnabled = false;
        tmp.ImageSmoothingEnabled = false;

        canvas.width = $(canvas).outerWidth();
        canvas.height = $(canvas).outerHeight();

        tmp.clearRect(0, 0, canvas.width, canvas.height);
        tmp.clearRect(0, 0, canvas.width, canvas.height);
        tmp.clearRect(0, 0, canvas.width, canvas.height);

        return tmp;
    }

    private updateScroll() {
        this.scrollLayout(null);
    }

    private fillSecondsDashes(myCtx, hmCtx,rowsCtx, text, offset) {
        let textWidth = Math.round(myCtx.measureText(text).width);

        hmCtx.fillStyle = this.canvasColors.daysText;
        hmCtx.fillText(text, offset - textWidth / 2, 11);

        hmCtx.fillStyle = this.canvasColors.secondsDash;
        hmCtx.fillRect(offset, 11, 1, 5);

        for (let j = 0; j < rowsCtx.length; j++) {
            rowsCtx[j].fillStyle = this.canvasColors.secondsDash;
            rowsCtx[j].fillRect(offset, 0, 1, rowsCtx[j].canvas.height);
        }
    }

    private fillDaysDashes(hmCtx, wdCtx, myCtx, rowsCtx, offset, lastYear, currentYear) {
        hmCtx.fillStyle = this.canvasColors.daysDash;
        hmCtx.fillRect(offset, 0, 1, 16);
        wdCtx.fillStyle = this.canvasColors.daysDash;
        wdCtx.fillRect(offset, 0, 1, 16);
        if(lastYear != currentYear) {
            myCtx.fillStyle = this.canvasColors.daysDash;
            myCtx.fillRect(offset, 0, 1, 16);
        }
        for (let j = 0; j < rowsCtx.length; j++) {
            rowsCtx[j].fillStyle = this.canvasColors.daysDash;
            rowsCtx[j].fillRect(offset, 0, 1, rowsCtx[j].canvas.height);
        }
    }

    private fillDateCanvasText(source, ctx, fromFirst, fromSecond) {
        let textY = source[fromFirst] + " " + fromSecond;
        let textWidthY = Math.round(ctx.measureText(textY).width);
        let centerY = Math.round(this.timeRowMonthYearCanvas.nativeElement.width / 2);
        ctx.fillStyle = this.canvasColors.yearsText;
        ctx.fillText(textY, centerY - textWidthY / 2, 11);
    }

// </editor-fold>
}
