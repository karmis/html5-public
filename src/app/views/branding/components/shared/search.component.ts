import {
     ChangeDetectorRef,
     EventEmitter, ViewChild,
} from "@angular/core";
import { AdvancedSearchModel } from '../../../../models/search/common/advanced.search';
import { SearchFormConfig } from '../../../../modules/search/form/search.form.config';
import { AppSettingsInterface } from '../../../../modules/common/app.settings/app.settings.interface';
import { SearchFormProvider } from '../../../../modules/search/form/providers/search.form.provider';
import { ConsumerSearchModel } from '../../../../models/search/common/consumer.search';
import { SearchModel } from '../../../../models/search/common/search';
import { SearchTypes } from '../../../../services/system.config/search.types';
import { ConsumerSearchComponent, ConsumerSearchType } from '../../../consumer/consumer.search.component';
import { BaseSearchModel } from '../../../../models/search/common/base.search';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { BrandingSearchFormProvider } from '../../providers/branding.search.form.provider';
import { SettingsGroupsService } from '../../../../services/system.config/settings.groups.service';
import { DefaultSearchProvider } from '../../../../modules/search/providers/defaultSearchProvider';
import { SearchRecentProvider } from '../../../../modules/search/recent/providers/search.recent.provider';
import { RouteReuseProvider } from '../../../../strategies/route.reuse.provider';
import { ServerStorageService } from '../../../../services/storage/server.storage.service';
import { JsonProvider } from '../../../../providers/common/json.provider';
import { Router } from '@angular/router';
import { ThemesProvider } from '../../../../providers/design/themes.providers';
import { ConsumerSearchProvider } from '../../../consumer/consumer.search.provider';
import {
    LoadingIconsService
} from '../../../system/config/comps/global.settings/comps/loading-icons/providers/loading-icons.service';
import { appRouter } from '../../../../constants/appRouter';
import { SearchFormComponent } from '../../../../modules/search/form/search.form';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { SearchFormSettings } from '../../../../modules/search/form-branding/search.form.branding.config';
import { SearchRecentConfig } from '../../../../modules/search/recent/search.recent.config';
import { Backgrounds } from '../../../../services/system.config/backgrounds';
import { SearchLogos } from '../../../../services/system.config/search.logos';


export type ConsumerRecentMode = 'thumb-recent' | 'media-recent';

export class SearchSharedComponent {
    public selectedOpacity = '0.2';
    public theme = 'default';
    public searchCriteria: AdvancedSearchModel[] = [];
    public searchString = "";
    public page = 1;
    public targetSearch;
    public recentMode: ConsumerRecentMode = 'thumb-recent';
    public defaultSearch;
    public destroyed$: Subject<any> = new Subject();
    public themesChangedSubscr: Subscription;
    public selectedItem: any[];
    public selectedPrefix: string = 'consumer.selected-item';
    public recentItems = [];
    protected recentPrefix: string = 'consumer.recent.data';
    protected isReadySearchForm: EventEmitter<void> = new EventEmitter<void>();
    public isGotSettings: EventEmitter<SearchFormSettings> = new EventEmitter<SearchFormSettings>();
    public isReadyComp: EventEmitter<void> = new EventEmitter<void>();
    private searchRecentConfig;
    private backgroundsKeys = [];
    public heightStartBlock;
    public backgrounds = Backgrounds;
    private searchLogos = SearchLogos;
    private searchLogosKeys = [];

    @ViewChild('searchForm', {static: false}) protected searchFormRef: SearchFormComponent;

    /**
     * Form
     * @type {SearchFormConfig}
     */
    protected searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null,
            outsideSearchString: '',
            outsideCriteria: <any>null,
            selectedFilters: new EventEmitter<any>(),
            onSearch: new EventEmitter<any>()
        }
    };

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
        this.searchFormConfig.options.provider = this.searchFormProvider;
        // do this async because other way subscription is called right after ngOnInit for 2nd init of the component
        this.searchFormConfig.options.selectedFilters.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: ConsumerSearchType) => {
            this.selectSuggestionSearch(res);
        });
        this.themesChangedSubscr = this.themesProvider.changed.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            // this.theme = this.themesProvider.getCurrentTheme();
            // this.cdr.detectChanges();
        });
        this.defaultSearchProvider.clearDefaultSearchModel();
    }

    ngOnInit() {
        this.cdr.detach();
        this.sgs.getSettingsUserById('defaultSearch').pipe(
            takeUntil(this.destroyed$)
        ).subscribe((setups) => {
            if (setups && setups[0] && setups[0].DATA) {
                this.defaultSearch = JSON.parse(setups[0].DATA).DefaultSearch;
                let formSettings: SearchFormSettings | any;
                if (this.isBrandingSearch() && (
                    SearchTypes[this.defaultSearch] === SearchTypes.MEDIA ||
                    SearchTypes[this.defaultSearch] === SearchTypes.TITLE
                )) {
                    formSettings = {forbiddenTags: ['CONTRIBUTOR_ID']};
                } else {
                    formSettings = {forbiddenTags: []};
                }

                this.isGotSettings.emit(formSettings);
                this.isGotSettings.complete();
            }
            this.setTargetSearch();
            if (this.isConsumerSearch()) {
                this.recentMode = 'thumb-recent';
            } else {
                this.recentMode = 'media-recent';
            }
            let storageKey = this.targetSearch;
            if (storageKey == "version") {
                storageKey = "versions";
            }
            this.searchRecentConfig = <SearchRecentConfig>{
                componentContext: null, // this
                options: {
                    provider: <SearchRecentProvider>this.searchRecentProvider,
                    viewType: "adv.recent.searches." + storageKey,
                    itemsLimit: 10
                }
            };
            this.serverStorage.retrieve([this.recentPrefix], true).pipe(
                takeUntil(this.destroyed$)
            ).subscribe((resp) => {
                const value = resp[0] && resp[0].Value;
                const data = this.jsonProvider.isValidJSON(value)
                    ? JSON.parse(value)
                    : value || [];
                this.recentItems = data || [];
                this.cdr.markForCheck();
            });

            this.cdr.reattach();
            try {
                this.cdr.detectChanges();
            } catch (e) {
                console.warn('detectChanges not fired');
            }
        });
        this.backgroundsKeys = Object.keys(this.backgrounds);
        this.searchLogosKeys = Object.keys(this.searchLogos);
    }

    ngAfterViewInit() {
        forkJoin(this.isReadySearchForm, this.isGotSettings, this.isReadyComp).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((d: any) => {
            const sfr: SearchFormComponent = this.searchFormRef; // may be not exist (if !builderMode && isConsumerSearch())
            if (!sfr || !sfr.config) {
                return;
            }
            sfr.config.options = $.extend(true, {}, sfr.config.options, d[1]);
            sfr.cdr.detectChanges();
        });

        setTimeout(() => {
            this.isReadyComp.next();
            this.isReadyComp.complete();
        });
    }

    ngOnDestroy() {
        this.themesChangedSubscr.unsubscribe();
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectSuggestionSearch(data: ConsumerSearchType) {
        this.doSearch(data.model);
    };

    public changeSearchCriteria(criteriaArray, silent = false) {
        var delIndex = null;
        var checkAdd = false;
        this.searchFormConfig.options.provider.config.options.outsideSearchString = this.searchString;
        // this.searchCriteria = criteriaArray;
        for (var i = 0; i < this.searchCriteria.length; i++) {
            if (!this.searchCriteria[i]) {
                this.searchCriteria[i] = new AdvancedSearchModel();
            }
            if (criteriaArray.value == null) {
                if (this.searchCriteria[i].getDBField() == criteriaArray.fieldId) {
                    delIndex = i;
                    break;
                }
            } else {
                if (this.searchCriteria[i].getDBField() == criteriaArray.fieldId) {
                    this.searchCriteria[i].setValue(criteriaArray.value);
                    break;
                }
                checkAdd = true;
            }
        }


        if (delIndex != null) {
            this.searchCriteria.splice(delIndex, 1);
            this.page = 1;
            if (!silent) {
                this.doSearch();
            }

        } else if (checkAdd || this.searchCriteria.length == 0) {
            const asm = new AdvancedSearchModel();
            asm.setDBField(criteriaArray.fieldId);
            asm.setOperation('=');
            asm.setValue(criteriaArray.value);
            this.searchCriteria.push(asm);
            this.page = 1;
            if (!silent) {
                this.doSearch();
            }
        } else {
            if (!silent) {
                this.doSearch();
            }
        }
    }


    doSearch(searchModel?: ConsumerSearchModel | SearchModel, fromRecent: boolean = false) {
        this.routeReuseProvider.clearRouteRequest.emit(this.targetSearch);
        if (this.isConsumerSearch() || this.targetSearch == SearchTypes.CONSUMER) {
            // this.csp.clearConsumerSearchType();
            this.storageService.clear(ConsumerSearchComponent.storagePrefix);
            if (!searchModel) {
                searchModel = new ConsumerSearchModel();
                searchModel.setAdvanced(this.searchCriteria);
                const bsm = new BaseSearchModel();
                bsm.setValue(this.searchString || this.searchFormRef.searchStringEl.nativeElement.value || '');
                searchModel.setBase(bsm);
            }

            if (fromRecent && this.recentMode === 'media-recent' && this.targetSearch !== SearchTypes.CONSUMER) {
                this.defaultSearchProvider.setSearchFormModel(searchModel);
                this.setTargetSearch(this.targetSearch);
            } else {
                this.csp.setConsumerSearchType({
                    model: searchModel,
                    mode: "new"
                } as ConsumerSearchType);
                this.setTargetSearch(SearchTypes.CONSUMER);
            }
        } else {
            if (!searchModel) {
                searchModel = new SearchModel();
                searchModel.setAdvanced(this.searchCriteria);
                const bsm = new BaseSearchModel();
                bsm.setValue(this.searchString || this.searchFormRef.searchStringEl.nativeElement.value || '');
                searchModel.setBase(bsm);
            }
            this.defaultSearchProvider.setSearchFormModel(searchModel);
            this.setTargetSearch();
        }

        this.defaultSearchProvider.setSearchFormModel(searchModel);
        this.storageService.store(ConsumerSearchComponent.storagePrefix, searchModel._toJSON());
        if (this.targetSearch != undefined || this.targetSearch != null) {
            this.router.navigate([this.targetSearch]);
        }
    }

    getHeightAllPage() {
        const height = document.getElementById('start-search').scrollHeight;
        return height + 'px';
    }

    public set(filter, value) {
        $('.background').css(filter, value);
        this.selectedOpacity = value;
    }


    public checkUrlThroughColorScheme(url) {
        if (typeof url == 'string') {
            return url;
        } else {
            return url[this.theme];
        }
    }

    public isConsumerSearch(): boolean {
        return this.router.url.indexOf(appRouter.consumer.start) > -1 || this.router.url.indexOf(appRouter.consumer.search) > -1;
    }


    setTargetSearch(ts?) {
        if (ts) {
            this.targetSearch = ts;
        } else {
            if (this.defaultSearch == "SIMPLIFIED") {
                this.defaultSearch = "CONSUMER";
            }
            this.targetSearch = SearchTypes[this.defaultSearch] || SearchTypes.MEDIA;
        }
    }

    public showFromRecent(item) {
        this.selectedItem = item;
        this.storageService.store(this.selectedPrefix, this.selectedItem);
        this.searchFormConfig.options.provider.config.options.outsideSearchString = item.Title;
        this.searchString = item.Title;
        this.doSearch();
    }

    public clearRecent() {
        this.recentItems = [];
        this.serverStorage.clear(this.recentPrefix).subscribe(() => {
        });
    }

    changeRecentMode(mode: ConsumerRecentMode) {
        this.recentMode = mode;
        this.cdr.markForCheck();
    }

    selectRecentSearch(searchModel: SearchModel) {
        if (searchModel.hasSpecialFields()) {
            const t = searchModel.getTextForSpecialField();
            searchModel.getSpecialFields()[0].setDirtyValue({fromSuggestion: {title: searchModel.getBase().getValue()}});
        }
        this.doSearch(searchModel, true);
    }

    public isBrandingSearch() {
        return this.router.url.indexOf(appRouter.branding) > -1;
    }
}
