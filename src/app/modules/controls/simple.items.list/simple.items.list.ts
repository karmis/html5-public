import {
    Input,
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef, Output, EventEmitter, ViewChild, QueryList, ViewChildren, AfterViewInit, OnChanges, SimpleChanges
} from '@angular/core';
import { NotificationService } from "../../notification/services/notification.service";
import { ClipEditorDetailProvider } from "../../../views/clip-editor/providers/clip-editor.detail.provider";
import {ThumbComponent} from "../thumb/thumb";
import {appRouter} from "../../../constants/appRouter";
import {Router} from "@angular/router";
import {AssessmentProvider} from "../../../views/detail/tasks/assessment/providers/assessment.provider";

@Component({
    selector: 'simple-list-component',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [
        ClipEditorDetailProvider,
        AssessmentProvider
    ]
})
export class SimpleListComponent implements AfterViewInit, OnChanges {
    @ViewChildren('thumbComponent') thumbComponents: QueryList<ThumbComponent>;
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRemove: EventEmitter<any> = new EventEmitter<any>();
    @Input() items: Array<any> = [];
    @Input() defaultFile: any;
    @Input() allowRemove: boolean = false;
    @Input() glLink: any = null;
    private selectedItemIndex = 0;
    private gotoDetailType:string = 'media';
    isShowMainMedia = false;
    task = null;
    private showItems = []

    constructor(public cdr: ChangeDetectorRef,
                private notificationService: NotificationService,
                private mediaDetailProvider: ClipEditorDetailProvider,
                private router: Router,
                private assessmentProvider: AssessmentProvider) {
    };

    ngOnInit() {
        this.filterShowItems();
    }

    ngAfterViewInit() {
        this.task = this.items.filter(el => el.IsGangedMain).length === 0 ? null : this.task;
        this.thumbComponents.toArray().forEach((tc:ThumbComponent ) => {
            tc.cdr.detectChanges();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
    }

    onClickShowMainMedia() {
        this.isShowMainMedia = !this.isShowMainMedia;
        if (this.isShowMainMedia) {
            this.showItems = this.items.filter(el => el.IsGangedMain)
            this.showItems.length && this.selectItem(this.showItems[0].ID)
        } else {
            this.showItems = this.items;
        }
    }

    public addItem(itemData) {
        if (this.items.filter(function (obj) {
            return obj.ID == itemData.ID;
        }).length == 0) {
            this.items.push(itemData);
            this.cdr.detectChanges();
        }
        setTimeout(() => {
            this.thumbComponents.toArray().forEach((tc:ThumbComponent ) => {
                tc.cdr.detectChanges();
            });
        })
    }

    public setItems(items) {
        this.items = items;
        this.filterShowItems();
        setTimeout(() => {
            this.thumbComponents.toArray().forEach((tc:ThumbComponent ) => {
                tc.cdr.detectChanges();
            });
        })
    }

    public selectItem(itemId, tc?) {
        let index = this.items.findIndex(x => x.ID == itemId);
        this.selectedItemIndex = index;
        this.onSelect.emit({file: this.items[index], tc: tc});
        setTimeout(() => {
            this.thumbComponents.toArray().forEach((tc:ThumbComponent ) => {
                tc.cdr.detectChanges();
            });
        })
    }

    public removeItem(itemId, tc?) {
        var existOnTimeline = false;
        if (this.glLink) {
            let clips = this.glLink.getTimelineItems();
            existOnTimeline = clips.filter(e => e.file.ID === itemId).length != 0;
        }
        if (!existOnTimeline) {
            let index = this.items.findIndex(x => x.ID == itemId);
            this.onRemove.emit(itemId);
            if (this.selectedItemIndex == index) {
                this.selectedItemIndex = 0;
                this.selectItem(this.items[0].ID);
            }
            this.items.splice(index, 1);
            this.mediaDetailProvider.removeIdFromUrl(itemId);
        } else {
            this.notificationService.notifyShow(2, "You can't remove media item, which used on timeline!", true);
        }
    }

    public loadComponentData() {
    };

    public refresh(readOnly) {
        this.items.forEach(el => {
            el._hasAcceptBnts = !readOnly;
        });
    };

    public gotoMediaItem(e, itemId) {
        e.preventDefault();
        this.router.navigate(
            [
                appRouter[this.gotoDetailType].detail.substr(0, appRouter[this.gotoDetailType].detail.lastIndexOf('/')),
                itemId
            ]
        );
    }

    private filterShowItems() {
        if (this.task && this.task.Settings.Assess.OnlyShowMainMediaDefaultValue) {
            this.isShowMainMedia = this.task.Settings.Assess.OnlyShowMainMediaDefaultValue;
            const gangedItems = this.items.filter(el => el.IsGangedMain);
            this.showItems = gangedItems.length ? gangedItems : this.items;
        } else {
            this.showItems = this.items;
        }
    }

    onChangeRadio(item: any, status: number) {
        const itm = this.showItems.find((itm) => {return itm.ID == item.ID})
        if (itm) {
            itm.ACCEPTANCE_LTTR_ID = status;
            if(this.assessmentProvider.mediaItems) {
                const assessmentItem = this.assessmentProvider.mediaItems.find((itm) => {itm.ID == item.ID})
                assessmentItem.ACCEPTANCE_LTTR_ID = status;
            }
        }

    }
}
