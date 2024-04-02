import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
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
import { SlickGridColumn, SlickGridSelect2FormatterEventData } from "../../../slick-grid/types";
import { LookupService } from "../../../../../services/lookup/lookup.service";
import { IMFXHtmlPlayerComponent } from "../../../../controls/html.player/imfx.html.player";
import { VideoJSCurrentTimeProvider } from "../../../../controls/html.player/providers/videojs.current.time.provider";
import { AudioTracksService } from "./services/audio.tracks.service";
import { SegmentsSlickGridProvider } from "./providers/segments.slickgrid.provider";
import { SegmentsViewsProvider } from "./providers/views.provider";
import { DetailProvider } from "../../providers/detail.provider";
import { TimeCodeFormat, TMDTimecode } from "../../../../../utils/tmd.timecode";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { ArrayProvider } from "../../../../../providers/common/array.provider";

@Component({
    selector: 'imfx-segmenting-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SegmentsSlickGridProvider,
        {provide: SlickGridProvider, useClass: SegmentsSlickGridProvider},
        SlickGridService,
        IMFXHtmlPlayerComponent,
        VideoJSCurrentTimeProvider,
        AudioTracksService,
        SegmentsViewsProvider,
        DetailProvider
    ]
})
@Injectable()
export class ImfxVersionSegmentsTabComponent {
    @ViewChild('segmentsAudioGrid', {static: false}) private segmentsAudioGrid: SlickGridComponent;
    @Input() onRefresh: Subject<any> = new Subject();
    @Input() onRowUnselected: Subject<any> = new Subject();
    @Output() onDataChanged: EventEmitter<any> = new EventEmitter();
    @Output() isDataValid: EventEmitter<any> = new EventEmitter();
    @Output() timecodesInvalid: EventEmitter<any> = new EventEmitter();
    @Output() getTimecodesForEntry: EventEmitter<any> = new EventEmitter();
    @Output() onSetTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    @Output() goToTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    addSegments: Subject<any> = new Subject();

    public segmentsDataProduction;
    public isProductionTable = false;
    public onResize: EventEmitter<{ comp: any }> = new EventEmitter<{ comp: any }>();
    public onTimecodeEdit: EventEmitter<any> = new EventEmitter<any>();
    public config: any;
    public waitForInOutTimecodes: boolean = false;
    public playerExist: boolean = true;
    private segmentsAudioGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SegmentsSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                },
                canSetFocus: false,
                reorderRows: false,
                isExpandable: {
                    enabled: false // for Credits
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 40,
                forceFitColumns: true
            }
        })
    });
    validationEnabled: boolean = true;
    forceReadOnly: boolean = false;
    private segmentsTypes = [];
    private showCredit = false;
    private checkedCredit = false;
    private formatterSelect2OnSelect: Subscription;
    private formatterTextOnChange: Subscription;
    private onRowDelete: Subscription;
    private onRowUnselectedSubscriber: Subscription;
    private totalDuration: string = '00:00:00:00';
    private destroyed$: Subject<any> = new Subject();

    public copyToMediaSub: Subject<any> = new Subject();
    public copyToMediaDisBtn = () => true;

    constructor(private cdr: ChangeDetectorRef,
                private lookup: LookupService,
                private injector: Injector,
                private slickGridProvider: SegmentsSlickGridProvider,
                private productionDetailProvider: ProductionDetailProvider,
                private arrayProvider: ArrayProvider
    ) {
        if (!this.isProductionTable) {
            this.onRefresh.pipe(takeUntil(this.destroyed$)).subscribe(data => {
                this.checkedCredit = (data.file['TX_FLG_EN'] & 0x10) > 0;
                this.refreshGrid(data.file, data.readOnly);
                this.cdr.detectChanges();
            });
        }
    }

    onChangeEndCredit(val) {
        this.checkedCredit = val;
        if (val) {
            this.config.file['TX_FLG_EN'] |= 0x10;
        } else {
            this.config.file['TX_FLG_EN'] &= ~0x10;
        }
        this.cdr.detectChanges();
    }

    ngAfterViewInit() {
        // if (this.config.readOnly == false) {
        //     this.slickGridProvider.module.reorderRows = !this.config.readOnly;
        //     this.slickGridProvider.initReorderPlugin();
        // }
        this.checkedCredit = (this.config.file['TX_FLG_EN'] & 0x10) > 0;
        this.slickGridProvider.module.canSetFocus = false;
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.setSegmentsAudioTracks();
        }
        this.goToTimecodeString.subscribe(tc => {
            this.onSetTimecodeString.emit(tc);
        });
        this.onTimecodeEdit.subscribe(data => {
            if (data.error) {
                this.isDataValid.emit(false);
                this.timecodesInvalid.emit(true);
            } else {
                if (data.type == 'In') {
                    data.field = 'SOMS';
                    this.setTimecode(data);
                } else if (data.type == 'Out') {
                    data.field = 'EOMS';
                    this.setTimecode(data);
                }
                this.calcDurationTimecode();
                let idx = this.segmentsAudioGrid.provider.slick.getSelectedRows()[0];
                this.segmentsAudioGrid.provider.slick.invalidateRow(idx);
                this.segmentsAudioGrid.provider.slick.render();
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
        if (!this.isProductionTable) {
            this.onRowUnselectedSubscriber.unsubscribe();
        }
    };

    private unselectRow() {
        this.segmentsAudioGrid.provider.setSelectedRow();
    };

    public loadComponentData() {
        this.setSegmentsAudioTracks();
    }

    setSegmentsAudioTracks() {
        if (!this.segmentsAudioGrid || !this.segmentsAudioGrid.provider) {
            return;
        }
        this.forceReadOnly = this.config.context.config.moduleContext.taskFile && this.config.context.config.moduleContext.taskFile.TechReport ?
            this.config.context.config.moduleContext.taskFile.TechReport.Settings.Assess.PartSegmentFrame.ReadOnly : false;
        this.showCredit = this.config.context.config.moduleContext.taskFile && this.config.context.config.moduleContext.taskFile.TechReport && this.config.context.config.moduleContext.taskFile.TechReport.Settings.Assess.PartSegmentFrame.ShowOkForVOECCheckBox ?
            this.config.context.config.moduleContext.taskFile.TechReport.Settings.Assess.PartSegmentFrame.ShowOkForVOECCheckBox : false;
        let globalColsView = this.injector.get(SegmentsViewsProvider).getCustomColumns(null, this.config.readOnly);
        if (this.config.readOnly === true) {
            this.selectSegmentsAudioTracks(globalColsView);
        } else {
            let select2ColIndex = null;
            globalColsView.forEach((c: SlickGridColumn, i: number) => {
                if (c.field == 'TYPE_text' || c.field == 'TYPE') {
                    select2ColIndex = i;
                }
                return c;
            });
            this.lookup.getLookups('SegmentTypes').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((resp) => {
                this.segmentsTypes = resp.filter(el => {
                    return el.TX_PART == true;
                });
                globalColsView[select2ColIndex].__deps.data = {
                    values: resp,
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('SegmentTypes'),
                    validationEnabled: this.validationEnabled
                };
                this.selectSegmentsAudioTracks(globalColsView);
            });
        }
        this.calcTotalDuration();
    }

    selectSegmentsAudioTracks(globalColsView?) {
        if (!this.segmentsAudioGrid || !this.segmentsAudioGrid.provider) {
            return;
        }
        if (!globalColsView) {
            globalColsView = this.injector.get(SegmentsViewsProvider).getCustomColumns(null, this.config.readOnly);
        }
        let tableRows = this.segmentsAudioGrid.provider.deleteUnnecessaryDataBeforeSaving(this.config.file['Segments']);
        const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        tableRows.forEach((el: any, i) => {
            el.videoSom = this.config.videoSom;
            el.videoEom = this.config.videoEom;
            el.SQ_NUM = i + 1;
            if (!this.config.readOnly) {
                this.timecodeInOutValidation(el, timecodeFormat);
            }
        });
        this.segmentsAudioGrid.provider.setGlobalColumns(globalColsView);
        this.segmentsAudioGrid.provider.setDefaultColumns(globalColsView, [], true);
        let detailProvider = this.injector.get(DetailProvider);
        this.segmentsAudioGrid.provider.buildPageByData({Data: detailProvider._deepCopy(tableRows)});
    };

    public refreshGrid(data?: any, readOnly?: boolean) {
        if (readOnly != null) {
            this.config.readOnly = readOnly;
        }
        if (data) {
            this.config.file = data;
            this.formatterSelect2OnSelect && this.formatterSelect2OnSelect.unsubscribe();
            this.formatterTextOnChange && this.formatterTextOnChange.unsubscribe();
            this.onRowDelete && this.onRowDelete.unsubscribe();
            this.setSegmentsAudioTracks();
        }
        this.callValidation();
    };

    public getValidation(validGridTimecodes) {
        if (this.config.readOnly) {
            return true;
        }
        if (!validGridTimecodes) { // timecodes are not valid
            this.isDataValid.emit(false);
            this.timecodesInvalid.emit(true);
        } else {
            let isValid = true;
            let segments = this.config.file['Segments'];
            const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
            segments.forEach(el => {
                this.config.validationFields.forEach(validF => {
                    if (el[validF] == undefined || el[validF] == null || el[validF] == '') {
                        isValid = false;
                    }
                    const tcIn = TMDTimecode.fromString(el.SOMS, timecodeFormat).toFrames();
                    const tcOut = TMDTimecode.fromString(el.EOMS, timecodeFormat).toFrames();
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

    public setFocusOnGrid() {
        if (this.slickGridProvider.module.canSetFocus) {
            this.slickGridProvider.module.isFocused = true;
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
                if (this.slickGridProvider.getData().length == 0) {
                    this.getValidation(true);
                } else {
                    this.slickGridProvider.rowCountForValidation = 0;
                    this.slickGridProvider.validGrid = true;
                    this.slickGridProvider.formatterTimedcodeIsValid.emit();
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

    private setTimecode(data, withoutValidation?) {
        this.slickGridProvider.getSelectedRow()[data.field] = data.timecode;
        let segments = this.config.file['Segments'];
        let editId = this.slickGridProvider.getSelectedRow()['customId'] || this.slickGridProvider.getSelectedRow()['ID'];
        const timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        segments.forEach(el => {
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
        let soms = this.slickGridProvider.getSelectedRow()['SOMS'];
        let eoms = this.slickGridProvider.getSelectedRow()['EOMS'];
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        let data = {
            timecode: TMDTimecode.fromString(eoms, timecodeFormat).substract(TMDTimecode.fromString(soms, timecodeFormat)).toString(),
            type: 'Duration',
            field: 'DURATION_text'
        };
        this.setTimecode(data);
    }

    private onCopyMedia() {
        this.copyToMediaSub.next()
    }

    private calcTotalDuration() {
        let summ = 0;
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        let faults = this.config.file['Segments'];
        faults.forEach(el => {
            summ += TMDTimecode.fromString(el.DURATION_text, timecodeFormat).toFrames();
        });
        this.totalDuration = TMDTimecode.fromFrames(summ, timecodeFormat).toString();
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
}
