import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
// Form
import { DetailData } from "../../../../services/viewsearch/detail.service";
import { SettingsGroupsService } from "../../../../services/system.config/settings.groups.service";
import { OverlayComponent } from "../../../../modules/overlay/overlay";
import { ConsumerSettingsProvider } from "../../../../modules/settings/consumer/provider";
import { SearchTypes } from "../../../../services/system.config/search.types";
import { Router } from "@angular/router";
import { DefaultSearchProvider } from "../../../../modules/search/providers/defaultSearchProvider";
import { SearchRecentProvider } from "../../../../modules/search/recent/providers/search.recent.provider";
import { SearchRecentComponent } from "../../../../modules/search/recent/search.recent";
import { RouteReuseProvider } from "../../../../strategies/route.reuse.provider";
import { ServerStorageService } from "../../../../services/storage/server.storage.service";
import { BrandingSearchFormProvider } from "../../providers/branding.search.form.provider";
import { SearchFormComponent } from '../../../../modules/search/form/search.form';
import { ThemesProvider } from "../../../../providers/design/themes.providers";
import { ConsumerSearchProvider } from "../../../consumer/consumer.search.provider";
import { takeUntil } from 'rxjs/operators';
import { JsonProvider } from '../../../../providers/common/json.provider';
import {
    LoadingIconsService
} from "../../../system/config/comps/global.settings/comps/loading-icons/providers/loading-icons.service";
import { ConfigService } from "../../../../services/config/config.service";
import { SearchSharedComponent } from '../shared/search.component';

@Component({
    selector: 'start-search-form',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailData,
        BrandingSearchFormProvider,
        ConsumerSettingsProvider,
        SettingsGroupsService,
        SearchRecentProvider
    ],
    entryComponents: [
        OverlayComponent,
        SearchRecentComponent
    ]
})

export class BrandingSearchFormComponent extends SearchSharedComponent {
    // settings group config
    @Input() builderMode: boolean = false;
    @Input() staticSearchType: string;

    @ViewChild('overlay', {static: false}) protected overlay: OverlayComponent;
    @ViewChild('searchForm', {static: false}) protected searchFormRef: SearchFormComponent;
    protected setupsUpdated = new EventEmitter<any>();
    protected totalPages = 1;
    protected outsideCriteria;
    protected outsideSearchString;
    protected loading: boolean = false;
    protected heightBackground: string = '100%';
    // config
    protected storagePrefix: string = 'consumer.component.data';
    public consumerPath = SearchTypes.CONSUMER;
    @ViewChild('imageLogo', {static: false}) private imageLogo: any;
    public title;
    public subtitle;
    public selectedBackground = 'EMPTY';
    private selectedSearchLogo;
    bigLogo = null;

    constructor(public storageService: SessionStorageService,
                public localStorage: LocalStorageService,
                public cdr: ChangeDetectorRef,
                public searchFormProvider: BrandingSearchFormProvider,
                public sgs: SettingsGroupsService,
                public defaultSearchProvider: DefaultSearchProvider,
                public searchRecentProvider: SearchRecentProvider,
                public routeReuseProvider: RouteReuseProvider,
                public serverStorage: ServerStorageService,
                public jsonProvider: JsonProvider,
                public router: Router,
                public themesProvider: ThemesProvider,
                public csp: ConsumerSearchProvider,
                public loadingIconsService: LoadingIconsService) {
        super(storageService,
            localStorage,
            cdr,
            searchFormProvider,
            sgs,
            defaultSearchProvider,
            searchRecentProvider,
            routeReuseProvider,
            serverStorage,
            jsonProvider,
            router,
            themesProvider,
            csp,
            loadingIconsService,
        );

    }

    private _getUserLogo() {
        this.loadingIconsService.getImage(this.themesProvider.getCurrentTheme() as  'default' | 'dark', 'profile').subscribe(imgs => {
            this.bigLogo = imgs.bigLogo;
            this.cdr.detectChanges();
        }, error => {
            this.bigLogo = null;
            this.cdr.detectChanges();
        });
    }

    public selectBackground(b) {
        this.selectedBackground = b;
    }

    public selectSearchLogo(l) {
        this.selectedSearchLogo = l;
    }

    public getCustomizedParams(): {
        title: string,
        subtitle: string,
        selectedBackground: string,
        selectedSearchLogo: string,
        selectedOpacity: string
    } {
        return {
            title: this.title,
            subtitle: this.subtitle,
            selectedBackground: this.selectedBackground,
            selectedSearchLogo: this.selectedSearchLogo,
            selectedOpacity: this.selectedOpacity
        };
    }

    public setCustomizedParams(o: {
        title?: string,
        subtitle?: string,
        selectedBackground?: string,
        selectedSearchLogo?: string,
        selectedOpacity?: string
    }) {
        this.title = o.title;
        this.subtitle = o.subtitle;
        this.selectedBackground = o.selectedBackground || this.selectedBackground;
        this.selectedSearchLogo = o.selectedSearchLogo;
        this.selectedOpacity = o.selectedOpacity !== undefined ? o.selectedOpacity : this.selectedOpacity;
        this.cdr.detectChanges();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        const url = ConfigService.getAppApiUrl();
        const groupId = this.loadingIconsService.assetsGroupIdProfile;
        this.backgrounds.ASSETS_GROUP.url = `${url}/api/v3/visual-asset/group/${groupId}/4/image`;
    }

    ngOnInit() {
        if (this.builderMode) {
            this.heightStartBlock = '100%';
        }
        super.ngOnInit();
        if (!this.builderMode) {
            this.sgs.getSettingsUserById('startSearch').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((setups) => {
                if (setups && setups[0] && setups[0].DATA) {
                    this.cdr.detach();
                    let startSearch = JSON.parse(setups[0].DATA);
                    this.title = startSearch.Title;
                    this.subtitle = startSearch.Subtitle;
                    this.selectedBackground = startSearch.Background || this.selectedBackground;
                    this.selectedSearchLogo = startSearch.Logo;
                    this.selectedOpacity = startSearch.Opacity;

                    this._getUserLogo();
                    this.cdr.reattach();
                    this.cdr.markForCheck();
                }
            });
        }
        this.theme = this.themesProvider.getCurrentTheme();
    }
}
