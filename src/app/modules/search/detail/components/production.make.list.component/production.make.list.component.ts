import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, ComponentRef, EventEmitter,
    Injector,
    Input, OnDestroy, OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../slick-grid/slick-grid.config';
import { BottomSlickGridProvider } from './providers/bottom.slick.grid.provider';
import { MadeItemsData, MakeListData } from '../../../../../services/production/production.types';
import { ProductionListTabViewsProvider } from './providers/production.list.tab.views.provider';
import { ProductionTypeDetail } from '../../../../../views/production/constants/production.types';
import { SlickGridService } from '../../../slick-grid/services/slick.grid.service';
import { SlickGridColumn, SlickGridEventData, SlickGridRowData } from '../../../slick-grid/types';
import { ProductionListTabSlickGridProvider } from './providers/production.list.tab.slick.grid.provider';
import { TreeFormatter } from '../../../slick-grid/formatters/tree/tree.formatter';
import { SearchFormProvider } from '../../../form/providers/search.form.provider';
import { ViewsProvider } from '../../../views/providers/views.provider';
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { IMFXTextMarkerComponent } from '../../../../controls/text.marker/imfx.text.marker';
import { SlickGridProvider } from '../../../slick-grid/providers/slick.grid.provider';
import { SlickGridComponent } from '../../../slick-grid/slick-grid';
import { HttpClient } from '@angular/common/http';
import { TopSlickGridProvider } from './providers/top.slick.grid.provider';
import { GlobalSlickGridProvider } from '../production.audio.tab.component/providers/global.slick.grid.provider';
import { AudioViewsProvider } from '../production.audio.tab.component/providers/audio.views.provider';
import { ProductionService } from '../../../../../services/production/production.service';
import { removeErrorMarkup } from 'tslint/lib/verify/parse';
import { PRODUCTION_TEMPLATE, PRODUCTION_TEMPLATE_CONFIG } from "../../../../../views/detail/production/constants";
import { Subscription } from "rxjs";
import * as _ from 'lodash'
import * as moment from 'moment';
import { ArrayProvider } from "../../../../../providers/common/array.provider";
import { IMFXModalComponent } from '../../../../imfx-modal/imfx-modal';
import { lazyModules } from '../../../../../app.routes';
import { UploadComponent } from '../../../../upload/upload';
import { SecurityService } from '../../../../../services/security/security.service';
import { IMFXModalProvider } from '../../../../imfx-modal/proivders/provider';
import { UploadProvider } from '../../../../upload/providers/upload.provider';
import { NotificationService } from '../../../../notification/services/notification.service';
import { SubtitlesSlickGridProvider } from './providers/subtitles.slick.grid.provider';
import { SubtitlesViewsProvider } from '../production.subtitles.tab.component/providers/subtitles.views.provider';
import { EventsService } from '../../../../../services/events/events.service';
import { HttpService } from '../../../../../services/http/http.service';

@Component({
    selector: 'production-list-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        IMFXTextMarkerComponent,
        SearchFormProvider,
        ProductionListTabSlickGridProvider,
        ProductionListTabViewsProvider,
        TopSlickGridProvider,
        BottomSlickGridProvider,
        SubtitlesSlickGridProvider,
        AudioViewsProvider,
        SubtitlesViewsProvider,
        {provide: SlickGridProvider, useClass: ProductionListTabSlickGridProvider},
        {provide: SlickGridProvider, useClass: TopSlickGridProvider},
        {provide: SlickGridProvider, useClass: BottomSlickGridProvider},
        {provide: SlickGridProvider, useClass: SubtitlesSlickGridProvider}
    ]
})
export class ProductionMakeListComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() productionTypeDetail: ProductionTypeDetail = null;
    isDataValid: EventEmitter<any> = new EventEmitter();
    @ViewChild('slickGridMakeItemsComp', {static: false}) slickGridMakeItemsComp: SlickGridComponent;
    @ViewChild('slickGridMadeItemsComp', {static: false}) slickGridMadeItemsComp: SlickGridComponent;
    @ViewChild('slickGridAudioComp', {static: false}) slickGridAudioComp: SlickGridComponent;
    @ViewChild('slickGridSubtitlesComp', {static: false}) slickGridSubtitlesComp: SlickGridComponent;
    makeList = {
        data: [],
        columns: [],
        isSet: false
    };
    showBtns = {
        isFileUpload: true,
        isMakeAvidExplorer: true,
        isMadeAvidExplorer: true,
        isOpenMediaRCE: true,
        isOpenMediaLogging: true,
    };
    makeListColumns = [];
    madeItemsData: MadeItemsData[] = [];
    workflowsData = [];
    segmentsData = [];
    eventsData = [];
    historyData = [];
    audioData = [];
    subtitlesData = [];
    isMadeItemSelected = false;
    arraySubs: Subscription[] = [];

    protected gridConfigMakeItems: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: ProductionListTabSlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                enableSorting: false,
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopup'
                    }
                },
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false,
                multiSelect: false
            }
        })
    });

    protected gridConfigMadeItems: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: TopSlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                enableSorting: false,
                isTree: {
                    enabled: true,
                    startState: 'collapsed',
                    expandMode: 'allLevels'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopup'
                    }
                },
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    protected gridConfigAudio: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: BottomSlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                enableSorting: false,
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    protected gridConfigSubtitles: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SubtitlesSlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                enableSorting: false,
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    tabs = [
        {title: 'Workflows', disabled: false},
        {title: 'Segments', disabled: false},
        {title: 'Events', disabled: false},
        {title: 'History', disabled: false},
        {title: 'Audio', disabled: false},
        {title: 'Subs', disabled: false},

    ];

    private onClickFn: Function = () => {};
    private rowClicked: boolean = false;
    private lastEventData: SlickGridRowData = {} as SlickGridRowData;
    constructor(private http: HttpClient,
                private injector: Injector,
                private productionListTabViewsProvider: ProductionListTabViewsProvider,
                private makeItemsSlickGridProvider: ProductionListTabSlickGridProvider,
                private madeItemslickGridProvider: TopSlickGridProvider,
                private audioSlickGridProvider: BottomSlickGridProvider,
                private subtitlesSlickGridProvider: SubtitlesSlickGridProvider,
                private productionDetailProvider: ProductionDetailProvider,
                private audioViewsProvider: AudioViewsProvider,
                private productionService: ProductionService,
                private arrayProvider: ArrayProvider,
                private cdr: ChangeDetectorRef,
                private notificationService: NotificationService,
                private securityService: SecurityService,
                private modalProvider: IMFXModalProvider,
                private subtitlesViewsProvider: SubtitlesViewsProvider,
                private eventsService: EventsService,
                private uploadProvider: UploadProvider,
                private httpService: HttpService) {

        this.onClickFn = _.debounce(() => {
            this.onRowClickProcess()
        }, 300,{
            leading: false,
            trailing: true,
            maxWait: 300
        });

    }

    onSelectTab(tabName) {
    }

    // private lastEventData: any;
    ngOnInit(): void {
        this.makeItemsSlickGridProvider.onRowMouseClick.subscribe((data: SlickGridEventData) => {
            this.onClickFn();
        });

        this.makeItemsSlickGridProvider.onSelectRow.subscribe((data: SlickGridEventData) => {
            this.onClickFn();
        });

        this.madeItemslickGridProvider.formatterSelect2OnSelect.subscribe(data => {
            this.productionDetailProvider.changeAudioSubsSelect(data);
        });

        this.audioSlickGridProvider.formatterSelect2OnSelect.subscribe(data => {
            this.productionDetailProvider.changeAudioSubsSelect(data);
        });

        this.audioSlickGridProvider.onRowDelete.subscribe(data => {
            this.productionDetailProvider.removeAudioSubsInMadeItem(data.SEQUENCE, 'AudioTracks')
        })

        this.subtitlesSlickGridProvider.formatterSelect2OnSelect.subscribe(data => {
            const newData = {
                data: {
                    data: {
                        SEQUENCE: data.data.data.SEQUENCE,
                    },
                    columnDef: {
                        selectName: 'MADE_ITEM_TAB_SUBTITLES_LANGUAGE'
                    }
                },
                value: data.value
            }
            this.productionDetailProvider.changeAudioSubsSelect(newData);
        });

        this.subtitlesSlickGridProvider.onRowDelete.subscribe(data => {
            this.productionDetailProvider.removeAudioSubsInMadeItem(data.SEQUENCE, 'Subtitles')
        })

        this.arraySubs.push(this.productionDetailProvider.madeItemSelected.subscribe(item => {
            this.isMadeItemSelected = !!item;
            this.cdr.detectChanges();
        }))

        this.arraySubs.push(
            this.productionDetailProvider.onSubmitRemake.subscribe(() => {
                this.productionService.madeItemsRemake([this.productionDetailProvider.getMadeItem().ID])
                    .subscribe((dataServ) => {
                        // TODO: ROMAN
                        // console.log(dataServ); !--
                        // dataOld.forEach((row, i) => {
                        //     row.STATUS_TEXT = dataServ[i].StatusText;
                        //     row.ITEM = dataServ[i];
                        //     this.slickGridComp.provider.getDataView().changeItem(row.id, row);
                        // })
                        // const dataNew = this.slickGridComp.provider.getMergeDataviewData([]);
                        // this.slickGridComp.provider.setOriginalData(dataNew);
                        // this.slickGridComp.provider.updateData(dataOld, dataNew);

                        this.notificationService.notifyShow(1, "Success", true, 1200);
                    }, errorResponse => {
                        this.notificationService.notifyShow(2, errorResponse.error.Error);
                    })
            })
        )

        this.arraySubs.push(
            this.productionDetailProvider.makeItemSelected.subscribe(item => {
                if (item === null) {
                    this.makeItemsSlickGridProvider.removeSelectedRows(this.makeItemsSlickGridProvider.getSelectedRowsIds());
                }
            })
        )
        this.arraySubs.push(
            this.productionDetailProvider.onAfterSave.subscribe(() => {
                if (!this.isMadeItemSelected && this.slickGridMadeItemsComp && this.slickGridMadeItemsComp.provider) { // We have saved the data then clear data for made items grid
                    this.slickGridMadeItemsComp.provider.buildPageByData({Data: []});
                    this.slickGridMadeItemsComp.provider.resize();
                }
            })

        )

    }

    private onRowClickProcess(data: SlickGridRowData = null){
        if (!data) {
            data = this.makeItemsSlickGridProvider.getSelectedRow()
        }
        if (!data) {
            return;
        }
        if (this.lastEventData && this.lastEventData.ID === data.ID) {
            return;
        }
        this.lastEventData = data;
        this.productionDetailProvider.makeItemBeforeSelected.next(data);
        this.onRowMouseDownProcess(data);

        setTimeout(() => {
            this.onRowMouseUpProcess(data);
            this.productionDetailProvider.makeItemOnGridMouseUp.next();
        }, 300);
    }

    private onRowMouseDownProcess(row) {
        if (!row) {
            return
        }
        this.cdr.detach()
        // @ts-ignore
        const data: MadeItemsData = row.ITEM;
        this.workflowsData = data.Workflows ? data.Workflows : [];
        this.historyData = data.History ? data.History : [];
        this.audioData = data.AudioTracks ? data.AudioTracks : [];
        this.subtitlesData = data.Subtitles ? data.Subtitles : [];
        this.eventsData = data.Media && data.Media.Events ? data.Media.Events : [];
        this.segmentsData = data.Media && data.Media.Segments ? data.Media.Segments : [];
        // this.audioData = this.audioData.map((el, i) => {
        //     el.SEQUENCE = i + 1;
        //     return el;
        // })

        this.slickGridAudioComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(this.audioData))});
        this.slickGridAudioComp.provider.resize();

        this.slickGridSubtitlesComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(this.subtitlesData))});
        this.slickGridSubtitlesComp.provider.resize();
        this.cdr.reattach();
        this.cdr.markForCheck();
    }

    private onRowMouseUpProcess(data: SlickGridRowData) {
        if (data === undefined) {
            this.productionDetailProvider.madeItemSelected.next(null);
            return
        }
        this.productionDetailProvider.madeItemSelected.next(data.ITEM);
        // if (this.slickGridMakeItemsComp.provider.getSelectedRows().length === 1) {
        //     this.makeItemsSlickGridProvider.setSelectedRow(data.$id)
        // }

        this.cdr.detach()
        const data2: any = this.makeItemsSlickGridProvider.getSelectedRows();
        this.productionDetailProvider.selectMakeItem(data);
        this.productionDetailProvider.makeMultiSelected.next(data2);
        // this.productionService.getMadeItems(dat)
        this.madeItemsData = data.ITEM.MadeItems ? data.ITEM.MadeItems : [];

        const madeItemsGridRows = this.madeItemsData.map(el => {
            return {
                ID: el.ID,
                StatusText: el.StatusText,
                MIID1: el.Media.MIID1,
                ITEM_TYPE_text: el.Media.ITEM_TYPE_text,
                FILENAME: el.FILENAME,
                AGE_CERTIFICATION: el.Media.AGE_CERTIFICATION,
                ITEM: el
            }
        })

        this.slickGridMadeItemsComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(madeItemsGridRows))});
        this.slickGridMadeItemsComp.provider.resize();
        this.slickGridMadeItemsComp.provider.setSelectedRows([]);

        this.workflowsData = [];
        this.segmentsData = [];
        this.eventsData = [];
        this.historyData = [];
        this.audioData = [];
        this.subtitlesData = [];
        this.productionDetailProvider.madeItemSelected.next(null);
        // const data2: any = this.makeItemsSlickGridProvider.getSelectedRows();
        // this.productionDetailProvider.selectMakeItem(data);
        // if (data2.length > 1) {
        // this.productionDetailProvider.makeMultiSelected.next(data2);
        // }
        this.cdr.reattach();
        this.cdr.markForCheck();
    }

    ngAfterViewInit() {
        if (this.slickGridMakeItemsComp && !this.makeList.isSet) {
            this.makeList.isSet = true;
            let columns = null;
            switch (this.productionDetailProvider.templateConfig.ConfigTypeText.toLocaleLowerCase()) {
                case PRODUCTION_TEMPLATE_CONFIG.VERSIONS:
                    columns = this.productionListTabViewsProvider.getCustomColumnsProdTab();
                    break;
                case PRODUCTION_TEMPLATE_CONFIG.CLEAN_MASTERS:
                    columns = this.productionListTabViewsProvider.getCustomColumnsTreeTab();
                    break;
                case PRODUCTION_TEMPLATE_CONFIG.EVENTS:
                    columns = this.productionListTabViewsProvider.getCustomColumnsMultiLinesEvents();
                    break;
                default:
                    columns = this.productionListTabViewsProvider.getCustomColumnsTreeTab();
                    break;
            }
            this.makeList.columns = columns;
            this.slickGridMakeItemsComp.provider.setGlobalColumns(this.makeList.columns);
            this.slickGridMakeItemsComp.provider.setDefaultColumns(this.makeList.columns, [], true);
            this.slickGridMakeItemsComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(this.makeList.data))});
            this.slickGridMakeItemsComp.provider.resize();
        }


        this.productionListTabViewsProvider.getCustomColumnsMadeItems().subscribe(cols => {
            this.slickGridMadeItemsComp.provider.setGlobalColumns(cols);
            this.slickGridMadeItemsComp.provider.setDefaultColumns(cols, [], true);
        })

        this.audioViewsProvider.getCustomColumnsAudio('MADE_ITEMS_').subscribe(col => {
            this.slickGridAudioComp.provider.setGlobalColumns(col);
            this.slickGridAudioComp.provider.setDefaultColumns(col, [], true);
        })

        this.subtitlesViewsProvider.getCustomColumnsSubtitles().subscribe(colSubs => {
            this.slickGridSubtitlesComp.provider.setGlobalColumns(colSubs);
            this.slickGridSubtitlesComp.provider.setDefaultColumns(colSubs, [], true);
        })

        // $(window.document).unbind('mouseup').bind('mouseup', () => {
        //     if (this.rowClicked) {
        //         this.onRowMouseUpProcess(this.lastEventData);
        //         this.productionDetailProvider.makeItemOnGridMouseUp.next();
        //         this.rowClicked = false;
        //     }
        // })
        //
        // this.makeItemsSlickGridProvider.onRowMouseDown.subscribe((data: SlickGridEventData) => {
        //     this.productionDetailProvider.makeItemBeforeSelected.next(data);
        //     this.rowClicked = true;
        //     this.lastEventData = data;
        //     this.onRowMouseDownProcess(data.row)
        // })
    }

    ngOnDestroy() {
        this.arraySubs.forEach(sub => {
            sub.unsubscribe();
        })
        this.lastEventData = null;
    }

    getValidate(): boolean {
        let isValid = true;

        isValid = this.productionDetailProvider.getValidatePayloadDataMakeItems();

        return isValid;
    }

    validate(outFlag = true) {
        let isValid = outFlag && this.getValidate();

        this.isDataValid.emit(isValid);
    }

    setData(makeListData: MakeListData[]) {
        let copyData: MakeListData[] = JSON.parse(JSON.stringify(makeListData, this.httpService.getCircularReplacer()));
        let columns = null;

        copyData = copyData.filter(el => {
            if (el.Children) {
                el.Children = el.Children.filter(chEl => chEl.ID >= 0); // In order for the item to be deleted on the server.
            }
            return el.ID >= 0; // In order for the item to be deleted on the server.
        })
        if (!copyData.length) {
            if (this.slickGridMakeItemsComp) {
                this.slickGridMakeItemsComp.provider.buildPageByData({Data: []});
                this.slickGridMakeItemsComp.provider.resize();
            }
            return
        }

        let data = [];

        switch (this.productionDetailProvider.templateConfig.ConfigTypeText.toLocaleLowerCase()) {
            case PRODUCTION_TEMPLATE_CONFIG.VERSIONS:
                data = (copyData as MakeListData[]).map(el => ({
                    ID: el.ID,
                    MAKE: el.Programm ? el.Programm.TITLE : '',
                    VERSION_NAME: el.Programm ? el.Programm.VERSION : '',
                    VERSION_ID: el.Programm ? el.Programm.VERSIONID1 : '',
                    PGM_STATUS: el.Programm ? el.Programm.PGM_STATUS_TEXT : '',
                    COMPLIANCE: el.ComplianceOfficerName,
                    ASSISTANT: el.ASSISTANT,
                    NEXT_TX_Date: el.Programm ? el.Programm.N_TX_DT : '',
                    DUE_DATE: this.getDueDate(el),
                    STATUS_TEXT: el.StatusText,
                    SUB: el.NeedSubs,
                    ITEM: el
                }));
                columns = this.productionListTabViewsProvider.getCustomColumnsProdTab();
                break;
            case PRODUCTION_TEMPLATE_CONFIG.CLEAN_MASTERS:
                data = copyData.map(el => ({
                    TITLE: el.TITLE,
                    ID: el.ID,
                    DURATION: el.Duration_text,
                    STATUS_TEXT: el.StatusText,
                    TYPE: 'Clean Master',
                    MEDIA_FILE_TYPE: el.MEDIA_FILE_TYPE,
                    HOUSE_NUMBER: el.HOUSE_NUMBER,
                    COMPLIANCE: el.COMPLIANCE,
                    ASSISTANT: el.ASSISTANT,
                    Children: el.Children.map(ver => ({
                        TITLE: ver.TITLE,
                        ID: ver.ID,
                        DURATION: ver.Duration_text,
                        STATUS_TEXT: ver.StatusText,
                        TYPE: 'Version',
                        MEDIA_FILE_TYPE: ver.MEDIA_FILE_TYPE,
                        HOUSE_NUMBER: ver.HOUSE_NUMBER,
                        COMPLIANCE: ver.COMPLIANCE,
                        ASSISTANT: ver.ASSISTANT,
                        MULTI: {
                            IS_SELECTED: false,
                            IS_DISABLED: false
                        },
                        ITEM: ver
                    })),
                    MULTI: {
                        IS_SELECTED: false,
                        IS_DISABLED: false
                    },
                    ITEM: el
                }));
                columns = this.productionListTabViewsProvider.getCustomColumnsTreeTab();
                break;
            case PRODUCTION_TEMPLATE_CONFIG.EVENTS:
                this.eventsService.getEventByProdId(this.productionDetailProvider.payload.ID).subscribe(events => {
                    data = events.map((el, i) => {
                        return {
                                    ID: el.ID,
                                    MAKE: el.FULLTITLE,
                                    VERSION_NAME: copyData[i].Programm.VERSION,
                                    VERSION_ID: copyData[i].Programm.VERSIONID1,
                                    OWNER: el.OWNERS_text,
                                    COMPLIANCE: copyData[i].COMPLIANCE,
                                    ASSISTANT: copyData[i].ASSISTANT,
                                    NEXT_TX_DATE: el.NEXT_TX_DATE,
                                    EVENT_START: copyData[i].Event.START_DATETIME,
                                    TYPE: copyData[i].Event.EVENT_TYPE_text,
                                    EVENT_STATUS: el.STATUS_text,
                                    EVENT_ID: el.ID,
                                    STATUS_TEXT: el.MAKE_STATUS_text,
                                    ITEM: copyData[i]
                                }
                    })
                    this.makeList.data = data;
                    this.slickGridMakeItemsComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(this.makeList.data))});
                    // data = copyData.map((el => {
                    //     const MAKE = `${el.SourceProgs[0].SER_TITLE} / ${el.SourceProgs[0].SER_NAME} / ${el.SourceProgs[0].TITLE}`
                    //     return {
                    //         ID: el.ID,
                    //         MAKE,
                    //         VERSION_NAME: el.Programm.VERSION,
                    //         VERSION_ID: el.Programm.VERSIONID1,
                    //         OWNER: el.SourceProgs[0].OWNERS_text,
                    //         COMPLIANCE: el.COMPLIANCE,
                    //         ASSISTANT: el.ASSISTANT,
                    //         NEXT_TX_DATE: el.Event.NEXT_TX_DATE,
                    //         EVENT_START: el.Event.START_DATETIME,
                    //         TYPE: el.Event.EVENT_TYPE_text,
                    //         EVENT_STATUS: el.Event.STATUS_text,
                    //         EVENT_ID: el.Event.ID,
                    //         STATUS_TEXT: el.StatusText,
                    //         ITEM: el
                    //     }
                    // });
                });

                this.showBtns.isMadeAvidExplorer = false;
                this.showBtns.isMakeAvidExplorer = false;
                columns = this.productionListTabViewsProvider.getCustomColumnsMultiLinesEvents();
                break;
            default:
                data = copyData.map(el => ({
                    TITLE: el.TITLE,
                    ID: el.ID,
                    DURATION: el.Duration_text,
                    STATUS_TEXT: el.StatusText,
                    TYPE: 'Clean Master',
                    MEDIA_FILE_TYPE: el.MEDIA_FILE_TYPE,
                    HOUSE_NUMBER: el.HOUSE_NUMBER,
                    COMPLIANCE: el.COMPLIANCE,
                    ASSISTANT: el.ASSISTANT,
                    Children: el.Children.map(ver => ({
                        TITLE: ver.TITLE,
                        ID: ver.ID,
                        DURATION: ver.Duration_text,
                        STATUS_TEXT: ver.StatusText,
                        TYPE: 'Version',
                        MEDIA_FILE_TYPE: ver.MEDIA_FILE_TYPE,
                        HOUSE_NUMBER: ver.HOUSE_NUMBER,
                        COMPLIANCE: ver.COMPLIANCE,
                        ASSISTANT: ver.ASSISTANT,
                        ITEM: ver
                    })),
                    ITEM: el
                }));
                columns = this.productionListTabViewsProvider.getCustomColumnsTreeTab();
                break;
        }

        this.makeList.data = data;
        this.makeList.columns = columns;

        if (this.slickGridMakeItemsComp) {
            this.makeList.isSet = true;
            this.slickGridMakeItemsComp.provider.setGlobalColumns(this.makeList.columns);
            this.slickGridMakeItemsComp.provider.setDefaultColumns(this.makeList.columns, [], true);
            this.slickGridMakeItemsComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(this.makeList.data))});
            this.slickGridMakeItemsComp.provider.resize();
        }
    }

    onAddAudio() {
        let tracks = this.productionDetailProvider.getMadeItem().AudioTracks
        const count = this.arrayProvider.uniqueIdByField(tracks, "SEQUENCE");

        let newItem = {
            "PROD_ITEM_ID": this.productionDetailProvider.madeItemSelected.value.ID,
            "TEMPLATE_ID": null,
            "SEQUENCE": count,
            "AUDIO_CONTENT_TYPE_ID": null,
            "LANGUAGE_ID": null,
        };
        this.productionDetailProvider.addAudioSubsInMadeItem(newItem, 'AudioTracks');

        this.slickGridAudioComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(tracks))});
        this.slickGridAudioComp.provider.slick.scrollRowToTop(tracks[tracks.length - 1]);
        this.slickGridAudioComp.provider.resize();
    }

    onAddSubtitles() {
        let tracks = this.productionDetailProvider.getMadeItem().Subtitles
        if (!tracks) {
            this.productionDetailProvider.getMadeItem().Subtitles = [];
            tracks = this.productionDetailProvider.getMadeItem().Subtitles;
        }
        const count = this.arrayProvider.uniqueIdByField(tracks, "SEQUENCE");

        let newItem = {
            "PROD_ITEM_ID": this.productionDetailProvider.madeItemSelected.value.ID,
            "TEMPLATE_ID": null,
            "SEQUENCE": count,
            "AUDIO_CONTENT_TYPE_ID": null,
            "LANGUAGE_ID": null,
        };
        this.productionDetailProvider.addAudioSubsInMadeItem(newItem, 'Subtitles');

        this.slickGridSubtitlesComp.provider.buildPageByData({Data: JSON.parse(JSON.stringify(tracks))});
        this.slickGridSubtitlesComp.provider.resize();
        this.slickGridSubtitlesComp.provider.slick.scrollRowToTop(tracks[tracks.length - 1]);
    }

    openUpload() {
        if (!this.securityService.hasPermissionByName('media_upload')) {
            console.warn('>>> Upload not allowed');
            return;
        }
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.upload_modal, UploadComponent, {
            title: 'base.media_upload',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });

        this.uploadProvider.forcedUploadMode = 'version';
        const upr = this.uploadProvider.onReady.subscribe(() => {
            if (upr.unsubscribe) {
                upr.unsubscribe();
            }
            const uc: UploadComponent = this.uploadProvider.moduleContext;
            uc.onSelectFiles([]);
            const row: any = this.slickGridMakeItemsComp.provider.getSelectedRow();
            const version = {id: row.ITEM.TITLE_MEDIA_ID, text: row.ITEM.TITLE};
            uc.changeAssociateMode('version');
            this.uploadProvider.onSelectVersion(version, row.ITEM);
            uc.cdr.detectChanges();
        });
        modal.load().then((cr: ComponentRef<UploadComponent>) => {

        });
    }

    private getDueDate(makeItem: MakeListData) {
        const DUE_DATE_ADJ = this.productionDetailProvider.templateFields.Data[0].DUE_DATE_ADJ;
        const ON_AIR = this.productionDetailProvider.payload.ON_AIR;
        const N_TX_DT = makeItem.Programm ? makeItem.Programm.N_TX_DT : null;

        // console.log(ON_AIR, N_TX_DT, DUE_DATE_ADJ);

        if (ON_AIR === null && N_TX_DT === null) return '';
        if (ON_AIR === null) return moment(N_TX_DT).subtract(DUE_DATE_ADJ, 'd').toJSON();
        if (N_TX_DT === null) return moment(ON_AIR).subtract(DUE_DATE_ADJ, 'd').toJSON();
        if (ON_AIR < N_TX_DT) return moment(ON_AIR).subtract(DUE_DATE_ADJ, 'd').toJSON();
        if (N_TX_DT) return moment(N_TX_DT).subtract(DUE_DATE_ADJ, 'd').toJSON();
    }
}
