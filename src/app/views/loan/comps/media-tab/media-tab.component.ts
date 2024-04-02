import {
    Component, EventEmitter,
    Injector, Input, OnInit,
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
import { MediaTabSlickGridProvider } from "./providers/media-tab.slick.grid.provider";
import { MediaTabViewsProvider } from "./providers/media-tab.views.provider";
import { MediaTabPagerSlickGridProvider } from "./providers/media-tab.pager.slick.grid.provider";
import { ViewsConfig } from "../../../../modules/search/views/views.config";
import { SearchViewsComponent } from "../../../../modules/search/views/views";


@Component({
    selector: 'media-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: SlickGridProvider, useClass: MediaTabSlickGridProvider},
        {provide: ViewsProvider, useClass: MediaTabViewsProvider},
        {provide: SlickGridPagerProvider, useClass: MediaTabPagerSlickGridProvider},
        IMFXTextMarkerComponent,
        SearchFormProvider
    ]
})

export class MediaTabComponent implements OnInit {
    @Input('mediaData') mediaData: LoanVersionItem[];
    @Input('isReadonly') isReadonly = false;
    //slick
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: true,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                // searchType: 'title',
                // searchType: 'Media',
                exportPath: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                isTree: {
                    enabled: false,
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
                },
                // refreshOnNavigateEnd: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            } as SlickGridConfigPluginSetups
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
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

    ngOnChanges() {
        if (this.mount > 0) {
            this.slickGridComp.provider.buildPageByData({Data: this.mediaData});
        }
    }
}
