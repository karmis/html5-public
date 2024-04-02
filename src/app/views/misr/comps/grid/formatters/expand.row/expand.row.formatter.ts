/**
 * Created by Sergey Trizna on 17.01.2018.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewEncapsulation
} from "@angular/core";
import { appRouter } from "../../../../../../constants/appRouter";
import { Router } from "@angular/router";
import { SlickGridInsideExpandRowFormatterData } from "../../../../../../modules/search/slick-grid/types";
import { MisrSlickGridProvider } from "../../../../providers/misr.slickgrid.provider";
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, throttleTime } from 'rxjs/operators';
import {MisrService} from "../../../../services/service";

@Component({
    selector: 'misr-grid-rows-cell-detail-component',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        MisrService
        // ChartService
        // WorkflowSlickGridProvider
        // WorkflowAccordionProvider,
        // AccordionService
    ],
    changeDetection: ChangeDetectionStrategy.Default
})
export class MisrExpandRowComponent {
    public injectedData: {
        data: SlickGridInsideExpandRowFormatterData
    };
    private item: any;
    private items: any[];
    private provider: MisrSlickGridProvider;
    private fields: any[];
    private tasks: any;
    private dataView: any;
    private selector: string = '.misrExpandRowItemSettingsPopup';
    private popupOpened: boolean = false;
    private popupOpenedId: string;
    private destroyed$: Subject<any> = new Subject();
    private isReady: boolean = false;

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                protected router: Router,
                protected misrService: MisrService) {
        this.injectedData = this.injector.get('data');
        this.item = this.injectedData.data.item;
        this.provider = this.injectedData.data.provider;
        this.fields = this.injectedData.data.fields;
        this.items = this.item.items;
        this.dataView = this.provider.getDataView();
    }

    ngOnInit() {
        this.dataView.beginUpdate();
        this.hidePopups();
        this.provider.onScrollGrid
            .pipe(
                throttleTime(1000),
                takeUntil(this.destroyed$)
            ).subscribe(() => {
                this.hidePopups();
            });

        fromEvent(document, 'click')
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.hidePopups();
            });
    }

    ngAfterViewInit() {
    }

    onClick($event, group, state = null, silent: boolean = false) {
        let slick = this.provider.getSlick();
        this.dataView.beginUpdate();
        if (state == null) {
            group.hideme = !group.hideme;
        } else {
            group.hideme = state;
        }

        if (!group.hideme) {
            this.contentReady();
            this.provider.addExpandableRows(this.item, group.props.length, group._id);
            this.addExpandRow(this.item.id, group._id);
        } else {
            if (!silent) {
                let idsForRemove = [];
                $.each(group.props, (k) => {
                    let key = k + 1;
                    idsForRemove.push(this.provider.getAdditionalRowId(this.item.id, key, group._id));
                });
                this.provider.removeExpandableRows(this.item, idsForRemove);
                this.removeExpandRow(this.item.id, group._id);
            }
        }
        this.dataView.endUpdate();
        slick.updateRowCount();
        !silent && this.provider.resize();
    }

    updateData(item) {
        this.items = item.items;
        let slick = this.provider.getSlick();
        let mediaGroup = this.items[0];
        let audioRequirementsGroup = this.items[1];
        let subtitleRequirementsGroup = this.items[2];
        let componentsGroup = this.items[3];
        let cacheGroup = this.items[4];
        let needUpdate = false;

        if (mediaGroup.props.length > 0) {
            this.onClick(null, this.items[0], true, true);
            needUpdate = true;
        }

        if (audioRequirementsGroup.props.length > 0) {
            this.onClick(null, this.items[1], false, true);
            needUpdate = true;
        }

        if (subtitleRequirementsGroup.props.length > 0) {
            this.onClick(null, this.items[2], false, true);
            needUpdate = true;
        }

        if (componentsGroup.props.length > 0) {
            this.onClick(null, this.items[3], false, true);
            needUpdate = true;
        }

        if(cacheGroup.props.length > 0) {
            this.onClick(null, this.items[4], false, true);
            needUpdate = true;
        }

        if (needUpdate) {
            slick.updateRowCount();
        }

        this.dataView.endUpdate();
        this.provider.resize();
        this.isReady = true;

        !this.destroyed$.isStopped && this.cdr.detectChanges();
    }

    contentReady() {
        // setTimeout(() => {
        //     this.config.options.provider.contentReadyEvent(), 0
        // });
    }

    goToDetail(id, type) {
        if (type === 'Media Items') {
            // this.router.navigate(['media/detail', id]);
            this.router.navigate(
                [
                    appRouter.media.detail.substr(
                        0,
                        appRouter.media.detail.lastIndexOf('/')
                    ),
                    id
                ]
            );
        }
    }


    selectExpandedRow(rowIndex, remove) {
        // rowIndex--;
        // this.parentContainer = $(".ag-row[row='" + rowIndex + "']")
        // if(remove) {
        //     this.parentContainer.removeClass("imfx-grid-row-expanded");
        // } else {
        //     this.parentContainer.addClass("imfx-grid-row-expanded");
        // }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    // popup
    tryOpenPopup($event) {
        let dropdown = $('misr').find(this.selector);
        let element = $event.target;
        let target = 0;
        for (var i = 0; i < dropdown.length; i++) {
            target += $(dropdown[i]).has(element).length;
            if (target === 0) {
                this.hidePopups();
            }
        }
        if (target === 1) {
            this.openPopups($event);
        }
    }


    openPopups($event, itemOfGroup?) {
        let btnEl = $($event.target);
        if (!this.popupOpened || (btnEl.data('rowid') != null && btnEl.data('rowid') != this.popupOpenedId)) {
            this.provider.hidePopups();
            let offset = <any>btnEl.offset();
            offset.top = offset.top + 4;
            // offset.left = offset.left;
            let sel = $('misr').find(this.selector);
            $(sel).css(offset);
            $(sel).show();

            let outOfconfines = $(window).height() - $(this.selector).children().height() - offset.top - 15;
            if (outOfconfines < 0) {
                offset.top = offset.top + outOfconfines;
            }
            $(sel).css(offset);
            this.popupOpened = true;
            this.popupOpenedId = btnEl.data('rowid');
            this.provider.selectedSubItemOfGrid = itemOfGroup;
        } else {
            this.hidePopups();
        }

        $event.preventDefault();
        $event.stopPropagation();
        return false;
    }

    hidePopups() {
        this.popupOpened = false;
        this.popupOpenedId = null;
        this.provider.selectedSubItemOfGrid = null;
        let sel = $('misr').find(this.selector);
        $(sel).hide();
        return;
    }

    onDocumentClick($event) {
        let btnEl = $($event.target);
        if ($(btnEl).data('rowid') && $(btnEl).data('rowid').indexOf('subrow') > -1) {
            this.tryOpenPopup($event);
        } else {
            this.hidePopups();
            $event.stopPropagation();
            // $event.preventDefault();
        }
    }

    onResize() {
        this.hidePopups();
    }

    selectRow(group, j) {
        // nothing
    }

    private addExpandRow(itemId = null, groupId = null) {
        let val = this.provider.PagerProvider.getCurrentPage() + '|' + itemId + '|' + groupId;
        let expSubRows = this.provider.expandedSubRowsRows;
        if (expSubRows.indexOf(val) == -1) {
            expSubRows.push(val);
        }
    }

    private removeExpandRow(itemId = null, groupId = null) {
        let val = this.provider.PagerProvider.getCurrentPage() + '|' + itemId + '|' + groupId;
        let expSubRows = this.provider.expandedSubRowsRows;
        let index = expSubRows.indexOf(val);
        if (index > -1) {
            expSubRows.splice(index, 1);
        }
    }

    private onDestroy(item) {
        $.each(this.provider.expandedSubRowsRows, (k, v: string) => {
            if (v) {
                let valArr = v.split('|');
                if (valArr[0] == this.provider.PagerProvider.getCurrentPage().toString() && valArr[1] == item.id) {
                    this.removeExpandRow(valArr[1], valArr[2]);
                }
            }
        });
    }

    private getExpRowsForCurrentPage(): number[] {
        let page = this.provider.PagerProvider.getCurrentPage().toString();
        let res = [];
        $.each(this.provider.expandedSubRowsRows, (k, v: string) => {
            if (v) {
                let valArr = v.split('|');
                if (valArr[0] == page) {
                    res.push(valArr);
                }
            }
        });


        return res;
    }

    raisePreviewWorkflow(id: number) {
        if(!this.provider.canRaisePreviewWfBool) {
            return;
        }
        this.misrService.raisePreviewWorkflow(id).subscribe((res) => {
            this.provider.notificator.notifyShow(1, 'Preview workflow raised successfully');
        }, (err) => {
            this.provider.notificator.notifyShow(2, err.error.Error);
        })
    }
}
