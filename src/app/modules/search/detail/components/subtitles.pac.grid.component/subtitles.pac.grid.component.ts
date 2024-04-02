import {
    ChangeDetectionStrategy,
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
} from '@angular/core';
import { TimeCodeFormat } from "../../../../../utils/tmd.timecode";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../slick-grid/slick-grid.config';
import { SlickGridService } from '../../../slick-grid/services/slick.grid.service';
import { SlickGridProvider } from '../../../slick-grid/providers/slick.grid.provider';
import { SlickGridComponent } from '../../../slick-grid/slick-grid';
import { SlickGridColumn } from '../../../slick-grid/types';
import { TextMarkerConfig } from "../../../../controls/text.marker/imfx.text.marker.config";
import { SearchAdvancedProvider } from "../../../advanced/providers/search.advanced.provider";
import { IMFXTextMarkerComponent } from "../../../../controls/text.marker/imfx.text.marker";
import { SubtitleFormatter } from "../../../slick-grid/formatters/subtitle/subtitle.formatter";
import { Subject } from 'rxjs';

@Component({
    selector: 'subtitles-pac-grid',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        IMFXTextMarkerComponent],
    entryComponents: [
    ]

})
@Injectable()
export class SubtitlesPacGrid {

    @Input() subtitles: Array<any>;
    @Input() standalone: boolean = false;
    @Input() private timecodeFormatString: string;
    @Input() externalSearchText: string;

    @Output() selectSubtitle: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('subtitlesPacGrid', {static: false}) private subtitlesPacGrid: SlickGridComponent;

    public onResize: EventEmitter<{ comp: any }> = new EventEmitter<{ comp: any }>();

    private timecodeFormat: number;

    config: any;

    private data = {
        tableRows: [],
        tableColumns: <SlickGridColumn[]>[
            {
                id: 1,
                name: 'In',// TODO: i18n
                field: 'In',
                width: 90,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Out',
                field: 'Out',
                width: 90,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Text',
                field: 'Text',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: SubtitleFormatter,
                isFrozen: true,
                isCustom: true,
                __deps: {
                    injector: this.injector
                }
            },
        ]
    };

    private gridReady = false;

    private subtitlesPacGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: '#externalWrapperSubPacSlickGridForInfoPanel',
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });
    private textMarkerConfig = <TextMarkerConfig> {
        componentContext: this
    };
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                @Inject(Injector) public injector: Injector) {
        this.onResize.subscribe(() => {
            this.subtitlesPacGrid.provider.resize();
        });
    };

    ngOnInit() {

    };

    ngOnChanges() {
        if (!this.subtitles) {
            return;
        }
        this.initSubtitles();
        this.updateSubtitle();
    };

    ngAfterViewInit(){
        this.initSubtitles();
        this.gridReady = true;
        this.updateSubtitle();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    setPacSubtitles(subtitles: Array<any>) {
        this.subtitles = subtitles;
        this.initSubtitles();
        this.updateSubtitle();
    };

    updateSubtitle() {
        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            // checking of rewriting
            if (!this.subtitles || !this.gridReady) {
                return;
            }

            try {
                this.cdr.markForCheck();
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

    };
    scrollToIndex(rowIndex: number, withSelect: boolean = false) {
        let cN = this.subtitlesPacGrid.provider.slick.getCellNode(0,0)
            ,vpN = this.subtitlesPacGrid.provider.slick.getViewportNode()
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

        this.subtitlesPacGrid.provider.slick.scrollRowToTop(resOS);
        if (withSelect) {
            this.subtitlesPacGrid.provider.setSelectedRow(rowIndex, null,true);
        }

    };
    refreshSlickGrid() {
        this.subtitlesPacGrid.provider.slick.invalidate();
        this.subtitlesPacGrid.provider.slick.render();
    };

    private initSubtitles() {
        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            if (!this.subtitles || !this.gridReady) {
                return;
            }
            this.subtitles = this.subtitles.map(el => {
                el.Text = el.Text.trim();
                return el;
            });

            this.data.tableRows = this.subtitles;
            this.timecodeFormat = TimeCodeFormat[this.timecodeFormatString];
            this.cdr.detectChanges();
            this.bindDataToGrid();

        }, 0);
    };

    private bindDataToGrid() {
        this.subtitlesPacGrid.provider.setGlobalColumns(this.data.tableColumns);
        this.subtitlesPacGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        this.subtitlesPacGrid.provider.buildPageByData({Data: this.data.tableRows});
        this.subtitlesPacGrid.provider.resize();
    }


}
