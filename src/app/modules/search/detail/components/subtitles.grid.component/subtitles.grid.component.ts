import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Inject,
    Injectable,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { TimeCodeFormat, TMDTimecode } from "../../../../../utils/tmd.timecode";
import { TextMarkerConfig } from "../../../../controls/text.marker/imfx.text.marker.config";
import { SearchFormProvider } from "../../../form/providers/search.form.provider";
import { SearchAdvancedProvider } from "../../../advanced/providers/search.advanced.provider";
import { IMFXTextMarkerComponent } from "../../../../controls/text.marker/imfx.text.marker";
import { DetailService } from "../../services/detail.service";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import { SlickGridService } from "../../../slick-grid/services/slick.grid.service";
import { SlickGridProvider } from "../../../slick-grid/providers/slick.grid.provider";
import { SlickGridComponent } from "../../../slick-grid/slick-grid";
import { SlickGridColumn } from "../../../slick-grid/types";
import { SubtitleFormatter } from "../../../slick-grid/formatters/subtitle/subtitle.formatter";
import { TranslateService } from '@ngx-translate/core';
import {NotificationService} from "../../../../notification/services/notification.service";
import {Subject} from "rxjs";
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'subtitles-grid',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [SlickGridProvider,
        SlickGridService,
        SearchFormProvider,
        IMFXTextMarkerComponent],
    entryComponents: [
    ]
})
@Injectable()
export class IMFXSubtitlesGrid {

    @ViewChild('subtitlesGrid', {static: true}) private subtitlesGrid: SlickGridComponent;
    @ViewChild('subs', {static: false}) private subs: ElementRef;
    @ViewChild('searchTextComp', {static: false}) private _searchTextComp: IMFXTextMarkerComponent;
    get searchTextComp(): IMFXTextMarkerComponent {
        return this._searchTextComp;
    }

    @Input() subtitles: Array<any/*{
     timecode: string,
     subtitle: string
     }*/>;
    @Input() additionalSubs: Array<any> = [];
    @Input() standalone: boolean = false;
    @Input() private timecodeFormatString: string;
    @Input() externalSearchText: string;
    @Input() mediaNotes: any = {
        visible: false,
        text: ''
    };
    @Input() onSetReadOnly: Subject<any> = new Subject();
    @Input() showSynchronizationBtn: boolean = false;

    @Output() selectSubtitle: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDataChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSynchronizationEnabled: EventEmitter<any> = new EventEmitter<any>();
    public onResize: EventEmitter<{ comp: any }> = new EventEmitter<{ comp: any }>();


    private timecodeFormat: number;

    config: any;
    private selectedLangSub;
    private previousScrollIndex: number = 0;
    private synchronizationEnabled: boolean = false;

    private data = {
        tableRows: [],
        tableColumns: <SlickGridColumn[]>[
            {
                id: 1,
                name: 'Timecode',
                field: 'In',
                width: 90,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Text',
                field: 'Text',
                resizable: true,
                sortable: false,
                formatter: SubtitleFormatter,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
                __deps: {
                    injector: this.injector
                }
            }
        ]
    };
    private textMarkerConfig = <TextMarkerConfig> {
        componentContext: this
    };
    private gridReady = false;

    private prevMinNode;
    private prevMinValueId;
    private destroyed$: Subject<any> = new Subject();

    private subtitlesGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                },
                externalWrapperEl: '#externalWrapperSlickGridForInfoPanel',
                selectFirstRow: false,
                info: {
                    enabled: false
                },
                pager: {
                    enabled: false
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    constructor(private cdr: ChangeDetectorRef,
                private detailSvc: DetailService,
                public translate: TranslateService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector,
                protected notificationService: NotificationService) {
        this.onSetReadOnly.pipe(
            takeUntil(this.destroyed$)
        ).subscribe(data => {
            this.setReadOnly(data);
        });
    };


    ngOnInit() {

    };

    ngOnChanges() {
        this.initSubtitles();
        this.updateSubtitle();
    };

    ngAfterViewInit() {
        this.initSubtitles();
        this.gridReady = true;
        if (this.additionalSubs.length) {
            if (this.additionalSubs[0].Url && this.additionalSubs[0].Url !== '') {
                let u = new URL(this.additionalSubs[0].Url);
                this.setLangSubtitles(this.additionalSubs[0].Id, u.search);
            } else {
                this.setLangSubtitles(this.additionalSubs[0].Id, '');
            }
            this.subs.nativeElement.value = this.additionalSubs[0].Id;
            this.showSynchronizationBtn = true;
        }
        this.updateSubtitle();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    refreshGrid(){
        // setImmediate(() => {
        //     this.subtitlesGrid.provider.resize();
        // });
    }

    private bindDataToGrid() {
        this.subtitlesGrid.provider.setGlobalColumns(this.data.tableColumns);
        this.subtitlesGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        this.subtitlesGrid.provider.buildPageByData({Data: this.data.tableRows});

        this.subtitlesGrid.provider.onSelectRow.subscribe((rowIndex: number) => {
            if(this._searchTextComp && this._searchTextComp.mutedFollow) {
                this.onSelectRow(rowIndex);
            }
        });

    }

    private initSubtitles() {
        if (this.subtitles && this.subtitlesGrid.isGridReady) {
            this.prepareAndBindSubtitles();
        } else if(!this.gridReady) {
            this.subtitlesGrid.onGridReady.subscribe(() => {
                if(this.subtitles){
                    this.prepareAndBindSubtitles();
                }
            });
        } else {
            return false;
        }
    };

    private prepareAndBindSubtitles() {
        this.subtitles = this.subtitles.map(el => {
            el.Text = el.Text.trim();
            return el;
        });

        this.data.tableRows = this.subtitles;
        this.timecodeFormat = TimeCodeFormat[this.timecodeFormatString];
        this.bindDataToGrid();
    }

    refreshSlickGrid() {
        this.subtitlesGrid.provider.slick.invalidate();
        this.subtitlesGrid.provider.slick.render();
    }

    scrollToIndex(rowIndex: number, withSelect: boolean = false) {
        let cN = this.subtitlesGrid.provider.slick.getCellNode(0,0)
            ,vpN = this.subtitlesGrid.provider.slick.getViewportNode()
            ,cH
            ,vpH
            ,offset
            ,resOS;

        if (!cN) {
            return;
        }

        cH = cN.clientHeight;
        vpH = vpN.clientHeight;
        offset = Math.floor(vpH/cH/2);

        if (rowIndex - offset <=0) {
            resOS = 0;
        } else {
            resOS = rowIndex - offset
        }

        this.subtitlesGrid.provider.slick.scrollRowToTop(resOS);
        if (withSelect) {
            this.subtitlesGrid.provider.setSelectedRow(rowIndex, null,true);
        }
    }

    setSubtitles(subtitles: Array<any>, additionalSubs: Array<any> = [], showSynchronizationBtn?: boolean) {
        this.showSynchronizationBtn = showSynchronizationBtn;
        if (additionalSubs && additionalSubs.length > 0) {
            this.additionalSubs = additionalSubs;
            this.showSynchronizationBtn = true;
        }
        this.subtitles = subtitles;
        this.storedSubs = this.subtitles;
        this.initSubtitles();
        this.updateSubtitle();
    };

    storedSubs = [];

    setLangSubtitles(id, params, fromSelect?: boolean) {
        if (id == 0) {
            this.selectedLangSub = id;
            this.subtitles = this.storedSubs;
            this.initSubtitles();
            this.updateSubtitle();
            this.cdr.detectChanges();
        }
        else {
            if (fromSelect) {
                let subs = this.additionalSubs.filter(el => {
                    return el.Id == id;
                })[0];
                params = new URL(subs.Url).search;
            }
            let p = new URLSearchParams(params);
            let f = p.get('f');
            let tcf = p.get('tcf');
            let storage = p.get('storage');
            let modified = p.get('modified');
            let sf = p.get('sf');
            let searchParams = '?sf='+ sf +'&f=' + f + '&tcf=' + tcf + '&storage=' + storage + '&modified=' + modified;
            this.selectedLangSub = id;
            this.detailSvc.getPacSubtitles(id, searchParams).pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                    this.subtitles = res;
                    this.initSubtitles();
                    this.updateSubtitle();
                    this.cdr.detectChanges();
                },
                (error) => {
                    let message = this.translate.instant('details_item.subtitles_not_found');
                    this.notificationService.notifyShow(2, message, false);
                });
        }
        if (this.synchronizationEnabled && fromSelect ) {
            let selectedSubs = this.additionalSubs.filter((el) => { return el.Id == this.selectedLangSub; });
            if (selectedSubs.length) {
                this.config && this.config.elem.emit('setTimedText', selectedSubs[0].Url);
            } else if (selectedSubs.length == 0) {
                this.config && this.config.elem.emit('setTimedText', undefined);
            };
        }
    };

    updateSubtitle() {
        if (this.gridReady) {
            setTimeout(() => {
                if (this.destroyed$.isStopped)
                    return;

                try {
                    let searchString = '';
                        let searchAdvancedProvider = this.injector.get(SearchAdvancedProvider);
                        if (searchAdvancedProvider) {
                            let models = searchAdvancedProvider.getModels();
                            for (var e in models) {
                                if (models[e]._dbField == 'CC_TEXT') {
                                    searchString = models[e]._value;
                                }
                            }
                        }
                    this.externalSearchText = searchString;
                    this.textMarkerConfig.moduleContext.config.options.filterText = searchString;
                    this.textMarkerConfig.moduleContext.searchKeyUp();
                } catch (e) {
                    console.log('there is no Adv provider');
                }
            }, 0);
        }
    }


    private timeCodeToNumber(timeCode): number {
        return Number(timeCode.replace(/;|:/gm, ''));
    }

    public selectRow(timecode: number) {
        if (!this.subtitles || this.subtitles.length == 0) {
            return;
        }

        let sgp = this.injector.get(SlickGridProvider);
        let selectedRowData = sgp.getSelectedRowData();


        if (!!selectedRowData && (timecode == selectedRowData.In)) {
            return;
        }

        const currentTime = this.timeCodeToNumber(timecode);

        let minValueId: number = null;
        const _data = sgp.getData();

        _data.some((sub,i) => {
            const rowTimeIn = this.timeCodeToNumber(sub.In);
            const rowTimeOut = this.timeCodeToNumber(sub.Out);
            if (rowTimeIn < currentTime && rowTimeOut > currentTime) {
                minValueId = i;
                return true
            }
        });

        if (minValueId === null) {
            return;
        }

        this.scrollToIndex(minValueId, true);

        if (this.prevMinNode && this.prevMinNode.rowIndex == minValueId) {
            return;
        } else {
            this.prevMinValueId = minValueId;
            this.prevMinNode = _data[minValueId];
        }
    };

    onSelectRow(rowIndex) {
        let rowData = this.subtitlesGrid.provider.getSelectedRowData();
        if (!rowData){
            return;
        }
        this.config && this.config.elem.emit('setTimecode', rowData.In);
        this.selectSubtitle.emit(rowData.In);
    };

    public loadComponentData() {
        // setImmediate(() => {
        //     this.subtitlesGrid.provider.resize();
        // });

        this.gridReady = true;
        this.updateSubtitle();
    };

    refresh(data) {
        this.subtitles = data;
        this.cdr.detectChanges();
        this.prepareAndBindSubtitles();
    }

    private enabledSynchronization() {
        this.synchronizationEnabled = !this.synchronizationEnabled;
        if (this.synchronizationEnabled && this.selectedLangSub !== 0) {
            let selectedSubs = this.additionalSubs.filter((el) => { return el.Id == this.selectedLangSub; });
            if (selectedSubs.length) {
                this.config && this.config.elem.emit('setTimedText', selectedSubs[0].Url);
            }
        }
        this.onSynchronizationEnabled.emit(this.synchronizationEnabled);
    }
    public setLangSubtitlesByUrl(id) {
        if (this.synchronizationEnabled) {
            let selectedSubs = this.additionalSubs.filter((el) => { return el.Id == id; });
            if (selectedSubs.length) {
                if (selectedSubs[0].Url && selectedSubs[0].Url !== '') {
                    let u = new URL(selectedSubs[0].Url);
                    this.setLangSubtitles(selectedSubs[0].Id, u.search, false);
                } else {
                    this.setLangSubtitles(selectedSubs[0].Id, '', false);
                }
                this.subs.nativeElement.value = selectedSubs[0].Id;
            } else if (selectedSubs.length == 0) {
                this.setLangSubtitles(0, '',false);
                this.subs.nativeElement.value = 0;
            };
        }
    }

    public onChangeNotes() {
        this.onDataChanged.emit(this.mediaNotes.text);
    }
    setReadOnly(readOnly) {
        this.config.readOnly = readOnly;
        this.cdr.detectChanges();
    }
}
