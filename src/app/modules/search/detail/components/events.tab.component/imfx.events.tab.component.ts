import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Injectable,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { SlickGridComponent } from "../../../slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import { SlickGridProvider } from "../../../slick-grid/providers/slick.grid.provider";
import { SlickGridService } from "../../../slick-grid/services/slick.grid.service";
import { SearchFormProvider } from "../../../form/providers/search.form.provider";
import { EventsViewsProvider } from "./providers/views.provider";
import { Observable, Subject, Subscription } from "rxjs";
import { EventsSlickGridProvider } from "./providers/events.slick.grid.provider";
import { LookupService } from "../../../../../services/lookup/lookup.service";
import { SlickGridSelect2FormatterEventData } from "../../../slick-grid/types";
import { DetailProvider } from "../../providers/detail.provider";
import { TimeCodeFormat, TMDTimecode } from "../../../../../utils/tmd.timecode";
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'imfx-events-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: EventsSlickGridProvider},
        SearchFormProvider,
        SlickGridService,
        EventsViewsProvider,
        // DetailProvider
    ],
})
@Injectable()
export class IMFXEventsTabComponent {
    config: any;
    public compIsLoaded = false;
    @ViewChild('slickGridComp', {static: true}) slickGrid: SlickGridComponent;
    @Input() onRefresh: Subject<any> = new Subject();
    @Input() onRowUnselected: Subject<any> = new Subject();
    @Output() onDataChanged: EventEmitter<any> = new EventEmitter();
    @Output() isDataValid: EventEmitter<any> = new EventEmitter();
    @Output() timecodesInvalid: EventEmitter<any> = new EventEmitter();
    @Output() getTimecodesForEntry: EventEmitter<any> = new EventEmitter();
    @Output() onSetTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    @Output() goToTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    public onTimecodeEdit: EventEmitter<any> = new EventEmitter<any>();
    public waitForInOutTimecodes: boolean = false;
    public playerExist: boolean = true;
    validationEnabled: boolean = true;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewMode: 'table',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                canSetFocus: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 40,
                forceFitColumns: true
            }
        })
    });
    private mediaEventTypes: Array<any> = [];
    private onRowUnselectedSubscriber: Subscription;
    private totalDuration: string = '00:00:00:00';
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private lookup: LookupService,
                @Inject(Injector) public injector: Injector) {
        this.onRefresh.pipe(takeUntil(this.destroyed$)).subscribe(data => {
            this.refreshGrid(data.file, data.readOnly);
        });
    }

    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.getEventsTypesFromLookup().pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                this.selectEvents();
                this.callValidation();
            });
        }
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
                    data.field = 'SOMS';
                    this.setTimecode(data);
                } else if (data.type == 'Out') {
                    data.field = 'EOMS';
                    this.setTimecode(data);
                }
                this.calcDurationTimecode();
                let idx = this.slickGrid.provider.slick.getSelectedRows()[0];
                this.slickGrid.provider.slick.invalidateRow(idx);
                this.slickGrid.provider.slick.render();
                this.callValidation();
            }
        });
        this.onRowUnselectedSubscriber = this.onRowUnselected.subscribe(event => {
            this.unselectRow();
        });

        this.getValidation(true);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.onRowUnselectedSubscriber.unsubscribe();
    };

    public loadComponentData() {
        this.getEventsTypesFromLookup().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.selectEvents();
            this.callValidation();
        });
    };

    selectEvents() {
        if (!this.slickGrid || !this.slickGrid.config || !this.slickGrid.config.provider) {
            return;
        }
        this.slickGrid.provider.module.canSetFocus = false;
        let events = this.slickGrid.provider.deleteUnnecessaryDataBeforeSaving(this.config.file['Events']);
        if (events !== null && this.config.readOnly) {
            events.forEach((el: any) => {
                let eventType = this.mediaEventTypes.filter(function (elem) {
                    return elem.ID === el.TYPE;
                });
                el.TYPE_text = eventType.length > 0 ? eventType[0].NAME : el.TYPE;
                el.videoSom = this.config.videoSom;
                el.videoEom = this.config.videoEom;
            });
        }
        let globalColsView = this.injector.get(EventsViewsProvider).getCustomColumns(null, this.config.readOnly);
        if (!this.config.readOnly) {
            globalColsView.filter(el => {
                return el.field == "TYPE"
            })[0].__deps.data = {
                values: this.mediaEventTypes,
                rule: this.lookup.getLookupRuleForConvertToSelect2Item('MediaEventTypes'),
                validationEnabled: this.validationEnabled
            };
            this.slickGrid.provider.formatterSelect2OnSelect.subscribe((res: SlickGridSelect2FormatterEventData) => {
                let _events = this.config.file['Events'];
                let _id = res.data.data.ID || res.data.data['customId'];
                let eventTypes = this.mediaEventTypes.filter(el => {
                    return el.TX_PART == true;
                });
                let ind = 1;
                _events.forEach(el => {
                    if (el.ID === _id || el.customId === _id) {
                        el[res.data.columnDef.field] = parseInt(<any>res.value.id, 10);
                    }
                    if (eventTypes.filter(elem => {
                        return elem.NAME == el.TYPE_text;
                    }).length) {
                        el.PRT_NUM = ind++;
                    } else {
                        el.PRT_NUM = 0;
                    }
                });
                res.data.data[res.data.columnDef.field] = parseInt(<any>res.value.id, 10);
                let detailProvider = this.injector.get(DetailProvider);
                let _data = this.slickGrid.provider.prepareData(detailProvider._deepCopy(_events), _events.length);
                this.slickGrid.provider.setData(_data, true);
                this.onDataChanged.emit();
                this.callValidation();
            });

            this.slickGrid.provider.formatterTextOnChange.subscribe((res: SlickGridSelect2FormatterEventData) => {
                let _events = this.config.file['Events'];
                let _id = res.data.data.ID || res.data.data['customId'];
                _events.forEach(el => {
                    if (el.ID === _id || el.customId === _id) {
                        el[res.data.columnDef.field] = res.value;
                    }
                });
                res.data.data[res.data.columnDef.field] = res.value;
                this.onDataChanged.emit();
                this.callValidation();
            });
            this.slickGrid.provider.onRowDelete.subscribe((res: any) => {
                let resId = res.ID || res.customId;
                let events = this.config.file['Events'];
                let id = null;
                let index = 1;
                let eventTypes = this.mediaEventTypes.filter(el => {
                    return el.TX_PART == true;
                });
                events.forEach((el, ind) => {
                    if (el.ID === resId || el.customId === resId)
                        id = ind;
                });
                if (id !== null) {
                    let _event = events.splice(id, 1);
                    if (_event[0].customId == null) {
                        _event[0].ID *= -1;
                        this.config.file.DeletedEvents.push(_event[0]);
                    }
                }
                events.forEach((el, ind) => {
                    el.SQ_NUM = ind + 1;
                    if (eventTypes.filter(elem => {
                        return elem.NAME == el.TYPE_text;
                    }).length) {
                        el.PRT_NUM = index++;
                    } else {
                        el.PRT_NUM = 0;
                    }
                });
                let detailProvider = this.injector.get(DetailProvider);
                let _data = this.slickGrid.provider.prepareData(detailProvider._deepCopy(events), events.length);
                this.slickGrid.provider.setData(_data, true);
                //------select or clear player segment-------
                this.selectOrClearSegmentInPlayer();
                //-------------
                this.calcTotalDuration();
                this.onDataChanged.emit();
                this.callValidation();
            });
            const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
            events.forEach(el => {
                this.timecodeInOutValidation(el, timecodeFormat);
            });
        }
        this.slickGrid.provider.setGlobalColumns(globalColsView);
        this.slickGrid.provider.setDefaultColumns(globalColsView, [], true);
        let detailProvider = this.injector.get(DetailProvider);
        this.slickGrid.provider.buildPageByData({Data: detailProvider._deepCopy(events) || []});
        this.refreshGrid();
        this.calcTotalDuration();
        this.compIsLoaded = true;
    };

    refreshGrid(data?: any, readOnly?: boolean) {
        if (readOnly != null) {
            this.config.readOnly = readOnly;
        }

        if (data) {
            this.config.file = data;
            this.selectEvents();
        }

        this.callValidation();
        // setTimeout(() => {
        //   this.slickGrid.provider.resize();
        // }, 0);
    };

    getEventsTypesFromLookup(): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.lookup.getLookups('MediaEventTypes').pipe(
                takeUntil(this.destroyed$)
            ).subscribe(
                (res: any) => {
                    this.mediaEventTypes = res;
                    observer.next(res);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });
    }

    addEntry(replace) {
        this.getTimecodesForEntry.emit(replace);
    }

    addEventToGrid(data) {
        if (!this.config.readOnly) {
            let events = this.config.file['Events'];
            let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
            if (data.replace) {
                this.addInOut(data);
            } else {
                let newItem = {
                    DURATION_text: TMDTimecode.fromString(data.stopTimecodeString, timecodeFormat).substract(TMDTimecode.fromString(data.startTimecodeString, timecodeFormat)).toString(),
                    SOMS: data.startTimecodeString || TMDTimecode.fromFrames(0, timecodeFormat).toString(),
                    EOMS: data.stopTimecodeString || TMDTimecode.fromFrames(0, timecodeFormat).toString(),
                    PRT_NUM: 0,
                    SQ_NUM: events.length + 1,
                    PRT_TTL: '',
                    TYPE: null,
                    ID: 0,
                    MIID: this.config.file.ID,
                    PAR_TYPE: 4010, // const for events
                    TimecodeFormat: this.config.file.TimecodeFormat,
                    customId: new Date().getTime(),
                    videoSom: this.config.videoSom,
                    videoEom: this.config.videoEom,
                    timecodesNotValid: TMDTimecode.fromString(data.startTimecodeString, timecodeFormat).toFrames() > TMDTimecode.fromString(data.stopTimecodeString, timecodeFormat).toFrames()
                };
                events.push(newItem);
                let detailProvider = this.injector.get(DetailProvider);
                let _data = this.slickGrid.provider.prepareData(detailProvider._deepCopy(events), events.length);
                this.slickGrid.provider.setData(_data, true);
                this.slickGrid.provider.setSelectedRow(_data.length - 1);
                this.slickGrid.provider.slick.scrollRowToTop(_data[_data.length - 1]);
                this.calcTotalDuration();
                this.onDataChanged.emit();
                // this.isDataValid.emit(false);
                this.callValidation();
            }
            this.selectOrClearSegmentInPlayer();
        }
    }

    addInOut(data) {
        if (!this.config.readOnly) {
            if (!this.slickGrid.provider.getSelectedRow()) return;
            let clip = data;
            // set in
            this.setTimecode({
                timecode: clip.startTimecodeString || this.slickGrid.provider.getSelectedRow()['SOMS'],
                type: 'In',
                field: 'SOMS'
            }, true);
            // set out
            this.setTimecode({
                timecode: clip.stopTimecodeString || this.slickGrid.provider.getSelectedRow()['EOMS'],
                type: 'Out',
                field: 'EOMS'
            });
            // set duration
            let idx = this.slickGrid.provider.slick.getSelectedRows()[0];
            let events = this.config.file['Events'];
            let editId = this.slickGrid.provider.getSelectedRow()['customId'] || this.slickGrid.provider.getSelectedRow()['ID'];
            if (!clip.duration) {
                this.calcDurationTimecode();
            } else {
                this.slickGrid.provider.getSelectedRow()['DURATION_text'] = clip.duration.toString();
                events.forEach(el => {
                    if (el.customId == editId || el.ID == editId) {
                        el.DURATION_text = clip.duration.toString();
                    }
                });
            }
            this.slickGrid.provider.slick.invalidateRow(idx);
            this.slickGrid.provider.slick.render();
            this.onDataChanged.emit();
            this.callValidation();
        }
    }

    save() {
        this.config.elem.emit('save', {events: this.config.file['Events']});
    }

    updateDataIds(ids) {
        let events = this.config.file['Events'].filter(el => {
            return el.customId != null;
        });
        events.forEach((el, idx) => {
            el.ID = ids[idx];
            delete el.customId;
        });
        this.config.file.DeletedEvents = [];
        let detailProvider = this.injector.get(DetailProvider);
        let _data = this.slickGrid.provider.prepareData(detailProvider._deepCopy(this.config.file['Events']), this.config.file['Events'].length);
        this.slickGrid.provider.setData(_data, true);
    }

    getValidation(validGridTimecodes) {
        if (this.config.readOnly) {
            return true;
        }
        if (!validGridTimecodes) { // timecodes are not valid
            this.isDataValid.emit(false);
            this.timecodesInvalid.emit(true);
        } else {
            let isValid = true;
            let events = this.config.file['Events'];
            const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
            events.forEach(el => {
                this.config.validationFields.forEach(validF => {
                    if (el[validF] == undefined || el[validF] == null || el[validF] == '') {
                        isValid = false;
                    }
                });
                const tcIn = TMDTimecode.fromString(el.SOMS, timecodeFormat).toFrames();
                const tcOut = TMDTimecode.fromString(el.EOMS, timecodeFormat).toFrames();
                if (tcIn > tcOut) {
                    isValid = false;
                    validGridTimecodes = false;
                }
            });
            this.isDataValid.emit(isValid);
            this.timecodesInvalid.emit(!validGridTimecodes);
        }
    }

    setFocusOnGrid() {
        if (this.slickGrid.provider.module.canSetFocus) {
            this.slickGrid.provider.module.isFocused = true;
            this.cdr.detectChanges();
        }
    };

    public callValidation(isAsync: boolean = true) {
        let f = () => {
            if (this.destroyed$.isStopped) {
                return;
            }
            if (this.config.readOnly) {
                this.isDataValid.emit(true);
                this.timecodesInvalid.emit(false);
            } else {
                if (this.slickGrid.provider.getData().length == 0) {
                    this.getValidation(true);
                } else {
                    (<EventsSlickGridProvider>this.slickGrid.provider).rowCountForValidation = 0;
                    (<EventsSlickGridProvider>this.slickGrid.provider).validGrid = true;
                    (<EventsSlickGridProvider>this.slickGrid.provider).formatterTimedcodeIsValid.emit();
                }
            }
        };

        if (isAsync) {
            //to be sure than custom slick-grid formatters have been inited
            Promise.resolve().then(() => {
                f();
            });
        } else {
            f();
        }
    }

    public updateTimedcodeSetSomEom(data) {
        this.config.videoSom = data.videoSom;
        this.config.videoEom = data.videoEom;
        let tableRows = this.slickGrid.provider.getDataView().getItems();
        tableRows.forEach((el: any) => {
            el.videoSom = this.config.videoSom;
            el.videoEom = this.config.videoEom;
        });
        this.slickGrid.provider.setData(tableRows, true);
        this.slickGrid.provider.formatterTimedcodeSetSomEom.emit({
            videoSom: this.config.videoSom,
            videoEom: this.config.videoEom
        });
    }

    private unselectRow() {
        this.slickGrid.provider.setSelectedRow();
    };

    private selectOrClearSegmentInPlayer() {
        let entry = (<any>this.slickGrid.provider.getSelectedRow());
        if (entry) {
            this.config.elem.emit('setMarkers', {
                markers: [
                    {time: entry.SOMS},
                    {time: entry.EOMS}
                ],
                m_type: 'locator',
                id: entry.id
            });
        } else {
            this.config.elem.emit('clearMarkers', 1);
        }
    }

    private setTimecode(data, withoutValidation?) {
        this.slickGrid.provider.getSelectedRow()[data.field] = data.timecode;
        let events = this.config.file['Events'];
        let editId = this.slickGrid.provider.getSelectedRow()['customId'] || this.slickGrid.provider.getSelectedRow()['ID'];
        const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        events.forEach(el => {
            if (el.customId == editId || el.ID == editId) {
                el[data.field] = data.timecode;
                if (!withoutValidation) {
                    this.timecodeInOutValidation(el, timecodeFormat);
                }
            }
        });
        this.calcTotalDuration();
    }

    private timecodeInOutValidation(el, timecodeFormat) {
        const tcIn = TMDTimecode.fromString(el.SOMS, timecodeFormat).toFrames();
        const tcOut = TMDTimecode.fromString(el.EOMS, timecodeFormat).toFrames();
        if (tcIn > tcOut) {

            el.timecodesNotValid = true;
        } else {
            el.timecodesNotValid = false;
        }
    }

    private calcDurationTimecode() {
        let soms = this.slickGrid.provider.getSelectedRow()['SOMS'];
        let eoms = this.slickGrid.provider.getSelectedRow()['EOMS'];
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        let data = {
            timecode: TMDTimecode.fromString(eoms, timecodeFormat).substract(TMDTimecode.fromString(soms, timecodeFormat)).toString(),
            type: 'Duration',
            field: 'DURATION_text'
        };
        this.setTimecode(data);
    }

    private disableReplaceBnt() {
        if (this.playerExist) {
            return !this.slickGrid.provider.slick || !this.slickGrid.provider.getSelectedRow();
        } else {
            return true;
        }
    }

    private calcTotalDuration() {
        let summ = 0;
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        let faults = this.config.file['Events'];
        faults.forEach(el => {
            summ += TMDTimecode.fromString(el.DURATION_text, timecodeFormat).toFrames();
        });
        this.totalDuration = TMDTimecode.fromFrames(summ, timecodeFormat).toString();
    }
}
