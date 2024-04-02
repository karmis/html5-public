import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Injectable,
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
import { SlickGridSelect2FormatterEventData } from "../../../slick-grid/types";
import { SegmentsSlickGridProvider } from "./providers/segments.slickgrid.provider";
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { ArrayProvider } from "../../../../../providers/common/array.provider";
import { Subject, Subscription } from "rxjs";
import { TimeCodeFormat, TMDTimecode } from "../../../../../utils/tmd.timecode";
import { SegmentsViewsProvider } from "./providers/views.provider";
import { Segments } from "../../../../../services/production/production.types";
import * as _ from 'lodash'
import { TimecodeProvider } from '../../../../controls/html.player/providers/timecode.provider';

@Component({
    selector: 'production-segments-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        SegmentsSlickGridProvider,
        SegmentsViewsProvider,
        TimecodeProvider,
        {provide: SlickGridProvider, useClass: SegmentsSlickGridProvider},
    ]
})
@Injectable()
export class ProductionSegmentsTabComponent {
    @ViewChild('segmentsAudioGrid', {static: false}) private segmentsAudioGrid: SlickGridComponent;

    isDataValid: EventEmitter<any> = new EventEmitter(); // use in production detail
    onTimecodeEdit: EventEmitter<any> = new EventEmitter(); // use in timecode input formatter
    goToTimecodeString: EventEmitter<any> = new EventEmitter(); // use in timecode input formatter

    segmentsData = [];
    totalDuration = '00:00:00:00';
    timecodeFormat = 'Pal';
    isBtnDisabled = true;
    arraySubs: Subscription[] = [];
    lookupsMap = {};

    segmentsAudioGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                canSetFocus: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 40,
                forceFitColumns: true
            }
        })
    });

    makeItemBeforeSelectedSub: Subscription;
    makeItemOnGridMouseUpSub: Subscription;
    constructor(public cdr: ChangeDetectorRef,
                private slickGridProvider: SegmentsSlickGridProvider,
                private productionDetailProvider: ProductionDetailProvider,
                private arrayProvider: ArrayProvider,
                private segmentsViewsProvider: SegmentsViewsProvider,
                private timecodeProvider: TimecodeProvider
    ) {
    }

    ngAfterViewInit() {

        this.makeItemOnGridMouseUpSub = this.productionDetailProvider.makeItemOnGridMouseUp.subscribe(item => {
            this.segmentsAudioGrid.hideOverlay()
        });

        this.makeItemBeforeSelectedSub = this.productionDetailProvider.makeItemBeforeSelected.subscribe(item => {
            if (!item) {
                return;
            }

            this.segmentsAudioGrid.showOverlay();
        })
        this.arraySubs.push(this.segmentsAudioGrid.provider.formatterTextOnChange.subscribe((res: SlickGridSelect2FormatterEventData) => {
            res.data.data[res.data.columnDef.field] = res.value;
            this.productionDetailProvider.changeSegmentsSelect(res, this.segmentsAudioGrid.provider.getSelectedRow());
        }));

        this.arraySubs.push(this.segmentsAudioGrid.provider.formatterSelect2OnSelect.subscribe((res: SlickGridSelect2FormatterEventData) => {
            res.data.data[res.data.columnDef.field] = res.value.id;
            this.handleSegTypeChange(res); //update res
        }));

        // change IN OUT
        this.arraySubs.push(this.onTimecodeEdit.subscribe(data => {
            this.updateTimecode(data);
        }));

        this.arraySubs.push(this.segmentsAudioGrid.provider.onRowDelete.subscribe((res: any) => {

            this.segmentsData = this.segmentsData.filter(row => row.SQ_NUM !== res.SQ_NUM)
            this.productionDetailProvider.removeSegments(res.SQ_NUM);
            this.calcDurationRowsProduction();
            this.validate();
        }));

        this.arraySubs.push(this.segmentsViewsProvider.getColumns().subscribe(cols => {
            this.segmentsAudioGrid.provider.setGlobalColumns(cols);
            this.segmentsAudioGrid.provider.setDefaultColumns(cols, [], true);
        }));

        this.arraySubs.push(this.productionDetailProvider.makeItemSelected.subscribe(data => {
            if (data === null) {
                this.segmentsAudioGrid.provider.buildPageByData({Data: []});
                this.segmentsAudioGrid.provider.resize();
                this.isBtnDisabled = true;
            } else {
                const segments = _.cloneDeep(data.Segments)
                this.setDataProduction(segments, this.timecodeFormat);
                this.isBtnDisabled = false;
            }
        }))

    }

    ngOnDestroy() {
        this.arraySubs.forEach(el => {
            el.unsubscribe();
        })
        this.makeItemBeforeSelectedSub.unsubscribe();
        this.makeItemOnGridMouseUpSub.unsubscribe();
    }

    setDataProduction(data, TimecodeFormat = null) {
        this.preData(data);
        this.timecodeFormat = this.timecodeFormat ? TimecodeFormat ? TimecodeFormat : 'Pal' : 'Pal';

        if (!this.segmentsAudioGrid || !this.segmentsAudioGrid.provider) {
            return;
        }

        // this.segmentsAudioGrid.provider.buildPageByData({Data: _.cloneDeep(this.segmentsData)});
        this.calcDurationRowsProduction();
        this.validate();
    }


    addSegment() {
        const SQ_NUM = this.arrayProvider.uniqueIndexByKey(this.segmentsData, "SQ_NUM");
        // const PRT_NUM = this.arrayProvider.uniqueIndexByKey(this.segmentsData, "PRT_NUM");
        const PRT_NUM = null;
        const TEMPLATE_ID = 0;
        const PROD_ITEM_ID = this.productionDetailProvider.getItem().ID;

        let newItem: Segments = {
            ID: 0,
            PROD_ITEM_ID,
            TEMPLATE_ID,
            PRT_NUM,
            SQ_NUM,
            SEG_TYPE: null,
            PRT_TTL: "",
            TCF: this.getTimecodeTcNumFromStringName(this.timecodeFormat),
            SOM: 0,
            EOM: 0,
            EOMS: '00:00:00:00',
            SOMS: '00:00:00:00',
            TimecodeFormat: this.timecodeFormat,
            TYPE_text: null,
            Duration_text: '00:00:00:00',
            TxPart: false

        };
        this.segmentsData.push(newItem);

        this.productionDetailProvider.addSegments(newItem);

        this.calcDurationRowsProduction();
        this.segmentsAudioGrid.provider.slick.scrollRowToTop(this.segmentsData[this.segmentsData.length - 1]);

        this.validate();
    }

    calcDurationRowsProduction(data = null) {
        // this.applySorting(this.segmentsData);
        this.applyFieldValuesAssignment();
        this.segmentsAudioGrid.provider.buildPageByData({Data: _.cloneDeep(this.segmentsData)});
        this.slickGridProvider.resize();
        if (data) {
            setTimeout(() => {
                const cell = this.slickGridProvider.getSlick().getCellNode(data.params.rowNumber, data.params.cellNumber);
                $(cell).find('input').focus();
            })
        }

    }

    preData(tableRows) {
        // if (tableRows.length) {
        //     tableRows.forEach((row, i) => {
        //             this.timecodeInOutValidation(row);
        //         }
        //     );
        // }
        this.applySorting(tableRows);
        this.segmentsData = tableRows;
    }

    applySorting(rows) {
        rows.sort((el1, el2) => {
            return ((el1['SQ_NUM'] - 0) - (el2['SQ_NUM'] - 0)) * 1;
        });
    }

    // prevValid; //using for single-row validation and lazy validation state changing
    //
    // checkPrevValid(singleRowValid: boolean) {
    //     if (this.prevValid) {
    //
    //     } else {
    //
    //     }
    // }

    updateTimecode(data) {
        if (data.error) {
            this.isDataValid.emit(false);
            if (data.error.pattern)
                return
        } else {
            // this.isDataValid.emit(true);
        }

        let filed = '';
        let filed1 = '';
        let value = data.timecode;
        if (data.type == 'In') {
            filed = 'SOMS';
            filed1 = 'SOM';
        } else if (data.type == 'Out') {
            filed = 'EOMS';
            filed1 = 'EOM';
        }
        const row = this.slickGridProvider.getSelectedRow();
        // @ts-ignore
        const frame = TMDTimecode.fromString(value, row.TCF).toFrames();
        row[filed] = value;
        row[filed1] = frame;
        // this.timecodeInOutValidation(row);
        // console.log(data.type, value, frame); !--
        this.productionDetailProvider.changeSegmentsSelect({
            type: data.type,
            timecode: value,
            frame: frame
        }, row);

        if (this.getValidate()) {
            this.segmentsData = _.cloneDeep(this.productionDetailProvider.getItem().Segments);
            this.calcDurationRowsProduction(data);
        }

        this.validate();
    }

    // timecodeInOutValidation(row) {
    //     const tcIn = row.SOM;
    //     const tcOut = row.EOM;
    //     if (tcIn > tcOut || tcIn === null || tcOut === null) {
    //         row.timecodesNotValid = true;
    //         // this.isDataValid.emit(false);
    //     } else {
    //         row.timecodesNotValid = false;
    //         // this.isDataValid.emit(true);
    //     }
    //     this.slickGridProvider.formatterTimedcodeIsValid.emit(); // use in timecode formatter
    // }

    getValidate(): boolean {
        let isValid = true;

        isValid = isValid && this.slickGridProvider.getCalcValidGrid();
        return isValid;
    }

    validate() {
        let isValid = this.getValidate();
        // this.prevValid = isValid;
        this.isDataValid.emit(isValid);
    }

    //rename
    applyFieldValuesAssignment() {
        const segments = this.productionDetailProvider.getItem().Segments;
        this.applySorting(segments);

        let partNum = 1;
        for (let i = 0; i < segments.length; i++) {
            segments[i]['SQ_NUM'] = i + 1;

            if (segments[i]['TxPart']) {
                segments[i]['PRT_NUM'] = partNum;
                partNum++;
            } else {
                segments[i]['PRT_NUM'] = 0;
            }

        }

        this.segmentsData = _.cloneDeep(this.productionDetailProvider.getItem().Segments);
    }

    handleSegTypeChange(res) {
        const data = res.data.data;
        if (res.data.columnDef.field == 'SEG_TYPE') {
            const segId = res.value.id;
            if (segId) {
                const txObj = this.lookupsMap['SEG_TYPE_TX'].find(_el => segId == _el['id']);
                if (txObj && txObj.text && txObj.text == 'True') {
                    data['TxPart'] = true;
                } else {
                    data['TxPart'] = false;
                }
            } else {
                data['TxPart'] = false;
            }
        }

        this.productionDetailProvider.changeSegmentsSelect(res, this.segmentsAudioGrid.provider.getSelectedRow());

        if (this.getValidate()) {
            this.segmentsData = _.cloneDeep(this.productionDetailProvider.getItem().Segments);
            this.calcDurationRowsProduction();
        }

        this.validate();
    }

    getTimecodeTcNumFromStringName(name = 'Pal'): number {
        // const arr = TimeCodeFormat.getArray();
        // return (arr.find(el => el.text == name) || {text: 'Pal'}).id;

        return TimeCodeFormat[name];
    }
}
