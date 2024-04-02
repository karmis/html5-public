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
import { IMFXControlsSelect2Component } from "../../../../modules/controls/select2/imfx.select2";
import {
    LoadingIconsService
} from "../../../system/config/comps/global.settings/comps/loading-icons/providers/loading-icons.service";
import { ConfigService } from "../../../../services/config/config.service";
import { SearchSharedComponent } from '../shared/search.component';

@Component({
    selector: 'set-search',
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

export class SetSearchComponent extends SearchSharedComponent {
    // settings group config
    @Input() builderMode: boolean = false;
    @Input() staticSearchType: string;

    @ViewChild('overlay', {static: false}) protected overlay: OverlayComponent;
    @ViewChild('searchForm', {static: false}) protected searchFormRef: SearchFormComponent;
    @ViewChild('visualGroupSelectEl', {static: false}) protected visualGroupSelectRef: IMFXControlsSelect2Component;
    protected setupsUpdated = new EventEmitter<any>();
    protected totalPages = 1;
    protected outsideCriteria;
    protected outsideSearchString;
    protected loading: boolean = false;
    protected heightBackground: string = '100%';
    // config
    protected storagePrefix: string = 'consumer.component.data';
    protected consumerPath = SearchTypes.CONSUMER;
    @ViewChild('imageLogo', {static: false}) private imageLogo: any;
    public title;
    public subtitle;
    public selectedBackground = 'EMPTY';
    private selectedSearchLogo;

    visualGroupSelect = {
        data: [],
        selectedId: null,
    };
    themeSettings = {
        default: {
            bigLogo: '',
            smallLogo: '',
        },
        dark: {
            bigLogo: '',
            smallLogo: '',
        }

    };
    firstSelectedBack = null;
    changeGroupAssets = false;

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
        this.selectedBackground = o.selectedBackground || this.selectedBackground; // default 'EMPTY'
        this.firstSelectedBack = o.selectedBackground;
        this.selectedSearchLogo = o.selectedSearchLogo;
        this.selectedOpacity = o.selectedOpacity !== undefined ? o.selectedOpacity : this.selectedOpacity;
        this.cdr.detectChanges();
    }


    ngAfterViewInit() {
        this.getVisualGroup();
        super.ngAfterViewInit();
    }

    getVisualGroup() {
        this.loadingIconsService.getVisualAssetGroup().subscribe(groups => {
            this.visualGroupSelect.data = groups.map(gr => ({
                id: gr.ID,
                text: gr.NAME
            }));
            this.visualGroupSelectRef.setData(this.visualGroupSelect.data);
            if (this.loadingIconsService.groupSelected) {
                const id = this.loadingIconsService.groupSelected.ID
                this.visualGroupSelectRef.setSelected(id);
                this.onVisualGroupSelect({params: {data: [{id: id}]}}, true)
            }
        });
    }

    onVisualGroupSelect(item, first = false) {
        if (item === null) {
            this.loadingIconsService.selectGroup(null);
            this.themeSettings = {
                default: {
                    bigLogo: '',
                    smallLogo: '',
                },
                dark: {
                    bigLogo: '',
                    smallLogo: '',
                }

            };
            this.backgrounds.ASSETS_GROUP.url = null;
            this.selectedBackground = 'EMPTY';
            this.cdr.detectChanges();
            return;
        }
        //     0: 'small logo (light theme) ',
        //     1: 'small logo (dark theme)  ',
        //     2: 'search logo (light theme)',
        //     3: 'search logo (dark theme) ',

        if (!first) {
            this.changeGroupAssets = true;
        }

        this.visualGroupSelect.selectedId = item.params.data[0].id;
        this.loadingIconsService.selectGroup({ID: item.params.data[0].id, NAME: null});
        if (this.visualGroupSelect.selectedId) {
            const url = ConfigService.getAppApiUrl();

            const groupId = this.visualGroupSelect.selectedId;

            this.themeSettings.default.smallLogo = `${url}/api/v3/visual-asset/group/${groupId}/0/image`;
            this.themeSettings.dark.smallLogo = `${url}/api/v3/visual-asset/group/${groupId}/1/image`;
            this.themeSettings.default.bigLogo = `${url}/api/v3/visual-asset/group/${groupId}/2/image`;
            this.themeSettings.dark.bigLogo = `${url}/api/v3/visual-asset/group/${groupId}/3/image`;
            this.backgrounds.ASSETS_GROUP.url = `${url}/api/v3/visual-asset/group/${groupId}/4/image`;
            this.cdr.detectChanges();

        }
    }

    backLoadSuccess(ref) {
        ref.hidden = false;
        if (this.firstSelectedBack === 'ASSETS_GROUP' || this.changeGroupAssets) {
            this.selectedBackground = 'ASSETS_GROUP';
        }
    }

    backLoadFail(ref) {
        ref.hidden = true;
        if (this.selectedBackground === 'ASSETS_GROUP') {
            this.selectedBackground = 'EMPTY';
        }
    }

    ngOnInit() {
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
                    this.selectedBackground = startSearch.Background;
                    this.selectedSearchLogo = startSearch.Logo;
                    this.selectedOpacity = startSearch.Opacity;
                    this.cdr.reattach();
                    this.cdr.markForCheck();
                }
            });
        }
        this.theme = this.themesProvider.getCurrentTheme();
    }

    onChangeColorSchema(ev) {
        this.theme = ev.target.value;
        this.cdr.detectChanges();
    }
}
