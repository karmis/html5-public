import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { ViewsConfig } from "../../../views/views.config";
import { SearchFormConfig } from "../../../form/search.form.config";
import { FacetsStore } from "../../../facets1/store/facets.store";
import { LoanItems } from "../../../../../views/loan/constants/constants";
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../../thumbs/search.thumbs.config";
import { SlickGridService } from "../../../slick-grid/services/slick.grid.service";
import { InfoPanelComponent } from "../../../info-panel/info.panel.component";
import { ViewsProvider } from "../../../views/providers/views.provider";
import { FacetsConfig } from "../../../facets1/models/facets.config";
import { SearchColumnsProvider } from "../../../columns/providers/search.columns.provider";
import { AppSettingsInterface } from "../../../../common/app.settings/app.settings.interface";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import { ActivatedRoute, Router } from "@angular/router";
import { ExportProvider } from "../../../../export/providers/export.provider";
import { RaiseWorkflowWizzardProvider } from "../../../../rw.wizard/providers/rw.wizard.provider";
import { SearchRecentProvider } from "../../../recent/providers/search.recent.provider";
import { SearchSettingsConfig } from "../../../settings/search.settings.config";
import { ConsumerSettingsTransferProvider } from "../../../../settings/consumer/consumer.settings.transfer.provider";
import { CoreSearchComponent } from "../../../../../core/core.search.comp";
import { SearchThumbsProvider } from "../../../thumbs/providers/search.thumbs.provider";
import { SearchColumnsService } from "../../../columns/services/search.columns.service";
import { SecurityService } from "../../../../../services/security/security.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { SearchFormProvider } from "../../../form/providers/search.form.provider";
import { ViewsService } from "../../../views/services/views.service";
import { IMFXModalProvider } from "../../../../imfx-modal/proivders/provider";
import { SearchSettingsProvider } from "../../../settings/providers/search.settings.provider";
import { FacetsService } from "../../../facets1/facets.service";
import { SearchAdvancedProvider } from "../../../advanced/providers/search.advanced.provider";
import { SlickGridProvider } from "../../../slick-grid/providers/slick.grid.provider";
import { InfoPanelProvider } from "../../../info-panel/providers/info.panel.provider";
import { SlickGridComponent } from "../../../slick-grid/slick-grid";
import { ProductionEventsSlickGridProvider } from "./providers/production.events.slick.grid.provider";
import { ProductionEventsSlickViewsProvider } from "./providers/production.events.slick.views.provider";
import { ProductionDetailProvider } from "../../../../../views/detail/production/providers/production.detail.provider";

@Component({
    selector: 'production-events-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        ProductionEventsSlickGridProvider,
        ProductionEventsSlickViewsProvider,
        {provide: SlickGridProvider, useClass: ProductionEventsSlickGridProvider},
        {provide: ViewsProvider, useClass: ProductionEventsSlickViewsProvider},
        InfoPanelProvider,
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        ViewsService,
        RaiseWorkflowWizzardProvider,
        FacetsService,
        FacetsStore
    ],
    encapsulation: ViewEncapsulation.None
})
export class ProductionEventsTabComponent extends CoreSearchComponent implements AfterViewInit {
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    data = [];

    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{ //
        componentContext: this,
        providerType: ProductionEventsSlickGridProvider,
        serviceType: SlickGridService,
        provider: null,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                selectFirstRow: false,
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                // searchType: 'title',
                searchType: 'eventreqs',
                exportPath: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
            }
        })
    });

    protected searchViewsConfig = <ViewsConfig>{ //
        componentContext: this,
        options: {
            type: 'eventreqs',
        }
    };

    private searchSettingsConfig = <SearchSettingsConfig>{ //
        componentContext: this,
    };

    constructor(protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected router: Router,
                protected injector: Injector,
                private productionDetailProvider: ProductionDetailProvider
    ) {
        super(injector);
    }

    ngAfterViewInit() {
        if (this.slickGridComp) {
            this.slickGridComp.provider.buildPageByData({Data: this.data});
            this.slickGridComp.provider.resize();
        }
    }

    setData(data) {
        this.data = data;

        if (this.slickGridComp && this.slickGridComp.provider) {
            this.slickGridComp.provider.buildPageByData({Data: this.data});
            this.slickGridComp.provider.resize();
        }
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    onOpenNewLoanPage() {

    }
}
