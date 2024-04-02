import {
    Component,
    ViewEncapsulation, Injectable, Inject, ChangeDetectorRef, EventEmitter, ViewChild, Injector, Input, Output
} from '@angular/core';
import { DetailService } from '../../../../../modules/search/detail/services/detail.service';
import { SlickGridComponent } from '../../../slick-grid/slick-grid';
import {
  SlickGridConfig,
  SlickGridConfigModuleSetups,
  SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../slick-grid/services/slick.grid.service';
import {SlickGridColumn, SlickGridSelect2FormatterEventData} from '../../../slick-grid/types';
import { SearchFormProvider } from '../../../form/providers/search.form.provider';
import {AVFaultsSlickGridProvider} from "./providers/av.faults.slick.grid.provider";
import {AVFaultsViewsProvider} from "./providers/av.faults.views.provider";
import {DetailProvider} from "../../providers/detail.provider";
import {TimeCodeFormat, TMDTimecode} from "../../../../../utils/tmd.timecode";
import {Observable,  Subscription , Subject} from "rxjs";
import {LookupService} from "../../../../../services/lookup/lookup.service";
import { takeUntil } from 'rxjs/operators';
import {EventsSlickGridProvider} from "../events.tab.component/providers/events.slick.grid.provider";

@Component({
    selector: 'imfx-av-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: AVFaultsSlickGridProvider},
        SlickGridService,
        SearchFormProvider,
        DetailService,
        // DetailProvider,
        AVFaultsViewsProvider
    ]
})
@Injectable()
export class AVFaultsTabComponent {
    config: any;
    compIsLoaded = false;
    @Input() onRefresh: Subject<any> = new Subject();
    @Input() onRowUnselected: Subject<any> = new Subject();
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    public onTimecodeEdit: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDataChanged: EventEmitter<any> = new EventEmitter();
    @Output() isDataValid: EventEmitter<any> = new EventEmitter();
    @Output() timecodesInvalid: EventEmitter<any> = new EventEmitter();
    @Output() getTimecodesForEntry: EventEmitter<any> = new EventEmitter();
    @Output() onSetTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    @Output() goToTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    public onSectorsValueChanged: EventEmitter<any> = new EventEmitter<any>();
    public waitForInOutTimecodes: boolean = false;
    public playerExist: boolean = true;
    public validationEnabled: boolean = true;
    protected gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                canSetFocus: false,
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                forceFitColumns: true,
                multiAutoHeight: true,
                rowHeight: 40  // wil not work until call this.slickGrid.provider.setRowHeight('Tags');
            }
        })
    });

    private columns: Array<SlickGridColumn>;
    private AVFaultsTypes: Array<any> = [];
    private onRowUnselectedSubscriber: Subscription;
    private totalDuration: string = '00:00:00:00';
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private detailService: DetailService,
                private lookup: LookupService,
                private injector: Injector) {
        this.onRefresh.pipe(takeUntil(this.destroyed$)).subscribe(data => {
            this.refreshGrid(data.file, data.readOnly);
        });
    }
    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.getAVFaultsTypesFromLookup().pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                this.loadCompData();
            });
        }
        this.goToTimecodeString.subscribe(tc => {
            this.onSetTimecodeString.emit(tc);
        });
        this.onTimecodeEdit.subscribe(data => {
            if (data.error) {
                this.isDataValid.emit(false);
                this.timecodesInvalid.emit(true);
            } else {
                if (data.type == 'Timecode In') {
                    data.field = 'TIMECODE_IN';
                    this.setTimecode(data);
                } else if (data.type == 'Timecode Out') {
                    data.field = 'TIMECODE_OUT';
                    this.setTimecode(data);
                }
                this.calcDurationTimecode();
                let idx = this.slickGridComp.provider.slick.getSelectedRows()[0];
                this.slickGridComp.provider.slick.invalidateRow(idx);
                this.slickGridComp.provider.slick.render();
                this.getValidation(true);
            }
        });
        this.onSectorsValueChanged.subscribe(data => {
            let avFault = (this.config.file['Faults'] || []).find(e => e.ID == data.ID);
            if (avFault) {
                avFault['SECTORS'] = data.data || null;
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
    }
    loadCompData() {
        if(!this.slickGridComp || !this.slickGridComp.config) {
            return;
        }
        this.slickGridComp.provider.setDefaultColumns(
            this.fillColumns(),
            this.columns.map(function(el) { return el.field; } ),
            true
        );
        let avFaults = this.slickGridComp.provider.deleteUnnecessaryDataBeforeSaving(this.config.file['Faults']);
        let detailProvider = this.injector.get(DetailProvider);
        const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        avFaults.forEach((el: any) => {
            el.videoSom = this.config.videoSom;
            el.videoEom = this.config.videoEom;
            if (!this.config.readOnly) {
                this.timecodeInOutValidation(el, timecodeFormat);
            }
        });
        (<any>this.slickGridComp.provider)
            .buildPageByResponseData(detailProvider._deepCopy(avFaults));
        this.calcTotalDuration();
        this.cdr.detectChanges();
    };
    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.getAVFaultsTypesFromLookup().pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                this.loadCompData();
            });
        }
    };

    public refreshGrid(data?: any, readOnly?: boolean) {
        if (readOnly != null) {
            this.config.readOnly = readOnly;
        };
        if (data) {
            this.config.file = data;
        };
        this.loadCompData();
        this.getValidation(true);
    };
    addEntry(replace) {
        this.getTimecodesForEntry.emit(replace);
    }
    unselectRow() {
        this.slickGridComp.provider.setSelectedRow();
    }
    addAVFaultsToGrid(data) {
        if (!this.config.readOnly) {
            let avFaults = this.config.file['Faults'];
            let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
            if (data.replace) {
                this.addInOut(data);
            } else {
                let newItem = {
                    DURATION: TMDTimecode.fromString(data.stopTimecodeString, timecodeFormat).substract(TMDTimecode.fromString(data.startTimecodeString, timecodeFormat)).toString(),
                    TIMECODE_IN: data.startTimecodeString || TMDTimecode.fromFrames(0, timecodeFormat).toString(),
                    TIMECODE_OUT: data.stopTimecodeString || TMDTimecode.fromFrames(0, timecodeFormat).toString(),
                    CTNR_NUM: 1,
                    ID: 0,
                    FAULT_ID: '',
                    NOTES: '',
                    SEVERITY: '',
                    MI_ID: this.config.file.ID,
                    TypeName: '',
                    customId: new Date().getTime(),
                    videoSom: this.config.videoSom,
                    videoEom: this.config.videoEom,
                    timecodesNotValid: TMDTimecode.fromString(data.startTimecodeString, timecodeFormat).toFrames() > TMDTimecode.fromString(data.stopTimecodeString, timecodeFormat).toFrames()
                }
                avFaults.push(newItem);
                let detailProvider = this.injector.get(DetailProvider);
                let _data = this.slickGridComp.provider.prepareData(detailProvider._deepCopy(avFaults), avFaults.length);
                this.slickGridComp.provider.setData(_data, true);
                this.slickGridComp.provider.setSelectedRow(_data.length - 1);
                this.slickGridComp.provider.slick.scrollRowToTop(_data[_data.length - 1]);
                this.calcTotalDuration();
                this.onDataChanged.emit();
                this.getValidation(true);
            }
            this.selectOrClearSegmentInPlayer();
        }
    }
    addInOut(data) {
        if (!this.config.readOnly) {
            if (!this.slickGridComp.provider.getSelectedRow()) return;
            let clip = data;
            // set in
            this.setTimecode({
                timecode: clip.startTimecodeString || this.slickGridComp.provider.getSelectedRow()['TIMECODE_IN'],
                type: 'Timecode In',
                field: 'TIMECODE_IN'
            }, true);
            // set out
            this.setTimecode({
                timecode: clip.stopTimecodeString || this.slickGridComp.provider.getSelectedRow()['TIMECODE_OUT'],
                type: 'Timecode Out',
                field: 'TIMECODE_OUT'
            });
            // set duration
            let columns = this.slickGridComp.provider.getColumns();
            let idx = this.slickGridComp.provider.slick.getSelectedRows()[0];
            let avFaults = this.config.file['Faults'];
            let editId = this.slickGridComp.provider.getSelectedRow()['customId'] || this.slickGridComp.provider.getSelectedRow()['ID'];
            if (!clip.duration) {
                this.calcDurationTimecode();
            } else {
                this.slickGridComp.provider.getSelectedRow()['DURATION'] = clip.duration.toString();
                avFaults.forEach(el => {
                    if (el.customId == editId || el.ID == editId) {
                        el.DURATION = clip.duration.toString();
                    }
                });
            }

            this.slickGridComp.provider.slick.invalidateRow(idx);
            this.slickGridComp.provider.slick.render();
            this.onDataChanged.emit();
            this.getValidation(true);
        }
    }

    private selectOrClearSegmentInPlayer() {
        let entry = (<any>this.slickGridComp.provider.getSelectedRow());
        if (entry) {
            this.config.elem.emit('setMarkers', {
                markers: [
                    {time: entry.TIMECODE_IN},
                    {time: entry.TIMECODE_OUT}
                ],
                m_type: 'locator',
                id: entry.id
            });
        } else {
            this.config.elem.emit('clearMarkers', 1);
        }
    }
    setFocusOnGrid() {
        if (this.slickGridComp.provider.module.canSetFocus) {
            this.slickGridComp.provider.module.isFocused = true;
            this.cdr.detectChanges();
        }
    }
    getAVFaultsTypesFromLookup(): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.lookup.getLookups('AvFaultType').pipe(
                takeUntil(this.destroyed$)
            ).subscribe(
                (res: any) => {
                    this.AVFaultsTypes = res;
                    observer.next(res);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });
    }

    private fillColumns() {
        this.columns = [];
        this.columns = this.injector.get(AVFaultsViewsProvider).getCustomColumns(null, this.config.readOnly);
        if (!this.config.readOnly) {
            this.columns.filter(el=>{ return el.field == 'FAULT_ID'; })[0].__deps.data = {
                values: this.AVFaultsTypes,
                rule: this.lookup.getLookupRuleForConvertToSelect2Item('AvFaultType'),
                validationEnabled: this.validationEnabled,
                grouping: true
            };
            this.slickGridComp.provider.formatterSelect2OnSelect.subscribe((res: SlickGridSelect2FormatterEventData) => {
                let item = this.AVFaultsTypes.filter(el => {
                    return el.ID == res.value.id;
                })[0];
                if (item) {
                    let avFaults = this.config.file['Faults']; // this.avFaults;
                    let _id = res.data.data['ID'] || res.data.data['customId'];
                    avFaults.forEach(el => {
                        if (el.ID === _id || el.customId === _id) {
                            el['TypeName'] = item.TypeCode;
                            el[res.data.columnDef.field] = parseInt(<any>res.value.id, 10);
                        }
                    });
                    res.data.data[res.data.columnDef.field] = parseInt(<any>res.value.id, 10);
                    res.data.data['TypeName'] = item.TypeCode;

                    let detailProvider = this.injector.get(DetailProvider);
                    let _data = this.slickGridComp.provider.prepareData(detailProvider._deepCopy(avFaults), avFaults.length);
                    this.slickGridComp.provider.setData(_data, true);
                    this.slickGridComp.provider.setSelectedRow(_data.length - 1);
                }
                this.onDataChanged.emit();
                this.getValidation(true);
            });
            this.slickGridComp.provider.onRowDelete.subscribe((res: any) => {
                let _faults = this.config.file['Faults'];
                let id = null;
                let _id = res.ID || res.customId;
                _faults.forEach((el, ind) => {
                    if (el.ID === _id || el.customId === _id) {
                        id = ind;
                    }
                });
                if (id !== null) {
                    let _fault = _faults.splice(id, 1);
                    if (_fault[0].customId == null) {
                        _fault[0].ID *= -1; // if Id < 0 then delete in backend
                        this.config.file.DeletedFaults.push(_fault[0]);
                    }
                }
                this.selectOrClearSegmentInPlayer();
                this.onDataChanged.emit();
                this.getValidation(true);
                this.calcTotalDuration();
            });
            this.slickGridComp.provider.formatterTextOnChange.subscribe((res: SlickGridSelect2FormatterEventData) => {
                let _faults = this.config.file['Faults'];
                let _id =  res.data.data.ID || res.data.data['customId'];
                _faults.forEach(el => {
                    if ( el.ID === _id || el.customId === _id ) {
                        el[res.data.columnDef.field] = res.value;
                    }
                });
                res.data.data[res.data.columnDef.field] = res.value;
                this.onDataChanged.emit();
                this.getValidation(true);
            });
        }
        return this.columns;
    };
    updateDataIds(ids) {
        let _faults = this.config.file['Faults'].filter(el => {
            return el.customId != null;
        });
        _faults.forEach((el, idx) => {
            el.ID = ids[idx];
            delete el.customId;
        });
        this.config.file.DeletedFaults = [];
        let detailProvider = this.injector.get(DetailProvider);
        let _data = this.slickGridComp.provider.prepareData(detailProvider._deepCopy(this.config.file['Faults']), this.config.file['Faults'].length);
        this.slickGridComp.provider.setData(_data, true);
    }
    private setTimecode(data, withoutValidation?) {
        this.slickGridComp.provider.getSelectedRow()[data.field] = data.timecode;
        let avFaults = this.config.file['Faults'];
        let editId = this.slickGridComp.provider.getSelectedRow()['customId'] || this.slickGridComp.provider.getSelectedRow()['ID'];
        const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        avFaults.forEach(el => {
            if (el.customId == editId || el.ID == editId) {
                el[data.field] = data.timecode;
                if (!withoutValidation) {
                    this.timecodeInOutValidation(el, timecodeFormat);
                }
            }
        });
        this.calcTotalDuration();
    }
    private calcDurationTimecode() {
        let soms = this.slickGridComp.provider.getSelectedRow()['TIMECODE_IN'];
        let eoms = this.slickGridComp.provider.getSelectedRow()['TIMECODE_OUT'];
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        let data = {
            timecode: TMDTimecode.fromString(eoms, timecodeFormat).substract(TMDTimecode.fromString(soms, timecodeFormat)).toString(),
            type: 'DURATION',
            field: 'DURATION'
        };
        this.setTimecode(data);
    }
    public updateTimedcodeSetSomEom(data) {
        this.config.videoSom = data.videoSom;
        this.config.videoEom = data.videoEom;
        let tableRows = this.slickGridComp.provider.getDataView().getItems();
        tableRows.forEach((el: any) => {
            el.videoSom = this.config.videoSom;
            el.videoEom = this.config.videoEom;
        });
        this.slickGridComp.provider.setData(tableRows, true);
        this.slickGridComp.provider.formatterTimedcodeSetSomEom.emit({videoSom: this.config.videoSom, videoEom: this.config.videoEom});
    }
    public getValidation(validGridTimecodes) {
        if (this.config.readOnly) {
            this.isDataValid.emit(true);
            this.timecodesInvalid.emit(false);
            return true;
        }
        if (!validGridTimecodes) { // timecodes are not valid
            this.isDataValid.emit(false);
            this.timecodesInvalid.emit(true);
        } else {
            let isValid = true;
            let faults = this.config.file['Faults'];
            const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
            faults.forEach(el => {
                this.config.validationFields.forEach(validF => {
                    if (el[validF] == undefined || el[validF] == null || el[validF] == '') {
                        isValid = false;
                    }
                    const tcIn = TMDTimecode.fromString(el.TIMECODE_IN, timecodeFormat).toFrames();
                    const tcOut = TMDTimecode.fromString(el.TIMECODE_OUT, timecodeFormat).toFrames();
                    if (tcIn > tcOut) {
                        isValid = false;
                        validGridTimecodes = false;
                    }
                });
            });
            this.isDataValid.emit(isValid);
            this.timecodesInvalid.emit(!validGridTimecodes);
        }
    }
    private disableReplaceBnt(){
        if (this.playerExist) {
            return !this.slickGridComp.provider.slick || !this.slickGridComp.provider.getSelectedRow();
        } else {
            return true;
        }
    }
    private calcTotalDuration() {
        let summ = 0;
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        let faults = this.config.file['Faults'];
        faults.forEach(el => {
            summ += TMDTimecode.fromString(el.DURATION, timecodeFormat).toFrames();
        });
        this.totalDuration =  TMDTimecode.fromFrames(summ, timecodeFormat).toString();
    }
    private timecodeInOutValidation(el, timecodeFormat) {
        const tcIn = TMDTimecode.fromString(el.TIMECODE_IN, timecodeFormat).toFrames();
        const tcOut = TMDTimecode.fromString(el.TIMECODE_OUT, timecodeFormat).toFrames();
        if (tcIn > tcOut) {;
            el.timecodesNotValid = true;
        } else {
            el.timecodesNotValid = false;
        }
    }
}
