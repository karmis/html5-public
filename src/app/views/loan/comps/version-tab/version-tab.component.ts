import {
    Component, EventEmitter,
    Injector, Input, OnInit, SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { SlickGridComponent } from "../../../../modules/search/slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../../../modules/search/slick-grid/slick-grid.config";
import { SlickGridProvider } from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridService } from "../../../../modules/search/slick-grid/services/slick.grid.service";
import { SlickGridColumn } from "../../../../modules/search/slick-grid/types";
import { SearchFormProvider } from "../../../../modules/search/form/providers/search.form.provider";
import { ViewsProvider } from "../../../../modules/search/views/providers/views.provider";
import { SlickGridPagerProvider } from "../../../../modules/search/slick-grid/comps/pager/providers/pager.slick.grid.provider";
import { IMFXTextMarkerComponent } from "../../../../modules/controls/text.marker/imfx.text.marker";
import { LoanVersionItem } from "../../../../services/loan/types";
import { VersionTabSlickGridProvider } from "./providers/version-tab.slick.grid.provider";
import { VersionTabViewsProvider } from "./providers/version-tab.views.provider";
import { VersionTabPagerSlickGridProvider } from "./providers/version-tab.pager.slick.grid.provider";
import { ViewsConfig } from "../../../../modules/search/views/views.config";
import { SearchViewsComponent } from "../../../../modules/search/views/views";


@Component({
    selector: 'version-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: SlickGridProvider, useClass: VersionTabSlickGridProvider},
        {provide: ViewsProvider, useClass: VersionTabViewsProvider},
        {provide: SlickGridPagerProvider, useClass: VersionTabPagerSlickGridProvider},
        IMFXTextMarkerComponent,
        SearchFormProvider
    ]
})

export class VersionTabComponent implements OnInit {
    @Input('versionData') versionData: LoanVersionItem[];
    //slick
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    protected gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: true,
                viewMode: 'table',
                // viewModeSwitcher: false,
                enableSorting: false,
                externalWrapperEl: '#versionTab',
                isThumbnails: true,
                isTree: {
                    enabled: false,
                },
                pager: {
                    enabled: false,
                    mode: 'small',
                    perPage: 0
                },
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false,
                multiSelect: true
            }
        })
    });

    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: true,
                viewMode: 'table',
                tileSource: ['SER_TITLE', 'TITLE', 'VERSION', 'SER_NUM', 'DURATION_text'],
                exportPath: 'Version',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
                },
                pager: {},
                isTree: {
                    enabled: false,
                    startState: 'collapsed',
                    expandMode: 'firstLevel'
                },
                popupsSelectors: {
                    settings: {
                        popupEl: '.versionSettingsPopup',
                        popupMultiEl: '.versionSettingsPopup',
                    }
                },
                tileParams: { // from media css
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12
                },
                search: {
                    enabled: false
                }
            } as SlickGridConfigModuleSetups,
            plugin: {
                multiSelect: true
            } as SlickGridConfigPluginSetups
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'VersionGrid',
        }
    };

    private mount = 0;

    //**

    constructor(private injector: Injector) {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        this.mount = 1;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.mount > 0) {
            this.slickGridComp.provider.buildPageByData({Data: this.versionData});
        }

    }
}
