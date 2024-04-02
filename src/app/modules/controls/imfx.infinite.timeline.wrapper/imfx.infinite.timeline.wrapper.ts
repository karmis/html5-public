import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Output, ViewChild,
    ViewEncapsulation
} from "@angular/core";

import {NotificationService} from "../../notification/services/notification.service";
import {Subject} from 'rxjs';
import {IMFXInfiniteTimelineComponent} from "../imfx.infinite.timeline/imfx.infinite.timeline";
import {
    IMFXInfiniteTimeline, IMFXInfiniteTimelineVisibilityRange
} from "../imfx.infinite.timeline/models/imfx.infinite.timeline.model";
import {IMFXControlsDateTimePickerComponent} from "../datetimepicker/imfx.datetimepicker";

@Component({
    selector: 'imfx-infinite-timeline-wrapper',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})

export class IMFXInfiniteTimelineWrapperComponent {

    @ViewChild('timeline', {static: false}) timeline: IMFXInfiniteTimelineComponent;
    @ViewChild('anchorDateTime', {static: false}) anchorDateTime: IMFXControlsDateTimePickerComponent;
    @Output() onClickLayout: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClickObject: EventEmitter<any> = new EventEmitter<any>();

    private currentAnchorDate: Date = null;
    private currentDayOfWeek = 0;

    private daysOfWeek = [
        {
            displayName: "Sun",
            value: 0
        },
        {
            displayName: "Mon",
            value: 1
        },
        {
            displayName: "Tue",
            value: 2
        },
        {
            displayName: "Wed",
            value: 3
        },
        {
            displayName: "Thu",
            value: 4
        },
        {
            displayName: "Fri",
            value: 5
        },
        {
            displayName: "Sat",
            value: 6
        }
    ]
    private destroyed$: Subject<any> = new Subject();

    constructor(protected notificationRef: NotificationService,
                public cdr: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.currentAnchorDate = new Date();
        this.currentDayOfWeek = this.currentAnchorDate.getDay();
        this.cdr.detectChanges();
    }

    ngAfterViewInit() {
        //TEST DATA
        let testData: IMFXInfiniteTimeline = {
            ShowLabels: false,
            ShowLogos: true,
            Rows: []
        };
        const logos = [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/990px-Mastercard-logo.svg.png",
            "https://freepikpsd.com/media/2019/10/generic-company-logo-png-7-Transparent-Images.png",
            "https://cbt.center/wp-content/uploads/2020/11/1-20.png",
            "https://upload.wikimedia.org/wikipedia/ru/thumb/2/24/WWF_logo.svg/1200px-WWF_logo.svg.png",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/1200px-BBC_News_2019.svg.png"
        ];
        for (let i = 0; i < 30; i++) {
            testData.Rows[i] = {
                Label: "Some Test Row " + i,
                ImageUrl: logos[i % 5],
                Events: []
            };
            for (let j = 0; j < 3; j++) {
                let startDate = new Date();
                let startHour = Math.floor((Math.random() - 0.5) * 2 * 23);
                let startMinute = Math.floor((Math.random() - 0.5) * 2 * 59);
                let startSecond = Math.floor((Math.random() - 0.5) * 2 * 59);
                startDate.setHours(startHour);
                startDate.setMinutes(startMinute);
                startDate.setSeconds(startSecond);

                let endDate = new Date();
                endDate.setHours(startHour + Math.floor(Math.random() * 5));
                endDate.setMinutes(startMinute + Math.floor(Math.random() * 59));
                endDate.setSeconds(startSecond + Math.floor(Math.random() * 59));

                testData.Rows[i].Events[j] = {
                    Title: "Row " + i + " Test title " + j,
                    Description: "Test description " + j,
                    StartDateTime: startDate,
                    EndDateTime: endDate,
                    Data: {
                        //TODO add mockup data for event detail
                    }
                };
            }
        }

        setTimeout(() => {
            this.timeline.InitTimelineData(testData, true);
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.cdr.detach();
    }

    private onChangeVisibleRangeFromTimeline(visibilityRange: IMFXInfiniteTimelineVisibilityRange) {
        console.log(visibilityRange);
        let date = new Date(visibilityRange.From.getTime() + (visibilityRange.To.getTime() - visibilityRange.From.getTime()) / 2);
        this.currentAnchorDate = date;
        this.currentDayOfWeek = this.currentAnchorDate.getDay();
        this.anchorDateTime.setValue(this.currentAnchorDate);
    }

    private onSelectDateTime(date) {
        if (date) {
            this.currentAnchorDate = date;
            this.currentDayOfWeek = this.currentAnchorDate.getDay();
            this.timeline.GoToDate(this.currentAnchorDate);
        }
    }

    private goToDayOfWeek(dayOfWeek: number) {
        let currentDay = this.currentDayOfWeek;
        let distance = dayOfWeek - currentDay;
        this.currentDayOfWeek = dayOfWeek;
        this.currentAnchorDate.setDate(this.currentAnchorDate.getDate() + distance);
        this.currentAnchorDate.setHours(0);
        this.currentAnchorDate.setMinutes(0);
        this.currentAnchorDate.setSeconds(0);
        this.currentAnchorDate.setMilliseconds(0);
        this.currentAnchorDate.setHours(12);
        this.anchorDateTime.setValue(this.currentAnchorDate);
        this.timeline.GoToDate(this.currentAnchorDate);
    }

    private resetDate() {
        this.currentAnchorDate = new Date();
        this.currentDayOfWeek = this.currentAnchorDate.getDay();
        this.anchorDateTime.setValue(this.currentAnchorDate);

        let startDate = new Date(this.currentAnchorDate.getTime());
        let endDate = new Date(this.currentAnchorDate.getTime());
        startDate.setHours(startDate.getHours() - 12);
        endDate.setHours(endDate.getHours() + 12);

        this.timeline.GoToDate(this.currentAnchorDate, {
            From: startDate,
            To: endDate
        });
    }
}
