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
import { CarriersTabSlickGridProvider } from "./providers/carriers-tab.slick.grid.provider";
import { CarriersTabViewsProvider } from "./providers/carriers-tab.views.provider";
import { CarriersTabPagerSlickGridProvider } from "./providers/carriers-tab.pager.slick.grid.provider";
import { SearchViewsComponent } from "../../../../modules/search/views/views";
import { ViewsConfig } from "../../../../modules/search/views/views.config";


@Component({
    selector: 'carriers-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: SlickGridProvider, useClass: CarriersTabSlickGridProvider},
        {provide: ViewsProvider, useClass: CarriersTabViewsProvider},
        {provide: SlickGridPagerProvider, useClass: CarriersTabPagerSlickGridProvider},
        IMFXTextMarkerComponent,
        SearchFormProvider
    ]
})

export class CarriersTabComponent implements OnInit{
    @Input('carriersData') carriersData: LoanVersionItem[];
    //slick
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;

    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: true,
                viewMode: 'table',
                tileSource: ['U_ID_PFIX', 'FORMAT', 'LI_TTL_text', 'LI_VERS_text'],
                exportPath: 'Tape',
                // searchType: 'carriers',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
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
                search: {
                    enabled: false
                },
                tileParams: { // from css
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12,
                    isThumbnails: false,
                    isIcons: false,
                },
            },
            plugin: {
                multiSelect: true
            } as SlickGridConfigPluginSetups
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'TapeGrid',
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
            this.slickGridComp.provider.buildPageByData({Data: this.carriersData});
        }

    }
}
