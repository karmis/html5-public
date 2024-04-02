import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Inject,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { AppSettings } from './constants/constants';
// Form
import { SearchFormConfig } from '../../modules/search/form/search.form.config';
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
import { DetailData } from '../../services/viewsearch/detail.service';
import { SettingsGroupsService } from '../../services/system.config/settings.groups.service';
import { ConsumerSettings } from '../../modules/settings/consumer/types';
import { OverlayComponent } from '../../modules/overlay/overlay';
import { ConsumerSettingsProvider } from '../../modules/settings/consumer/provider';
import { SearchTypes } from '../../services/system.config/search.types';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerStorageService } from '../../services/storage/server.storage.service';
import { ConsumerSearchFormProvider } from './providers/consumer.search.form.provider';
import { ConsumerSearchResponse } from '../../models/consumer/consumer.search.response';
import { appRouter } from '../../constants/appRouter';
import { ConsumerDetailComponent } from './components/consumer.detail/consumer.detail.component';
import { SearchFormProvider } from '../../modules/search/form/providers/search.form.provider';
import { SlickGridService } from '../../modules/search/slick-grid/services/slick.grid.service';
import { AdvancedSearchModel } from '../../models/search/common/advanced.search';
import { ConsumerSearchService } from './services/consumer.search.service';
import { ConsumerSearchProvider } from './consumer.search.provider';
import { SearchFormBrandingComponent } from '../../modules/search/form-branding/search.form.branding';
import { ConsumerFacetComponent } from './components/consumer.facet/consumer.facet.component';
import { RecentModel } from '../../modules/search/recent/models/recent';
import { SearchRecentProvider } from '../../modules/search/recent/providers/search.recent.provider';
import { SearchRecentConfig } from '../../modules/search/recent/search.recent.config';
import { SearchRecentService } from '../../modules/search/recent/services/search.recent.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DefaultSearchProvider } from '../../modules/search/providers/defaultSearchProvider';
import { SearchModel } from '../../models/search/common/search';
import { JsonProvider } from '../../providers/common/json.provider';
import { FacetsConfig } from '../../modules/search/facets1/models/facets.config';
import { FacetsService } from '../../modules/search/facets1/facets.service';
import { FacetsStore } from '../../modules/search/facets1/store/facets.store';

export type ConsumerSettingsType = {
    detail: { opened: boolean },
    result: { selected: { index: number, page: number, id: number } | null },
    facets: {
        opened: boolean
        expanded: string[]
    }
}

export  type ConsumerCriteriaModificationType = {
    mode: 'add' | 'remove',
    model: AdvancedSearchModel
}

export type ConsumerSearchType = {
    model: SearchModel,
    mode: 'new' | 'next' | 'silent' | 'change';
    settings: ConsumerSettingsType
};

@Component({
    selector: 'consumer-search',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridService,
        ConsumerSearchService,
        DetailData,
        AppSettings,
        ConsumerSearchFormProvider,
        ConsumerSettingsProvider,
        SettingsGroupsService,
        SearchRecentProvider,
        SearchRecentService,
        {provide: 'consFacetsStore', useClass: FacetsStore},
        {provide: 'consFacetsService', useClass: (forwardRef(() => FacetsService))}
    ],
    entryComponents: [
        OverlayComponent,
        ConsumerDetailComponent,
        SearchFormBrandingComponent
    ]
})
export class ConsumerSearchComponent implements AfterViewInit {
    public static storagePrefix: string = 'consumer.component.data';
    // @ViewChild('facets', {static: false}) protected facetsRef: ConsumerFacetComponent[];
    @ViewChildren(ConsumerFacetComponent, {read: ConsumerFacetComponent}) facetsRef: QueryList<ConsumerFacetComponent>;
    facetsConfig: FacetsConfig = {
        parentContext: this,
        service: this.facetsService,
        store: this.facetsStore,
        searchForm: this.searchFormProvider,
    };
    /**
     * Form
     * @type {SearchFormConfig}
     */
    protected searchFormConfig = {
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: null as AppSettingsInterface,
            provider: null as SearchFormProvider,
            outsideSearchString: '',
            outsideCriteria: null as any,
            selectedFilters: new EventEmitter<any>(),
            onSearch: new EventEmitter<any>(),
            searchType: 'Version'
        }
    } as SearchFormConfig;
    protected pushChangesTosuggestion = new EventEmitter<any>();
    @ViewChild('overlay', {static: false}) protected overlay: OverlayComponent;
    @ViewChild('consumerItems', {static: false}) protected consumerItems;
    @ViewChild('detail', {static: false}) protected detailRef: ConsumerDetailComponent;
    // @ViewChild('brandingSearchForm', {static: false}) protected searchFormRef: SearchFormComponent;
    protected setupsUpdated = new EventEmitter<any>();
    protected results = [];
    protected enabledMoreButton: boolean = false;
    protected page = 1;
    protected readonly pagging = 25;
    protected totalCount = 0;
    protected resultCount = 0;
    protected totalPages = 1;
    protected totalPagesArr = [];
    protected recentItems = [];
    protected readonly recentLimit = 8;
    protected loading: boolean = false;
    protected rowUp = false;
    protected recentPrefix: string = 'consumer.recent.data';
    protected defaultItemSettings: ConsumerSettings;
    protected defaultDetailSettings: ConsumerSettings;
    protected itemSettings: ConsumerSettings;
    protected detailSettings: ConsumerSettings;
    protected searchType: string = SearchTypes.CONSUMER;
    @ViewChild('brandingSearchForm', {static: false}) private brandingSearchFormEl: SearchFormBrandingComponent;
    @ViewChild('facets', {static: false}) private facetsCompRef: ConsumerFacetComponent;
    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    private searchRecentConfig = {
        componentContext: this,
        options: {
            provider: null as SearchRecentProvider,
            viewType: 'adv.recent.searches.consumer',
            itemsLimit: 10
        }
    } as SearchRecentConfig;
    // TODO lekaving: hack
    private facets = new BehaviorSubject<any[]>([]);


    // @toDo check it
    // private scrollStoreProvider: ScrollStoreProvider;
    private destroyed$: Subject<any> = new Subject();


    constructor(protected storageService: SessionStorageService,
                protected localStorage: LocalStorageService,
                protected searchService: ConsumerSearchService,
                protected cdr: ChangeDetectorRef,
                public searchFormProvider: ConsumerSearchFormProvider,
                protected ssip: ConsumerSettingsProvider,
                protected sgs: SettingsGroupsService,
                protected router: Router,
                protected route: ActivatedRoute,
                protected serverStorage: ServerStorageService,
                private jsonProvider: JsonProvider,
                protected csp: ConsumerSearchProvider,
                protected srp: SearchRecentProvider,
                protected srs: SearchRecentService,
                protected defaultSearchProvider: DefaultSearchProvider,
                @Inject('consFacetsStore') private facetsStore: FacetsStore,
                @Inject('consFacetsService') private facetsService: FacetsService) {

        this.defaultItemSettings = this.ssip.getDefaultItemSettings();
        this.defaultDetailSettings = this.ssip.getDefaultDetailSettings();
        this.itemSettings = this.ssip.getDefaultItemSettings();
        this.detailSettings = this.ssip.getDefaultDetailSettings();
        this.searchFormConfig.options.provider = this.searchFormProvider;

        this.sgs.getSettingsUserById('consumer').pipe(
            takeUntil(this.destroyed$)
        ).subscribe((setups: any[]) => {
            if (setups && setups.length > 0) {
                this.itemSettings = $.extend(
                    true, this.itemSettings,
                    this.defaultItemSettings,
                    JSON.parse(setups[0].DATA).ConsumerItemLayout
                );
                this.detailSettings = $.extend(
                    true,
                    this.detailSettings,
                    this.defaultDetailSettings,
                    JSON.parse(setups[0].DATA).ConsumerDetailLayout
                );
            } else {
                this.itemSettings = $.extend(
                    true,
                    this.itemSettings,
                    this.defaultItemSettings
                );
                this.detailSettings = $.extend(
                    true,
                    this.detailSettings,
                    this.defaultDetailSettings
                );
            }

            this.setupsUpdated.emit({
                itemSettings: this.itemSettings,
                detailSettings: this.detailSettings
            });

            // @toDo check it
            // this.scrollStoreProvider = new ScrollStoreProvider({
            //     compContext: this,
            //     router: this.router,
            //     route: this.route
            // });
        });

        this.searchRecentConfig.options.provider = this.srp;
        this.searchRecentConfig.options.service = this.srs;

    }

    doSearch(consumerSearchType: ConsumerSearchType = null) {
        let isResetFacets = true; // for facets
        // if no model consumer search

        if (!consumerSearchType) {
            consumerSearchType = this.csp.getConsumerSearchType();
            // toDo KOCTblJIb for facets
            isResetFacets = false;
            this.reset();
        }

        if (!consumerSearchType || !consumerSearchType.model || consumerSearchType.model.isEmpty()) {
            this.reset();
            this.router.navigate([appRouter.consumer.start]);
            return;
        }

        if (!consumerSearchType.settings) {
            consumerSearchType.settings = this.csp.getSettings();
        }

        if (consumerSearchType.mode === 'silent') {
            return;
        }

        this.overlay.showWhole();
        this.csp.setConsumerSearchType(consumerSearchType);
        this.serverStorage.store(ConsumerSearchComponent.storagePrefix, consumerSearchType);
        if (consumerSearchType.mode === 'new') {
            this.reset();
        }
        this.searchService.doConsumerSearch(this.csp.getConsumerSearchType().model, this.page).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: ConsumerSearchResponse) => {
            if (this.csp.getConsumerSearchType().mode === 'new') {
                this.results = [];
                this.scrollToTopResultSearch();
            }

            this.resultCount = res.ResultCount;

            this.results[this.page - 1] = res;

            // this.facets.next(res.Facets);
            // const facetsState = this.facetsStore.getState();
            // const isNewSearch = facetsState.newSearch === false ? false : true;
            this.facetsStore.newSearch(isResetFacets);
            this.facetsStore.setFacets(res.Facets);

            this.totalCount = this.results[this.page - 1].ResultCount;
            if (this.page === 1) {
                this.totalPages = Math.ceil(this.totalCount / this.pagging);
                this.totalPagesArr = Array(this.totalPages).fill(1);
            }
            if (this.totalPages > this.page) {
                this.enabledMoreButton = true;
                this.page++;
            } else {
                this.enabledMoreButton = false;
            }


            if (consumerSearchType && consumerSearchType.model) {
                // Update recent searches
                const recentSearch = new RecentModel();
                recentSearch.setSearchModel(consumerSearchType.model);
                recentSearch.setTotal(this.totalCount);
                recentSearch.fillBeautyString();
                if (this.srp) {
                    this.srp.addRecentSearch(recentSearch, this.searchRecentConfig);
                }
            }

            // open all facets
            this.csp.setExpandedFacets(this.results[0].Facets);

            if (this.totalPages <= this.page && this.results[0]) {
                this.setSelectItem({index: 0, page: 0, item: this.results[0].Items[0]})
            }

            // consumerSearchType.settings.facets.expanded =
            // // this.expendAllFacets();
            this.cdr.markForCheck();

            this.overlay.hideWhole();
            //
            this.defaultSearchProvider.clearDefaultSearchModel();
            // @todo check it
            // new Promise((resolve) => {
            //     resolve();
            // }).then(() => {
            //     debugger
            //     this.scrollStoreProvider
            //         .handleScroll('consumerItems', this.consumerItems.nativeElement);
            // })
            // this.resultsReady.emit();
        }, (err) => {
            this.overlay.hideWhole();
        });
        // this.clearVideoBlock();
    }

    loadMore() {
        const cst: ConsumerSearchType = this.csp.getConsumerSearchType();
        if (!cst) {
            return;
        }
        cst.mode = 'next';
        this.doSearch(cst);
    }


    ngAfterViewInit() {
        this.doSearch();
        this.consumerItems.nativeElement.addEventListener('keyup', (e) => {
            this.arrowRowSwitch(e);
        });

        // @toDo check it
        // save detail panel state
        // this.InitDetailPanelStatefromLS();

        this.serverStorage.retrieve([this.recentPrefix], true).subscribe((resp) => {
            const value = resp[0] && resp[0].Value;
            const data = this.jsonProvider.isValidJSON(value)
                ? JSON.parse(value)
                : value || [];
            this.recentItems = data || [];
            this.cdr.markForCheck();
        });


        this.searchFormConfig.options.selectedFilters.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: ConsumerSearchType) => {
            if (res.mode !== 'silent') {
                this.doSearch(res);
            }
        });
        this.searchFormConfig.options.onSearch.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.moveSearchRow(res);
            this.cdr.markForCheck();
        });

        this.cdr.markForCheck();
        // this.facets.pipe(takeUntil(this.destroyed$), filter((res: any) => !!res)).subscribe((res: any) => {
        //     this.facetsStore.setFacets({facets: res, isNewSearch: true});
        // });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    arrowRowSwitch(event) {
        if (!this.csp.getSettings().result.selected) {
            return;
        }
        const settings = this.csp.getSettings();
        const fullSelectedRowId = this.csp.getSettings().result.selected.index + (this.csp.getSettings().result.selected.page * this.pagging);
        let newFullselectedRowId;

        if ((isNaN(fullSelectedRowId)) || !(typeof fullSelectedRowId == 'number')) {
            settings.result.selected = {
                index: 0,
                page: 0,
                id: this.results[0].Items[0].VersionId
            };

            this.csp.updateSettings(settings);
            return;
        }

        if (event.which == 38) {
            newFullselectedRowId = fullSelectedRowId - 1;
        } else if (event.which == 40) {
            newFullselectedRowId = fullSelectedRowId + 1;
        } else {
            return;
        }

        if (newFullselectedRowId < 0) {
            return;
        } else if (newFullselectedRowId >= this.totalCount) {
            return;
        } else {
            const index = newFullselectedRowId % this.pagging;
            const page = Math.floor(newFullselectedRowId / this.pagging);
            if (this.results[page] && this.results[page].Items) {
                settings.result.selected = {
                    index,
                    page,
                    id: this.results[page].Items[index].VersionId
                };
            } else {
                return;
            }
        }
        this.csp.updateSettings(settings);
        this.cdr.detectChanges();

        scrollToSearchResultRow();

        function scrollToSearchResultRow() {
            let scrollTop,
                container = event.target.querySelector('.consumer-items'),
                selectedItem = event.target.querySelector('.consumer-items .consumer-item__row.selected-item'),
                lowEgde = container.scrollTop,
                highEdge = container.clientHeight + lowEgde;

            scrollTop = (container.offsetParent == selectedItem.offsetParent) ? (selectedItem.offsetTop - container.offsetTop) : (selectedItem.offsetTop);

            if ((scrollTop > highEdge) || (scrollTop < lowEgde)) {
                container.scrollTop = scrollTop;
            }
        }
    }

    toggleFacetsPanel() {
        const settings = this.csp.getSettings();
        settings.facets.opened = !settings.facets.opened;
        this.csp.updateSettings(settings);
    }

    clearFacets() {
        this.csp.getConsumerSearchType().model.clearAdvanced();
        this.csp.getConsumerSearchType().mode = 'new';
        this.brandingSearchFormEl.resetTagSearch();
        this.facetsCompRef.cdr.markForCheck();
        this.doSearch();
    }

    toggleFacets() {
        if (this.csp.getExpandedFacets().length > 0) {
            this.csp.clearExpandedFacets();
        } else {
            this.csp.setExpandedFacets(this.results[0].Facets);
        }
        this.facetsRef.forEach((ref: ConsumerFacetComponent) => {
            ref.markForCheck();
        });
        // this.cdr.markForCheck();
    }

    toggleModifications(mods: ConsumerCriteriaModificationType[] = []) {
        const cst = this.csp.toggleModification(mods);
        this.doSearch(cst);
    }

    reset() {
        this.page = 1;
    }

    toggleDetailPanel() {
        const settings = this.csp.getSettings();
        settings.detail.opened = !settings.detail.opened;
        if (settings.result.selected === null && this.results[0] && this.results[0].Items[0]) {
            settings.result.selected = {index: 0, page: 0, id: this.results[0].Items[0].VersionId};
        } else {
            settings.result.selected = null;
        }
        this.detailRef.onToggle(settings);
        this.csp.updateSettings(settings);
    }

    setSelectItem(data?: { index: number, page: number, item: any }) {
        const settings = this.csp.getSettings();
        if (!data && settings.result.selected) {
            data = Object.assign(settings.result.selected, {item: this.getSelectedItem()});
        }
        if (data && (data.item !== null && data.item !== undefined)) {
            settings.detail.opened = true;
            this.addItemToRecent(data.item);
            settings.result.selected = {
                index: data.index,
                page: data.page,
                id: data.item.VersionId
            };
        } else {
            settings.detail.opened = false;
            settings.result.selected = null;
        }
        this.setCinemaMode(data.item);
        this.csp.updateSettings(settings);
        this.cdr.markForCheck();
    }

    getSelectedItem() {
        const selected = this.csp.getSettings().result.selected;
        let item = null;
        if (!this.results || !selected || !this.results[selected.page]) {
            return item;
        }

        if (selected && this.results[selected.page].Items[selected.index]) {
            item = this.results[selected.page].Items[selected.index];
        } else {
            item = this.results[0].Items[0] ? this.results[0].Items[0] : null;
            if (item && item.VersionId) {
                this.setSelectItem({index: 0, item, page: 0});
            }
        }
        return item;
    }

    addItemToRecent(item) {
        for (let i = 0; i < this.recentItems.length; i++) {
            if (this.recentItems[i].ID === item.ID) {
                return;
            }
        }
        this.recentItems.unshift(item);
        this.cdr.detectChanges();
        if (this.recentItems.length > this.recentLimit) {
            this.recentItems.splice(this.recentLimit, 10);
            this.cdr.detectChanges();
        }
        this.serverStorage.store(this.recentPrefix, this.recentItems).subscribe((res: any) => {
            console.log(res);
        });
    }

    // getSelectedItemDebounce = _.debounce(() => {
    //     let item = this.getSelectedItem();
    //     this.cdr.detectChanges();
    //     return item;
    // }, 500, {
    //         'leading': false,
    //         'trailing': true
    //     }
    // );

    moveSearchRow(state) {
        this.rowUp = state;
        this.cdr.detectChanges();
    };

    setCinemaMode(item) {
        if (item && item.ProxyUrl && item.ProxyUrl.length > 0
            && item.ProxyUrl.match(/^(http|https):\/\//g)
            && item.ProxyUrl.match(/^(http|https):\/\//g).length > 0
            && $('.cinema-mode-player').children().length > 0) {
            $('.consumer-blocks-wrapper.grid')
                .addClass('consumer-blocks-wrapper-with-cinema-player');
        } else {
            $('.consumer-blocks-wrapper.grid')
                .removeClass('consumer-blocks-wrapper-with-cinema-player');
        }
    };

    clearVideoBlock() {
        $('.cinema-mode-player').children().remove();
        $('.consumer-blocks-wrapper.grid')
            .removeClass('consumer-blocks-wrapper-with-cinema-player');
    }

    private scrollToTopResultSearch() {
        $(this.consumerItems.nativeElement).find('.consumer-items').scrollTop(0);
    }
}
