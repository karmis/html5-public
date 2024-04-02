import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Injectable,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Subject , Subscription} from "rxjs";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../search/slick-grid/services/slick.grid.service';
import { ViewsProvider } from '../../search/views/providers/views.provider';
import { LocatorsCommentsViewsProvider } from './providers/views.provider';
import { SlickGridComponent } from '../../search/slick-grid/slick-grid';
import { LocatorsCommentsSlickGridProvider } from './providers/slick.grid.provider';
import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";

@Component({
    selector: 'imfx-logger-comments',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [SlickGridProvider
        ,LocatorsCommentsSlickGridProvider
        ,{provide: SlickGridProvider, useClass: LocatorsCommentsSlickGridProvider}
        ,SlickGridService
        ,ViewsProvider
        ,LocatorsCommentsViewsProvider
        ,{provide: ViewsProvider, useClass: LocatorsCommentsViewsProvider}]
})
@Injectable()
export class IMFXLocatorsCommentsComponent {
    @Input() config: any;
    @Input() reloadData: Subject<any>;
    @Input() onRowUnselected: Subject<any>;
    private rd: Subscription;
    private onRU: Subscription;
    @Input() locatorsFrameSettings: {
        ReadOnly: boolean,
        Columns: any[]
    } = {
        ReadOnly: null,
        Columns: []
    };
    @Output() onDelete: EventEmitter<any> = new EventEmitter();
    @Output() saveValid: EventEmitter<any> = new EventEmitter();
    @Output() onSetTaggingNode: EventEmitter<any> = new EventEmitter();
    @Output() onSetTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    @Output() goToTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    @Output() isDataValid: EventEmitter<any> = new EventEmitter<any>();
    @Output() timecodesInvalid: EventEmitter<any> = new EventEmitter<any>();
    public onTimecodeEdit: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('slickGridComp', {static: true}) slickGrid: SlickGridComponent;
    public compIsLoaded = false;
    @Input('taxonomySettings') taxonomySettings: any[];
    private taxonomy: Array<any> = [];
    private seriesCountForNewItemId = 0;
    private locatorsCommentsSlickGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewMode: 'table',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                // hasOuterFilter: this.config.hasOuterFilter,
                isThumbnails: false,
                externalWrapperEl: '#locatorsCommentsSlickGridextErnalWrapper',
                search: {
                    enabled: false
                },
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 45,
                fullWidthRows: true,
                multiAutoHeight: true,
            }
        })
    });
    private totalDuration: string = '00:00:00:00';
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                // private detailService: DetailService,
                @Inject(Injector) public injector: Injector,
                private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.selectMediaTagging();
    }

    ngAfterViewInit() {
        this.config.moduleContext = this;
        (this.slickGrid.module as SlickGridConfigModuleSetups).externalWrapperEl = '#locatorsCommentsSlickGridextErnalWrapper' + this.config.id;
        this.fillTableRows(this.config.series);
        this.rd = this.reloadData.subscribe(event => {
            this.selectMediaTagging();
            this.fillTableRows(this.config.series);
        });
        this.onRU = this.onRowUnselected.subscribe(event => {
            this.unselectRow();
        });
        this.slickGrid.provider.onSelectRow.subscribe((rowIndex: number) => {
            this.onSelectRow(rowIndex);
        });

        this.slickGrid.provider.formatterTextOnChange.subscribe((data) =>{
            this.addNote(data);
        });
        this.slickGrid.provider.onRowDelete.subscribe((res: any) => {
            this.onDelete.emit(res);
            let resId = res.Id || res.customId;
            let id = null;
            let isValid = true;
            this.config.series.forEach((el, ind) => {
                if ( el.Id === resId || el.customId === resId ) {
                    id = ind;
                } else {
                    isValid = isValid && !el.timecodesNotValid;
                }
            });

            if (id !== null) {
                this.config.series.splice(id, 1);
            }
            if (res.Id == 0) { // if delete non saved locator
                id = null;
                this.config.locatorsComponent.config.series.forEach((el, ind) => {
                    if ( el.Id === resId || el.customId === resId )
                        id = ind;
                });
                if (id !== null) {
                    this.config.locatorsComponent.config.series.splice(id, 1);
                }
            } else { // if delete already exists locator
                this.config.locatorsComponent.config.series.filter(function (el) {
                    return el.Id === res.Id;
                }).forEach(function (el) {
                    el.Id = el.Id * -1; // if Id < 0 then delete in backend
                });
            }

            let locator = (<any>this.slickGrid.provider.getSelectedRow());
            if (locator) {
                this.setNode({
                    markers: [
                        {time: locator.InTc},
                        {time: locator.OutTc}
                    ],
                    id: locator.timelineId
                });
            } else {
                this.config.elem.emit('clearMarkers', 0);
            }
            this.isDataValid.emit(isValid);
            this.timecodesInvalid.emit(!isValid);
            this.calcTotalDuration();
        });
        this.goToTimecodeString.subscribe(tc => {
            this.onSetTimecodeString.emit(tc);
        });
        this.onTimecodeEdit.subscribe(data => {
            if (data.error) {
                this.isDataValid.emit(false);
                this.timecodesInvalid.emit(true);
                data.timecode = null; // for validation
            } else {
                if (data.type == 'In') {
                    data.field = 'InTc';
                    this.setTimecode(data);
                } else if (data.type == 'Out') {
                    data.field = 'OutTc';
                    this.setTimecode(data);
                }
                let idx = this.slickGrid.provider.slick.getSelectedRows()[0];
                this.slickGrid.provider.slick.invalidateRow(idx);
                this.slickGrid.provider.slick.render();
            }
        });
        this.unselectRow();
    };
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.rd.unsubscribe();
        this.onRU.unsubscribe();
    };

    public loadComponentData() {
        this.slickGrid.provider.resize();
        if (!this.compIsLoaded) {
            this.selectMediaTagging();
        }
    };
    /**
     * add media tagging data into grid
     */
    selectMediaTagging() {
        this.compIsLoaded = true;
        let self = this;
        this.seriesCountForNewItemId = this.config.series.length;
        this.config.series.forEach(function (el, ind) {
            el.tagsEditable = true;
            el.indicator = self.getCssClass(el);
            el.thumbIn = self.config.file["THUMBURL"];
            el.thumbOut = self.config.file["THUMBURL"];
            el.timelineId = self.config.id + '_' + ind;
        });
    };

    fillTableRows(series) {
        let tableRows = [];
        let index = 1;
        let isValid = true;

        series.forEach((el, ind) => {
            el.timecodesNotValid = this.timecodeInOutValidation(el, TimeCodeFormat[this.config.file.TimecodeFormat]);
            isValid = isValid && !el.timecodesNotValid;
            tableRows.push({
                $id: index++,
                Id: el.Id,
                TagType: el.TagType,
                InTc: el.InTc,
                OutTc: el.OutTc,
                Notes: el.Notes,
                Tags: el.TaxonomyLinks,
                tagsEditable: el.tagsEditable,
                thumbIn: el.thumbIn,
                thumbOut: el.thumbOut,
                indicator: el.indicator,
                timelineId: el.timelineId,
                customId: el.customId,
                DurationTc: this.calcDurationTimecode(el) || '00:00:00:00',
                timecodesNotValid: el.timecodesNotValid
            });
            el.DurationTc = this.calcDurationTimecode(el) || '00:00:00:00';
        });

        let globalColsView = this.injector.get(LocatorsCommentsViewsProvider).getCustomColumns(null, this.config.readOnly),
            toInclude = this.config.columns || [],
            toExclude = (this.locatorsFrameSettings && Array.isArray(this.locatorsFrameSettings.Columns))
                ? this.locatorsFrameSettings.Columns.filter(e => !e.Visible).map(e => e.Id)
                : [],
            availableCols = globalColsView;

        availableCols = availableCols.filter(el => el.field == '*' || toInclude.indexOf(el.field) > -1);
        availableCols = availableCols.filter(el => toExclude.indexOf(el.field) == -1);

        this.slickGrid.provider.setGlobalColumns(availableCols);
        this.slickGrid.provider.setDefaultColumns(availableCols, [], true);
        this.slickGrid.provider.buildPageByData({Data: tableRows});
        // this.config.elem.emit('isDataValid', isValid);
        // this.config.elem.emit('timecodesInvalid', !isValid);
        this.isDataValid.emit(isValid);
        this.timecodesInvalid.emit(!isValid);
        this.calcTotalDuration();
        this.compIsLoaded = true;
    };

    private timecodeInOutValidation(el, timecodeFormat) {
        const tcIn = TMDTimecode.fromString(el.InTc, timecodeFormat).toFrames();
        const tcOut = TMDTimecode.fromString(el.OutTc, timecodeFormat).toFrames();
        if (tcIn > tcOut) {;
            return true;
        } else {
            return false;
        }
    };

    refreshGrid(data?: any) {
        if (data) {
            this.config.series = data.series.filter(el => { return el.TagType.toLowerCase() == this.config.tagType.toLowerCase(); });
            this.selectMediaTagging();
        } else {
            this.seriesCountForNewItemId = 0;
        }
        this.fillTableRows(this.config.series);
    }


    /**
     * sent emitter for setting markers into player
     */
    setNode(o) {
        this.onSetTaggingNode.emit({markers: o.markers, m_type: 'locator', id: o.id});
    };

    /**
     * add new clip or replace selected clip
     */
    addClip(data, replace, currentTabsId) {
        if (!replace) {
            this.addNewClip(data, currentTabsId);
        }
        else {
            this.replaceClip(data);
        }
        this.calcTotalDuration();
        this.saveValid.emit();
    }
    addEntry(replace) {
        this.config.elem.emit('getTimecodesForEntry', replace);
    }

    /**
     * add new clip
     */
    addNewClip(el, currentTabsId) {
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        let newClip = {
            'Id': 0, // for new entry it should be 0
            'InTc': el.startTimecodeString || '00:00:00:00',
            'OutTc': el.stopTimecodeString || '00:00:00:00',
            'DurationTc': this.calcDurationTimecode({InTc: el.startTimecodeString, OutTc:  el.stopTimecodeString}) || '00:00:00:00',
            'Notes': '',
            'TaxonomyLinks': [],
            'TagType': this.config.tagType[0].toUpperCase() + this.config.tagType.slice(1),
            'tagsEditable': true,
            'thumbIn': el.startThumbnail,
            'thumbOut': el.stopThumbnail,
            'indicator': {cssClass: 'green', title: 'iMfxOriginal'},
            'Origin': 'iMfxOriginal',
            'customId': currentTabsId + '_' + this.seriesCountForNewItemId++,   // el.customId //'_new' + new Date().getTime()
            'timecodesNotValid': TMDTimecode.fromString(el.startTimecodeString, timecodeFormat).toFrames() > TMDTimecode.fromString(el.stopTimecodeString, timecodeFormat).toFrames()
        };
        let sgp = this.slickGrid.provider;

        this.config.series.push(newClip);
        this.config.locatorsComponent.config.series.push(newClip);
        this.config.elem.emit('updateLocator', {
            fileGuid: this.config.file.DFILE_LINK_GUID,
            fileId: this.config.file.ID,
            series: this.config.locatorsComponent.config.series
        });
        this.fillTableRows(this.config.series);

        let rows = this.slickGrid.provider.getData();
        sgp.setSelectedRow((<any>rows[rows.length - 1]).id);

        sgp.slick.scrollRowToTop((<any>rows[rows.length - 1]));

        el.customId = newClip.customId;
        this.config.elem.emit('clipAdded', {el: el, clip: newClip});
        this.setNode({
            markers: [
                {time: newClip.InTc},
                {time: newClip.OutTc}
            ],
            id: newClip.customId
        });
    }

    /**
     * replace selected clip
     */
    replaceClip(el) {
        let sgp = this.slickGrid.provider;
        let locator = this.config.series[sgp.getSelectedRowId()];
        locator.InTc = el.startTimecodeString || locator.InTc;
        locator.OutTc = el.stopTimecodeString || locator.OutTc;
        locator.DurationTc = this.calcDurationTimecode(locator);
        const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        const tcIn = TMDTimecode.fromString(locator.InTc, timecodeFormat).toFrames();
        const tcOut = TMDTimecode.fromString(locator.OutTc, timecodeFormat).toFrames();
        if (tcIn > tcOut) {;
            locator.timecodesNotValid = true;
        } else {
            locator.timecodesNotValid = false;
        }
        this.config.elem.emit('updateLocator', {
            fileGuid: this.config.file.DFILE_LINK_GUID,
            fileId: this.config.file.ID,
            series: this.config.locatorsComponent.config.series
        });
        if(!locator.timecodesNotValid)
            this.config.elem.emit('clipReplaced', {
                oldClipId: locator.customId || locator.timelineId,
                newClip: el
            });
        this.fillTableRows(this.config.series);
        sgp.setSelectedRow(locator.id);
        this.setNode({
            markers: [
                {time: locator.InTc},
                {time: locator.OutTc}
            ],
            id: locator.timelineId
        });
    };

    /**
     * add tag into item
     */
    addTag(taxonomyTag, gridRowData?): boolean {
        let res = false;
        let rowIndex = (gridRowData) ? gridRowData['id'] : this.slickGrid.provider.getSelectedRowId();
        if (rowIndex == undefined)
            return false;
        let tgExists = false; // tag doesn't exists
        for (let i = 0; i < this.config.series[rowIndex].TaxonomyLinks.length; i++) {
            if (this.config.series[rowIndex].TaxonomyLinks[i].TaxonomyId == taxonomyTag.ID) {
                tgExists = true; // tag exists
            }
        }
        if (!tgExists) {
            this.config.series[rowIndex].TaxonomyLinks.push({
                "TaxonomyId": taxonomyTag.ID,
                "TaxonomyText": taxonomyTag.Name||taxonomyTag.SUBJECT_NAME
            });
            res = true;
        }

        this.saveValid.emit();

        return res;
    }
    /**
     * remove tag from item
     */
    removeTag(text) {
      this.saveValid.emit();
    }

    /**
     * add notes into item
     */
    addNote(data) {
        let rowIndex = data.data.rowNumber;
        this.config.series[rowIndex].Notes = data.value;
        this.saveValid.emit();
    }

    unselectRow() {
        this.slickGrid.provider.setSelectedRow();
    }
    onSelectRow(index) {
    }

    getCssClass(locator) {
        let cssClass = ''
            ,locatorColorList = {
            'iMfxOriginal' : 'green',
            'AvidLocator' : 'red',
            'FCP' : 'yellow',
            'Premier' : "blue"
        };

        cssClass = locatorColorList[locator.Origin] ? locatorColorList[locator.Origin] : '';

        return {cssClass: cssClass, title: locator.Origin};
    }
    setFocusOnGrid() {
        if (this.slickGrid.provider.module.canSetFocus) {
            this.slickGrid.provider.module.isFocused = true;
            this.cdr.detectChanges();
        }
    }
    private setTimecode(data) {
        let sgp = this.slickGrid.provider;
        let selectedRow = sgp.getSelectedRow();
        let locator = this.config.series[sgp.getSelectedRowId()];
        locator[data.field] = data.timecode;
        (<any>selectedRow).DurationTc = locator.DurationTc = this.calcDurationTimecode(locator);
        selectedRow[data.field] = data.timecode;
        if (data.timecode != null) {
            const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
            const tcIn = TMDTimecode.fromString(locator.InTc, timecodeFormat).toFrames();
            const tcOut = TMDTimecode.fromString(locator.OutTc, timecodeFormat).toFrames();
            if (tcIn > tcOut) {
                locator.timecodesNotValid = true;
                (<any>selectedRow).timecodesNotValid = true;
                data.error = true;
                this.isDataValid.emit(false);
                this.timecodesInvalid.emit(true);
                // this.config.elem.emit('isDataValid', false);
                // this.config.elem.emit('timecodesInvalid', true);
            } else {
                locator.timecodesNotValid = false;
                (<any>selectedRow).timecodesNotValid = false;
                this.isDataValid.emit(true);
                this.timecodesInvalid.emit(false);
                // this.config.elem.emit('isDataValid', true);
                // this.config.elem.emit('timecodesInvalid', false);
            }
            this.slickGrid.provider.formatterTimedcodeIsValid.emit();
            this.config.elem.emit('updateLocator', {
                fileGuid: this.config.file.DFILE_LINK_GUID,
                fileId: this.config.file.ID,
                series: this.config.locatorsComponent.config.series
            });
            this.config.elem.emit('clipReplaced', {
                oldClipId: locator.customId || locator.timelineId,
                newClip: {
                    startTimecodeString: locator.InTc,
                    stopTimecodeString: locator.OutTc
                }
            });
            this.calcTotalDuration();
            this.saveValid.emit();
        }
    }
    private disableReplaceBnt() {
        if (this.config.playerExist) {
            return !this.slickGrid.provider.slick || !this.slickGrid.provider.getSelectedRow();
        } else {
            return true;
        }
    }
    private calcDurationTimecode(row) {
        let soms = row.InTc;
        let eoms = row.OutTc;
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        return TMDTimecode.fromString(eoms, timecodeFormat).substract(TMDTimecode.fromString(soms, timecodeFormat)).toString();
    }
    private calcTotalDuration() {
        let summ = 0;
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        this.config.series.forEach(el => {
            summ += TMDTimecode.fromString(el.DurationTc, timecodeFormat).toFrames();
        });
        this.totalDuration =  TMDTimecode.fromFrames(summ, timecodeFormat).toString();
    }
}
