
import { fromEvent as observableFromEvent, Observable, Subscription } from 'rxjs';

import { debounceTime } from 'rxjs/operators';
import * as $ from 'jquery';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchFormBrandingConfig } from './search.form.branding.config';
import { SearchFormBrandingProvider } from './providers/search.form.branding.provider';
import { SearchFormBrandingService } from './services/search.form.branding.service';
import { AppSettings } from '../../common/app.settings/app.settings';
import { AppSettingsInterface } from '../../common/app.settings/app.settings.interface';
import { DefaultSearchProvider } from '../providers/defaultSearchProvider';
import { SearchAdvancedProvider } from '../advanced/providers/search.advanced.provider';
import { AdvancedModeTypes, AdvancedSearchGroupRef } from '../advanced/types';
import { SearchSuggessionType } from './types';
import { SlickGridComponent } from '../slick-grid/slick-grid';
import { SlickGridConfig } from '../slick-grid/slick-grid.config';
import { SlickGridProvider } from '../slick-grid/providers/slick.grid.provider';
import { SearchModel } from '../../../models/search/common/search';
import { AdvancedSearchModel } from '../../../models/search/common/advanced.search';
import { ConsumerSearchModel } from '../../../models/search/common/consumer.search';
import { BaseSearchModel } from '../../../models/search/common/base.search';
import { ConsumerSearchType } from '../../../views/consumer/consumer.search.component';
import { appRouter } from '../../../constants/appRouter';
import { BaseSearchUtil } from '../utils/utils';


// export type CommonSearchModel = ConsumerSearchModel | SearchModel;

@Component({
    selector: 'search-form-branding',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    host: {
        '(document:click)': 'onClick($event)',
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [
        SearchFormBrandingProvider,
        SearchFormBrandingService,
        SearchAdvancedProvider,
        AppSettings,
    ]
})

/**
 * Search form for media table component
 */
export class SearchFormBrandingComponent extends BaseSearchUtil {
    @Input('isReady') isReady: EventEmitter<void> = new EventEmitter<void>();
    @Input('searchString') public searchString: string = '';
    @Input('isBackButton') public isBackButton: boolean = false;
    public config = <SearchFormBrandingConfig>{
        componentContext: null,
        moduleContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: [],
            searchString: '',
            minLength: 3,
            appSettings: <AppSettingsInterface>null,
            searchButtonAlwaysEnabled: false,
            enabledSearchButton: true,
            outsideSearchString: '',
            outsideCriteria: <any>null,
            selectedFilters: new EventEmitter<any>(),
            onSearch: new EventEmitter<any>(),
            onSubmitEmitter: new EventEmitter<any>(),
            isBusy: false,
            forbiddenTags: [],
            searchType: 'Version'
        }
    };

    @Input('builderMode') public builderMode;
    @Output() controlOnSearch: EventEmitter<any> = new EventEmitter<any>();
    @Output() onChangedSearchString: EventEmitter<any> = new EventEmitter<any>();
    // @Input() changesDetector?: EventEmitter<any>;
    @ViewChild('submitButton', {static: false}) public submitButtonEl;
    @ViewChild('searchStringEl', {static: true}) public searchStringEl: ElementRef;
    public skipInitSearch: boolean = false;
    protected defaultSearchProvider: DefaultSearchProvider;
    @ViewChild('searchFormEl', {static: false}) protected searchFormEl;
    protected searchForm: FormGroup;
    protected searching: boolean = false;
    protected showAutocompleteDropdown: boolean = false;
    protected results = {};
    protected suggestionSearchData = {};
    protected currentItem: number = -1;
    protected currentArray: number = 0;
    protected routerEventsSubscr: Subscription;
    protected _preparedModels;
    protected _preparedSeachCriteria;
    protected _preparedSearchString;
    /**
     * search Suggestion
     * @param data
     * @param isValid
     */
    protected availableArr: number[] = [];

    constructor(public cdr: ChangeDetectorRef,
                @Inject(SearchFormBrandingService) protected service: SearchFormBrandingService,
                @Inject(SearchFormBrandingProvider) protected provider: SearchFormBrandingProvider,
                @Inject(AppSettings) protected appSettings: AppSettings,
                protected formBuilder: FormBuilder,
                protected elementRef: ElementRef,
                public advancedProvider: SearchAdvancedProvider,
                protected router: Router,
                protected injector: Injector,) {
        super();
        // super(cdr, service, provider, appSettings, formBuilder, elementRef, advancedProvider, router, injector);
        this.defaultSearchProvider = this.injector.get(DefaultSearchProvider);
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            $('.body search-form-branding input').focus();
        });

    }

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    isAvailableTag(tag): boolean {
        if (!this.config.options.forbiddenTags) {
            return true;
        }
        return this.config.options.forbiddenTags.indexOf(tag) === -1;
    }

    ngOnInit() {
        // set search suggestion
        if (this.defaultSearchProvider && this.defaultSearchProvider.getDefaultSearchModel()) {
            this._preparedModels = this.defaultSearchProvider.getDefaultSearchModel();
        }
        if (this.config.options.arraysOfResults.length > 0) {
            observableFromEvent(this.elementRef.nativeElement, 'keyup')
                .subscribe(kEvent => {
                    if (!(kEvent['which'] == 13 || kEvent['which'] == 40 || kEvent['which'] == 38 || kEvent['which'] == 37 || kEvent['which'] == 39 || kEvent['which'] == 27)) { //not arrows or enter, or esc
                        this.onSearchSuggestion(this.searchForm.value, this.searchForm.valid);
                    }
                });
        }

        // Set default provider/services if custom is null
        this.initializeData(this, 'provider');
        this.initializeData(this, 'service');
        this.initializeData(this, 'appSettings');
        this.passConfigToProvider(this);

        this.provider.config.moduleContext = this;

        let params = this.defaultSearchProvider.getDefaultSearchParams();
        let model = this.defaultSearchProvider.getDefaultSearchModel();

        if (model) {
            this.buildForm(model);
        } else {
            this.buildForm(params && params.searchString || '');
        }

        // if (this.changesDetector) {
        //     let self = this;
        //     this.changesDetector.subscribe((res: any) => {
        //         self.changesHandler();
        //     });
        // }
    }

    ngAfterViewInit() {
        this.searchStringEl.nativeElement.focus();
        setTimeout(() => {
            if (!this.skipInitSearch) {
                this.initSearch();
            }
            this.isReady.next();
            this.isReady.complete()
        });
    }

    initSearch() {
        let params = this.defaultSearchProvider.getDefaultSearchParams();
        let model: SearchModel = this.defaultSearchProvider.getDefaultSearchModel();


        let gridConfig = this.config.componentContext.searchGridConfig;
        let searchAdvConfig = this.config.componentContext.searchAdvancedConfig;
        if (
            model &&
            searchAdvConfig
        ) {
            let advModule = searchAdvConfig.options.provider.config.moduleContext;
            let advProv = advModule.config.options.provider;
            // if(model.getAdvanced().length !== model.getSpecialFields().length) {
            advModule.initModule().subscribe(() => {
                // get mode for current recent search (by first criteria in search)
                let crit = model.getAdvancedItem(0);
                if (crit) {
                    advProv.openPanel();
                    let mode: AdvancedModeTypes = model.getMode();
                    if (!mode) {
                        console.error('>>>Search mode or adv not found; you call recent search with deprecated structure');
                        mode = 'builder';
                    }
                    let crits = model.advancedToRequest("ConsumerSearchModel");
                    let structs: Array<AdvancedSearchGroupRef> = advProv.turnCriteriasToStructures(crits);
                    if (mode == 'builder') {
                        advProv.clearParamsForBuilder();
                        advProv.buildStructure(structs);
                    } else {
                        advProv.clearParamsForExample('empty');
                        let defStruct: Array<AdvancedSearchGroupRef> = advModule.service.getStructure();
                        structs = $.extend(true, {}, defStruct, structs);
                        advProv.buildStructure(structs);
                    }

                    advProv.setMode(mode);
                }

                if (gridConfig) {
                    // let gridProvider = gridConfig.options.provider;
                    let gridProvider = this.injector.get(SlickGridProvider);
                    gridProvider.buildPage(model, true);
                }

                this.defaultSearchProvider.clearDefaultSearchParams();
                this.defaultSearchProvider.clearDefaultSearchModel();
            });
            // } else {
            //
            // }


        } else if (params) {
            if (params.searchCriteria && params.searchCriteria[0]) {
                this.selectResult({
                    title: params.searchString,
                    id: params.searchCriteria[0].Value,
                    type: params.searchCriteria[0].FieldId.replace('_ID', '').replace(/\w\S*/g, function (txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    })
                }, !this.config.options.doSearchOnStartup);
                this.defaultSearchProvider.clearDefaultSearchParams();
                this.defaultSearchProvider.clearDefaultSearchModel();
                this.defaultSearchProvider.clearFakeSearchString();
                this.config.options.searchString = '';
                if (this.config.options.doSearchOnStartup) {
                    this.doSearch(this.searchForm.value);
                }
            } else if (params.searchString) {
                if (this.router.routerState.snapshot.url.indexOf('search') === -1) {
                    this.doSearch(this.searchForm.value);
                    this.defaultSearchProvider.clearDefaultSearchParams();
                    this.defaultSearchProvider.clearDefaultSearchModel();
                }
            }
        } else if (this.config.options.doSearchOnStartup) {
            this.doSearch(this.searchForm.value);
        }
    }

    public changesHandler() {
        if (this.config.options.outsideCriteria) {
            this.selectResult(this.config.options.outsideCriteria);
            this.cdr.detectChanges();
        }
        if (this.config.options.outsideSearchString) {
            this.config.options.provider.setSearchString(this.config.options.outsideSearchString);
            this.cdr.detectChanges();
        }
    }

    ngOnChanges() {
        this.changesHandler();
    };

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    isEnabledSearchButton(): boolean {
        return this.provider.isEnabledSearchButton();
    }

    public setStatusForSearchButton(status) {
        this.config.options.enabledSearchButton = status;
    }

    /**
     * On submit search form
     * @param event
     * @param data
     * @param isValid
     */
    onSubmit(event, data, isValid): void {
        event.preventDefault();
        if (!this.config.options.searchButtonAlwaysEnabled) {
            if (
                this.config.options.provider.isLockedForm()
            ) {
                return;
            }

        }
        this.doSearch(data);
    };

    clearSearchMode(event, data, isValid): void {
        this.config.options.currentMode = 'Titles';
        this.clearPreparedModel();
        this.clearPreparedSearchCriteria();
        this.clearPreparedSearchString();
        this.setStatusForSearchButton(true);
        this.onSubmit(event, data, isValid);
    }

    public getPreparedModel(): SearchModel {
        return this._preparedModels;
    }

    public clearPreparedModel(): void {
        this._preparedModels = null;
    }

    public clearPreparedSearchCriteria(): void {
        this._preparedSeachCriteria = null;
    }

    public clearPreparedSearchString(): void {
        this._preparedSearchString = null;
    }

    doSearch(data): void {
        this.config.options.onSubmitEmitter.emit();
        // this.config.options.provider.lockForm();
        this.resetSuggestion();

        let resp = this.provider.onSubmit(data);
        this.results = resp.results;
        let comp = this.config.componentContext;
        if (this.config.componentContext.slickGridComp) {
            let slickGridComp: SlickGridComponent = comp.slickGridComp;
            let gridConfig: SlickGridConfig = (<SlickGridConfig>slickGridComp.config);
            let gridProvider: SlickGridProvider = slickGridComp.provider;

            if (gridConfig && gridProvider) {
                data.suggestionSearchData = this.suggestionSearchData;
                if (!gridProvider.isBusyGrid) {
                    let onGridEndSearchSbscrb = gridProvider.onGridEndSearch.subscribe(() => {
                        // this.config.options.provider.unlockForm();
                        onGridEndSearchSbscrb.unsubscribe();
                    });
                    gridProvider.buildPage(this.provider.getModel(), true);
                }
            } else {
                this.config.options.selectedFilters.emit({
                    searchCriteria: {},
                    searchString: this.config.options.searchString || this.provider.getModel().getBase().getValue()
                });
                this.config.options.outsideSearchString = null;
                this.config.options.outsideCriteria = null;
            }
        } else if (comp.namesTree) {
            comp.namesTree.doSearch.emit(this.provider.getModel().getBase().getValue());
        } else {
            let gridConfig = this.config.componentContext.searchGridConfig;
            if (gridConfig) {
                let gridProvider = gridConfig.options.provider;
                data.suggestionSearchData = this.suggestionSearchData;
                if (!gridProvider.isBusyGrid) {
                    let onGridEndSearchSbscrb = gridProvider.onGridEndSearch.subscribe(() => {
                        // this.config.options.provider.unlockForm();
                        onGridEndSearchSbscrb.unsubscribe();
                    });
                    gridProvider.buildPage(this.provider.getModel(), true);
                }
            } else {
                // let preparedCrit = this._preparedSeachCriteria ? this._preparedSeachCriteria : {};
                // let searchString =
                // if (this._preparedSeachCriteria) {
                //     preparedCrit = this._preparedSeachCriteria;
                //     searchString = '';
                // } else {
                //     preparedCrit = {};
                // }
                // const ssm: ConsumerSearchModel = new ConsumerSearchModel();
                const bsm: BaseSearchModel = resp.model.getBase();
                // @todo fix it !
                const ss = this._preparedSearchString || this.provider.getModel().getBase().getValue() || this.provider.getSearchString();
                bsm.setValue(ss);
                resp.model.setBase(bsm);
                // if (!$.isEmptyObject(preparedCrit)) {
                //     debugger;
                // }
                // resp.model.
                this.config.options.selectedFilters.emit(({
                    model: resp.model,
                    mode: "new"
                } as ConsumerSearchType));
                this._preparedSearchString = this.config.options.searchString;
                // const asm: AdvancedSearchModel = new AdvancedSearchModel();
                // asm.setDBField(result.type === 'Series' ? 'SERIES_ID' : ((result.type === 'Contributors') ? 'CONTRIBUTOR_ID' : ''));
                // asm.setOperation('=');
                // asm.setValue(result.id);
                // ssm.addAdvancedItem(asm);


                // this.config.options.outsideSearchString = null;
                // this.config.options.outsideCriteria = null;
            }
        }
    }

    submit() {
        this.config.options.provider.submit();
    }

    resetTagSearch() {
        this._preparedModels = null;
        this._preparedSeachCriteria = null;
        // this._preparedSearchString = '';
        this.defaultSearchProvider.clearDefaultSearchParams();
        this.defaultSearchProvider.clearDefaultSearchModel();
        this.defaultSearchProvider.clearFakeSearchString();
        this.config.options.currentMode = 'Titles';
        this.cdr.detectChanges();
    }

    /**
     * On key up
     * @param $event
     */
    onKeyUp($event): void {
        this.config.options.searchString = $event.target.value;
        this.onChangedSearchString.emit();
        this.resetTagSearch();
        this._preparedSearchString = $event.target.value;
        // debugger;
        // this.config.options.selectedFilters.emit({
        //     searchCriteria: {},
        //     searchString: $event.target.value,
        //     silent: true
        // });
        switch ($event.which) {
            case 40: {  //arrow down
                if (!this.results[this.config.options.arraysOfResults[this.currentArray]]) {
                    this.results[this.config.options.arraysOfResults[this.currentArray]] = [];
                }
                if (!this.isLastElem(this.results[this.config.options.arraysOfResults[this.currentArray]], this.currentItem) || this.currentItem < 0) {
                    this.currentItem++;
                } else if (this.currentArray < this.config.options.arraysOfResults.length - 1) {
                    this.currentItem = 0;
                    // this.currentArray++;
                }
                break;
            }
            case 37: {  //arrow left
                this.currentItem = 0;
                if (this.currentArray == 0) {
                    if (this.availableArr.indexOf(this.config.options.arraysOfResults.length - 1) > -1) {
                        this.currentArray = this.config.options.arraysOfResults.length - 1;
                    }
                } else {
                    if (this.availableArr.indexOf(this.currentArray - 1) > -1) {
                        this.currentArray--;
                    }
                }
                break;
            }
            case 38: {  //arrow up
                if (this.currentItem > 0) {
                    this.currentItem--;
                } else if (this.currentArray > 0) {
                    // this.currentArray--;
                    this.currentItem = this.results[this.config.options.arraysOfResults[this.currentArray]].length - 1;
                }
                break;
            }
            case 39: {  //arrow right
                // this.currentItem = 0;
                // if (this.currentArray == this.config.options.arraysOfResults.length - 1) { //if right group selected
                //     this.currentArray = 0;
                // } else {
                //     this.currentArray++;
                // }

                this.currentItem = 0;
                if (this.currentArray == this.config.options.arraysOfResults.length - 1) {
                    this.currentArray = 0;
                } else {
                    if (this.availableArr.indexOf(this.currentArray + 1) > -1) {
                        this.currentArray++;
                    }
                }
                break;
            }
            case 27: {//esc button
                this.resetSuggestion();
                this.results = {};
                this.config.options.arraysOfResults.forEach((el) => {
                    this.results[el] = [];
                });
                break;
            }
            case 13: {//enter
                if (!this.showAutocompleteDropdown || this.currentItem < 0) {
                    this.config.options.searchString = this.config.options.searchString.trim();
                    this.setSearchValue(this.config.options.searchString);
                    this.onSubmit($event, this.searchForm.value, this.searchForm.valid);
                    break;
                }

                $event.preventDefault();
                $event.stopPropagation();
                let searchVal;
                let preRes = this.results[this.config.options.arraysOfResults[this.currentArray]];
                if (preRes && preRes[this.currentItem]) {
                    searchVal = preRes[this.currentItem];
                }

                if (!searchVal) {
                    $.each(this.config.options.arraysOfResults, (k) => {
                        if (this.results[this.config.options.arraysOfResults[k]] && this.results[this.config.options.arraysOfResults[k]][this.currentItem]) {
                            searchVal = this.results[this.config.options.arraysOfResults[k]][this.currentItem];
                            if (searchVal) {
                                return false;
                            }
                        }
                    });
                }
                if (searchVal) {
                    this.selectResult(searchVal);
                } else {
                    this.onSubmit($event, this.searchForm.value, this.searchForm.valid);
                }

                break;
            }
            default: {
                this.currentItem = -1;
                this.currentArray = 0;
                this.config.options.currentMode = 'Titles';
                this.searching = true;
                this.cdr.reattach();
                break;
            }
        }
    }

    /**
     * Setup value to search string
     */
    setSearchValue(val = null): void {
        if (val || this.config.options.searchString) {
            this.searchForm.setValue({'searchString': val ? val : this.config.options.searchString});
        }
    }

    clearSearchValue() {
        this.config.options.searchString = '';
        this.searchForm.setValue({'searchString': ''});
    }

    onSearchSuggestion(data, isValid): void {
        // bedore search (validation)
        let sst: SearchSuggessionType = this.provider.beforeSearchSuggestion(this.config.options.searchString, this.currentItem, isValid);
        this.showAutocompleteDropdown = sst.showAutocompleteDropdown;
        this.searching = sst.searching;
        this.cdr.detectChanges();
        if (this.showAutocompleteDropdown) {
            this.config.options.searchString = this.config.options.searchString.trim();
            this.provider.onSearchSuggestion(this.config.options.searchString, this.currentItem, isValid).pipe(
                debounceTime(300))
                .subscribe(
                    (resp: any) => {
                        this.availableArr = [];
                        this.currentArray = null;
                        this.currentItem = sst.currentItem;
                        $.each(this.config.options.arraysOfResults, (k, el) => {
                            if (resp.results[el].length > 0) {
                                if (this.availableArr.indexOf(k) === -1) {
                                    this.availableArr.push(k);
                                }
                                if (this.currentArray === null) {
                                    this.currentArray = k;
                                }
                            }
                            // this.config.options.arraysOfResults.forEach((el) => {
                            this.results[el] = resp.results[el];
                        });
                        this.searching = resp.searching;
                        this.cdr.markForCheck();
                    },
                    (error: any) => {
                        console.error(error);
                    }
                );
        }
    }

    /**
     * click outside
     */
    onClick(event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.resetSuggestion();
            this.results = {};
            this.config.options.arraysOfResults.forEach((el) => {
                this.results[el] = [];
            });
        }
    }

    onRefresh() {
        this.provider.refresh();
    }

    /**
     * Build search form
     */
    protected buildForm(val: string | ConsumerSearchModel | SearchModel) {
        let searchString: string;
        if ((val instanceof ConsumerSearchModel) || (val instanceof SearchModel)) {
            if (val.getSpecialFields().length > 0 && (<AdvancedSearchModel>val.getSpecialFields()[0]).getDirtyValue()) {
                searchString = (<AdvancedSearchModel>val.getSpecialFields()[0]).getDirtyValue().fromSuggestion.title;
                if (val.getSpecialFields().length > 0) {
                    this.config.options.currentMode = val.getSearchMode();
                }
            } else if (val.getBase().getValue() && val.getBase().getValue() != '') {
                searchString = val.getBase().getValue();
            } else {
                if (!val.getSpecialFields()) {
                    searchString = '';
                }
            }
        } else {
            searchString = val;
        }

        // @TODO WHY???
        this.searchForm = this.formBuilder.group({
            searchString: [searchString, Validators.required]
        });
        this.provider.setSearchString(searchString);
        this.setSearchValue(searchString);


    }

    /**
     *
     * @param arr
     * @param ind
     * @returns {boolean}
     */
    protected isLastElem(arr, ind) {
        if (!arr) {
            arr = [];
        }
        return arr.length === 0 || arr.length === ind + 1;
    }

    /**
     * reset Suggestion params
     */
    protected resetSuggestion() {
        this.provider.resetSuggestion().subscribe(
            (resp: any) => {
                this.showAutocompleteDropdown = resp.showAutocompleteDropdown;
                this.config.options.onSearch.emit(this.showAutocompleteDropdown);
                this.currentItem = resp.currentItem;
                this.currentArray = resp.currentArray;
            }
        );
    }

    /**
     * send search request with search criteria
     *@param result
     */
    protected selectResult(result, silent: boolean = false, fromSuggestion: boolean = false) {
        this.resetSuggestion();
        let searchForm = this.config.componentContext.searchFormConfig;
        if (searchForm) {
            let res = searchForm.options.provider.selectResult(result);
            this._preparedModels = res.model;
            const searchStr = this.defaultSearchProvider.getFakeSearchString() || result.title;
            this.setSearchValue(searchStr);
            this.config.options.currentMode = res.result.type;
            this.config.options.searchString = searchStr;
            res.model.fromSuggestion = fromSuggestion;
            // Send to search
            let comp = this.config.componentContext;
            let gridConfig = comp.searchGridConfig;
            if (gridConfig) {
                if (comp.slickGridComp) {
                    let gridProvider: SlickGridProvider = comp.slickGridComp.config.provider;
                    gridProvider.buildPage(res.model, true);
                    this.setSearchValue(this.defaultSearchProvider.getFakeSearchString());
                }
            } else {
                const ssm: ConsumerSearchModel = new ConsumerSearchModel();
                const bsm: BaseSearchModel = new BaseSearchModel();
                bsm.setValue(this.config.options.searchString);
                ssm.setBase(bsm);
                if (result && result.type !== 'Titles') {
                    // ssm.getBase().setSkipForRequest(true);
                    this._preparedSearchString = this.config.options.searchString;
                    const asm: AdvancedSearchModel = new AdvancedSearchModel();
                    asm.setDBField(result.type === 'Series' ? 'SERIES_ID' : ((result.type === 'Contributors') ? 'CONTRIBUTOR_ID' : ''));
                    asm.setOperation('=');
                    asm.setValue(result.id);
                    asm.setDirtyValue({fromSuggestion: result});
                    ssm.addAdvancedItem(asm);
                    ssm.fromSuggestion = fromSuggestion;
                    this.config.options.selectedFilters.emit({
                        model: ssm,
                        silent: silent,
                        mode: 'new'
                    });
                } else {
                    this.config.options.selectedFilters.emit({
                        model: ssm,
                        silent: silent,
                        mode: 'new'
                    });
                }
            }
        }
    }

    /**
     *
     * @param ind
     * @param arrInd
     */
    protected hoverRow(ind, arrInd) {
        this.currentItem = ind;
        this.currentArray = arrInd;
    }

    /**
     */
    protected outRow() {
        this.currentItem = -1;
        this.currentArray = 0;
    }

    protected back() {
        this.router.navigate([appRouter.consumer.start]);
    }
}
