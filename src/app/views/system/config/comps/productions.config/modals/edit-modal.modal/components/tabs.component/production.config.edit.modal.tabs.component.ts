import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation,
    Input,
    EventEmitter, Output, SimpleChanges, ViewChildren, QueryList
} from '@angular/core';
import * as $ from 'jquery';
import {Subject} from 'rxjs';
import {ProdConfEditModalTabType} from './tabs.const';
import {PresetGroupType} from "../../../../../../../../../modules/order-presets-grouped/types";
import {BasketService} from "../../../../../../../../../services/basket/basket.service";
import {TimeCodeFormat, TMDTimecode} from "app/utils/tmd.timecode";

@Component({
    selector: 'production-config-edit-modal-tabs',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
    ],
    entryComponents: []

})
@Injectable()
export class ProductionConfigEditModalTabsComponent {
    @ViewChild('tabsHeader', {read: ElementRef, static: false}) tabsHeader: ElementRef;

    @Input('itemData') itemData: any = null;
    @Input('templateMode') templateMode: number;
    @Input('lookups') lookups: any = null;
    @Output('itemDataChanged') itemDataChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output('validTabs') validTabs: EventEmitter<boolean> = new EventEmitter<boolean>();
    validTabsStates = [];
    presetGroups: Array<PresetGroupType> = null;
    // @ViewChildren('tabItem') tabItems: QueryList<ElementRef>;
    protected tabs = ProdConfEditModalTabType;
    private activeTab: ProdConfEditModalTabType = ProdConfEditModalTabType.MakeWorkflows;
    protected tabClick: EventEmitter<any> = new EventEmitter<any>();

    private destroyed$: Subject<any> = new Subject();

    // itemDataKeys = [
    //   'AudioTracks',
    //   'Segments',
    //   'Subtitles',
    //   'XmlSchemas',
    //   'Notifications'
    // ];

    //itemData field used here as keys
    // 'AudioTracks',
    // 'Segments',
    // 'Subtitles',
    // 'XmlSchemas',
    // 'Notifications'
    columnsDict = {};

    constructor(
        protected cdr: ChangeDetectorRef,
        private basketService: BasketService,
        protected injector: Injector
    ) {
        this.initValidStates();
    }

    ngOnInit() {
        this.fillColumns();
        if(!this.itemData) {
            this.itemData = {};
        }
        this.loadPresets();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data) {
            console.log('ngOnChanges TabsComponent', changes);
        }
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    loadPresets() {
        this.basketService.getOrderPresetsGrouped().subscribe(
            (presetGroups: Array<PresetGroupType>) => {
                this.presetGroups = presetGroups;

            },
            (error: any) => {
                console.error('Failed', error);
            }
        );

    }

    activateTab(tab) {
        this.activeTab = tab;
        this.tabClick.emit();
    }

    onUpdateData($event) {
        const field = $event.field;
        const value = $event.value;

        this.itemData[field] = value;
        this.itemDataChanged.emit(this.itemData);
    }

    getTabValid(tab: ProdConfEditModalTabType) {
        return this.validTabsStates[tab];
    }

    getIsValid() {
        return !this.validTabsStates.some(el => el == false);
    }

    onUpdateDataValid($event, index) {
        let valid = true;
        this.validTabsStates[index] = $event;

        for (let item of this.validTabsStates) {
            if (item) {
                valid = false;
            }
        }
        this.validTabs.emit(valid);
    }

    initValidStates() {
        for (let item in ProdConfEditModalTabType) {
            if (isNaN(Number(item))) {
                // ProdConfEditModalTabType[item]
                this.validTabsStates.push(true);
            }
        }
    }

    getTimecodeFromTvSTD(id): number {
        if (!id) {
            return TimeCodeFormat.Pal;
        }
        return this.lookups.TCF.find(el => el.ID == id).Name - 0;
    }

    getTimecodeStringNameFromTc(id = 0): string {
        const arr = TimeCodeFormat.getArray();
        return (arr.find(el => el.id == id) || {text: 'Pal'}).text;
    }

    getTvStd() {
        const obj = this.itemData['TemplateUiFields'].find(el => el.Field =='TV_STD');
        return obj && obj.Value || null;
    }

    fillColumns() {
        //todo replace in consts

        this.columnsDict = {
            'AudioTracks': [
                {
                    Field: "SEQUENCE",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Seq",
                    Sortable: "Inc",
                    Rules: ["AutoInc_1"]
                },
                {
                    DataType: "ComboSingle",
                    Field: "AUDIO_CONTENT_TYPE_ID",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Audio Content Type",
                    Rules: ["Required"]
                },
                {
                    DataType: "ComboSingle",
                    Field: "LANGUAGE_ID",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Language",
                    Rules: ["Required"]
                }
            ],
            'Segments': [
                {
                    Field: "PRT_NUM",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Part #",
                    mapFnEndEdit: (el, isNew, rows) => {
                        let num = 1;
                        rows.forEach(_el => {
                            if (_el['TxPart']) {
                                _el['PRT_NUM'] = num;
                                num++;
                            } else {
                                _el['PRT_NUM'] = 0;
                            }

                        });
                    }
                },
                {
                    Field: "SQ_NUM",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Seq #",
                    Sortable: "Inc",
                    Rules: ["AutoInc_1"]
                },
                {
                    DataType: "ComboSingle",
                    Field: "SEG_TYPE",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Type",
                    Rules: ["Required"]
                },
                {
                    DataType: "CheckBox",
                    Field: "TxPart",
                    GridView: null,
                    ItemsSource: null,
                    Label: "TX",
                    Rules: ["Readonly"],
                    mapFnDuringEdit: (el, isNew, rows) => {
                        const segId = el['SEG_TYPE'];
                        if (segId) {
                            const txObj = this.lookups['SEG_TYPE_TX'].find(_el => segId == _el['ID']);
                            if (txObj && txObj.Name && txObj.Name == 'True') {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                },
                {
                    DataType: "TimeInput",
                    Field: "SOMS",
                    GridView: null,
                    ItemsSource: null,
                    Label: "In",
                    checkFnEndEdit: (el, rows) => {
                        const tcf = this.getTimecodeFromTvSTD(this.getTvStd());

                        if(TMDTimecode.isValidTimecode(el['SOMS'], tcf)
                            && TMDTimecode.compareStrings(el['EOMS'], el['SOMS']) > 0
                        ) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    mapFnEndEdit: (el, isNew, rows) => {
                        if (!el) {
                            return;
                        }

                        const tcf = this.getTimecodeFromTvSTD(this.getTvStd());
                        const tcfString = this.getTimecodeStringNameFromTc(tcf);

                        //todo maybe replace assign to another method
                        //add TimecodeFormat:string
                        el['TimecodeFormat'] = tcfString;
                        el['TCF'] = tcf;

                        //add SOM:number
                        el['SOM'] = (TMDTimecode.fromString(el['SOMS'], tcf)).toFrames();

                        // return el['SOMS'];
                    },
                    Rules: ["Required"]
                },
                {
                    DataType: "TimeInput",
                    Field: "EOMS",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Out",
                    checkFnEndEdit: (el, rows) => {
                        const tcf = this.getTimecodeFromTvSTD(this.getTvStd());

                        if(TMDTimecode.isValidTimecode(el['EOMS'], tcf)
                            && TMDTimecode.compareStrings(el['EOMS'], el['SOMS']) > 0
                        ) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    mapFnEndEdit: (el, isNew, rows) => {
                        if (!el) {
                            return;
                        }

                        const tcf = this.getTimecodeFromTvSTD(this.getTvStd());

                        //add EOM:number
                        el['EOM'] = (TMDTimecode.fromString(el['EOMS'], tcf)).toFrames();

                        // return el['EOMS'];
                    },
                    Rules: ["Required"]
                },
                {
                    Field: "Duration_text",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Duration",
                    mapFnEndEdit: (el, isNew, rows) => {
                        if (!el) {
                            return;
                        }

                        const tcf = this.getTimecodeFromTvSTD(this.getTvStd());
                        // return TMDTimecode.calcDuration(el['SOMS'], el['EOMS'], tcf);
                        el['Duration_text'] = TMDTimecode.calcDuration(el['SOMS'], el['EOMS'], tcf);
                    }
                },
                {
                    DataType: "TextBox",
                    Field: "PRT_TTL",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Title",
                    // Rules: ["Required"]
                }
            ],
            'Subtitles': [
                {
                    Field: "SEQUENCE",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Seq",
                    Sortable: "Inc",
                    Rules: ["AutoInc_1"]
                },
                {
                    DataType: "ComboSingle",
                    Field: "LANGUAGE_ID",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Language",
                    Rules: ["Required"]
                }
            ],
            'XmlSchemas': [
                /*{
                    DataType: "CheckBox",
                    Field: "READONLY",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Is Readonly"
                },*/
                {
                    DataType: "ComboSingle",
                    Field: "XML_ID",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Schema",
                    Rules: ["Required"]
                }
            ],
            'Notifications': [
                {
                    DataType: "ComboSingle",
                    Field: "STATUS",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Status",
                    Rules: ["Required", "Unique"]
                },
                {
                    DataType: "ComboSingle",
                    Field: "NTFY_GROUP",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Notification Group",
                    Rules: ["Required"]
                },
                {
                    DataType: "ComboSingle",
                    Field: "TEXT_TEMPLATE",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Text Template",
                    Rules: ["Required"]
                }
            ]
        }
    }
}
