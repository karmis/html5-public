import {
    Component,
    ViewEncapsulation, Injectable, Inject, ChangeDetectorRef, EventEmitter, ViewChild, Injector, Output
} from '@angular/core';
import { DetailService } from '../../../../../modules/search/detail/services/detail.service';
import { SlickGridComponent } from '../../../slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../slick-grid/slick-grid.config';
import { SlickGridService } from '../../../slick-grid/services/slick.grid.service';
import { SlickGridColumn } from '../../../slick-grid/types';
import { SearchFormProvider } from '../../../form/providers/search.form.provider';
import {ClipCommentViewsProvider} from './providers/clip.comment.views.provider';
import {ClipCommentSlickGridProvider} from './providers/clip.comment.slick.grid.provider';
import {SlickGridProvider} from '../../../slick-grid/providers/slick.grid.provider';
import { Subject } from 'rxjs';

@Component({
    selector: 'imfx-clip-comment-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: ClipCommentSlickGridProvider},
        SlickGridService,
        SearchFormProvider,
        ClipCommentViewsProvider
    ]
})
@Injectable()
export class IMFXClipCommentTabComponent {
    config: any;
    compIsLoaded = false;
    @ViewChild('slickGridComp', {static: false}) slickGrid: SlickGridComponent;
    @Output('commentRowSelected') public commentRowSelected: EventEmitter<any> = new EventEmitter<any>();
    protected gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                fullWidthRows: true,
                multiAutoHeight: false,
                rowHeight: 48
            }
        })
    });

    private columns: Array<SlickGridColumn>;
    private lastClipId: number = 0;
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private detailService: DetailService,
                private injector: Injector) {
    }

    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.fillTableRows(this.config.items);
        }
        this.lastClipId = this.config.items.length;
        this.slickGrid.provider.formatterTextOnChange.subscribe((data) => {
            this.setComment(data);
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public loadComponentData() {
        this.slickGrid.provider.setDefaultColumns(
            this.fillColumns(),
            this.columns.map(function (el) {
                return el.field;
            }),
            true
        );
        this.fillTableRows(this.config.items);
    }
    public setReadOnly(readOnly) {
        this.config.readOnly = readOnly;
        this.slickGrid.provider.formatterSetReadOnly.emit(this.config.readOnly);
    }
    public addNewClip(data) {
        let newClip = {
            'InTc': data.startTimecodeString,
            'OutTc': data.stopTimecodeString,
            'Comment': data.comment || '',
            'timelineId': this.lastClipId++
        };
        let sgp = this.slickGrid.provider;

        this.config.items.push(newClip);
        this.fillTableRows(this.config.items);
        sgp.setSelectedRow(newClip['timelineId']);
    }
    public replaceClip(data) {
        let clip = this.config.items.filter(el => {
            return el.timelineId == data.oldClipId
        })[0];
        if (clip) {
            clip.InTc = data.newClip.startTimecodeString;
            clip.OutTc = data.newClip.stopTimecodeString;
            this.fillTableRows(this.config.items);
        }
    }
    public removeClip(data) {
        let clipIdx = -1;
        this.config.items.forEach((el, idx) => {
            if(el.timelineId == data.ClipId) {
                clipIdx = idx;
            }
        })
        if (clipIdx >= 0) {
            this.config.items.splice(clipIdx, 1);
            this.fillTableRows(this.config.items);
        }
    }
    /**
     * sent emitter for setting clip comment to timeline
     */
    public setComment(data) {
        data.data.data.Comment = data.value;
        this.config.items.filter((x) => {
            return x.timelineId == data.data.data.timelineId;
        })[0].Comment  = data.value;

        this.cdr.detectChanges();
        this.config.elem.emit('setComment', {comment: data.data.data.Comment, id: data.data.data.timelineId});
    };
    private fillColumns() {
        this.columns = [];
        this.columns = this.injector.get(ClipCommentViewsProvider).getCustomColumns(this.config.readOnly);
        return this.columns;
    }
    private fillTableRows(items) {
        this.config.items = items;
        let tableRows = [];
        let self = this;
        let index = 1;
        let maxTagsLength = 0, tagsCount = 0;

        items.forEach((el, ind) => {
            tableRows.push({
                $id: index++,
                Id: el.Id,
                InTc: el.InTc,
                OutTc: el.OutTc,
                Comment: el.Comment,
                timelineId: el.timelineId
            });
        });

        let c = this.config.columns || [];
        let globalColsView = this.injector.get(ClipCommentViewsProvider).getCustomColumns(this.config.readOnly);
        let availableCols = globalColsView;

        if (c.length) {
            availableCols = globalColsView.filter(function (el) {
                return el.field == '*' || c.indexOf(el.field) > -1;
            });
        }

        this.slickGrid.provider.setGlobalColumns(availableCols);
        this.slickGrid.provider.setDefaultColumns(availableCols, [], true);
        this.slickGrid.provider.buildPageByData({Data: tableRows});

        this.compIsLoaded = true;
    }
    public selectComment(id) {
        this.config.items.forEach((el,ind)=>{
            if(el.timelineId==id) {
                this.slickGrid.provider.setSelectedRows([ind]);
            }
        })
    }
    public reorderClips(clipsData) {
        let buffArr = []
        clipsData.forEach(clip => {
            let buffClip = null;
            this.config.items.forEach(el => {
                if (el.timelineId == clip.ClipId){
                    buffClip = el;
                };
            })
            if(buffClip)
                buffArr.push(buffClip)
        });
        this.config.items = buffArr;
        this.fillTableRows(this.config.items);
    }

    public getClipCommentsItems() {
        return this.config.items;
    }
}
