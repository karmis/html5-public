/**
 * Created by initr on 23.11.2016.
 */
import {
    ChangeDetectorRef, Component, Inject, Input, ViewChild, ViewEncapsulation
} from '@angular/core';
import { SearchAdvancedConfig } from './search.advanced.config';
import { SearchAdvancedProvider } from './providers/search.advanced.provider';
import {
    SearchAdvancedService, SearchAdvancedServiceInterface
} from './services/search.advanced.service';
import * as $ from 'jquery';
import {
    AdvancedFieldsAndOperators,
    AdvancedModeTypes,
    AdvancedPointerCriteriaType,
    AdvancedPointerGroupType,
    AdvancedRESTIdsForListOfFieldsTypes,
    AdvancedSearchDataCriteriaReturnType,
    AdvancedSearchGroupRef
} from './types';
import { SearchSavedConfig } from '../saved/search.saved.config';
import { SearchTypesType } from '../../../services/system.config/search.types';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';
import { OverlayComponent } from '../../overlay/overlay';
import { IMFXSelect2LookupReturnType } from '../../controls/select2/imfx.select2.lookups';
import { SearchSavedComponent } from '../saved/search.saved';
import { BaseSearchUtil } from '../utils/utils';

@Component({
    selector: 'search-advanced',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    host: {'style': 'height:100%;'},
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SearchAdvancedProvider,
        SearchAdvancedService,
    ]
})
export class SearchAdvancedComponent extends BaseSearchUtil{
    @ViewChild('searchSavedModule', {static: false}) public searchSavedModuleRef: SearchSavedComponent;
    @ViewChild('sidebarContent', {static: false}) private sidebarContent;
    @Input('clearCacheSavedSearch') clearCacheSavedSearch: boolean = true;
    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    // searchType for current view
    private searchType: SearchTypesType;

    // setups for SearchSaved module
    private searchSavedConfig = <SearchSavedConfig>{
        componentContext: this, // this too ... see dirty hack in SearchSavedComponent
        moduleContext: this,
        options: {
            type: null
        }
    };

    // setups for SearchAdvancedConfig
    private config = <SearchAdvancedConfig>{
        componentContext: <any>null,
        moduleContext: this,
        options: {
            restIdForParametersInAdv: <AdvancedRESTIdsForListOfFieldsTypes>'',
            provider: <SearchAdvancedProvider>null,
            service: <SearchAdvancedService>null,
            enabledAddMultipleGroups: true,
            enabledQueryByExample: true,
            enabledSavedSearches: true,
            enabledQueryBuilder: true,
            allowSaveSearchParams: true,
            allowClearSearchParams: true,
            advancedSearchMode: 'builder',
            // data for builder
            builderData: {
                groups: [],
            },
            // data for example
            exampleData: {
                groups: []
            },
            // common data
            commonData: {
                items: [], // array of fields
                props: {}, // array of properties for fields
                operators: {},
            },
            isOpen: false,
            buildExampleUIByModel: true,
            buildBuilderUIByModel: false,
            allowEmptyForExample: true,
            allowEmptyForBuilder: false
        }
    };

    private isVisibleRemoveSearchButton: boolean = false; // is visible remove button
    private isVisibleCreateSearchButton: boolean = false; // is visible create button
    private destroyed$: Subject<any> = new Subject();
    public isReady: boolean = false; // then component ready
    public isDataLoaded: boolean = false; // then async calls have ended.
    public onReady: ReplaySubject<IMFXSelect2LookupReturnType> = new ReplaySubject<IMFXSelect2LookupReturnType>();

    constructor(public cdr: ChangeDetectorRef,
                protected service: SearchAdvancedService,
                protected provider: SearchAdvancedProvider,
                private router: Router) {
        super();
    }

    ngOnInit() {
        // this.router.events.subscribe(() => {
        //     this.resetConfig();
        // });
        // Set default provider/services if custom is null
        this.initializeData(this, 'provider');
        this.initializeData(this, 'service');
        this.passConfigToProvider(this);

        // set searchType for current view
        this.searchType = this.provider.getSearchType();
        // set searchType for SavedSearch module

        this.searchSavedConfig.options.type = <SearchTypesType>this.config.options.restIdForParametersInAdv;
            this.initModule().pipe(
                takeUntil(this.destroyed$)
            ).subscribe((structs: AdvancedSearchGroupRef[]) => {
                this.provider.onInit(structs)
            });
    }

    initModule(): Observable<AdvancedSearchGroupRef[]> {

        // init module
        return Observable.create((observer) => {
            this.provider.init().pipe(
                takeUntil(this.destroyed$)
            ).subscribe((resp: AdvancedFieldsAndOperators) => {
                this.isDataLoaded = true;
                let cd = this.config.options.commonData;
                cd.items = resp.fields.items;
                cd.props = resp.fields.props;
                cd.operators = resp.operators;

                this.onReady.next();
                this.onReady.complete();

                this.provider.getStructure().pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((structs:AdvancedSearchGroupRef[]) => {
                    // qbe
                    if (this.config.options.enabledQueryByExample && this.config.options.buildExampleUIByModel) {
                        this.provider.buildStructure(structs);
                    }

                    if (this.config.options.enabledQueryBuilder && this.config.options.buildBuilderUIByModel) {
                        this.provider.buildStructure(structs);
                    }

                    observer.next(structs);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            });
        });
    }

    resetConfig() {

    }

    ngAfterViewInit() {
        if(this.searchSavedModuleRef){
            this.searchSavedModuleRef.config.options.provider.onSelect.subscribe((searchId: number) => {
                this.updateViewReferences();
            });

            this.searchSavedModuleRef.config.options.provider.onRemove.subscribe(() => {
                this.clearParams();
            });
        }

        this.updateViewReferences();
        this.isReady = true;
        if(this.config.options.isOpen === true) {
            this.provider.setStateForPanel(this.config.options.isOpen);
            this.cdr.detectChanges();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    /**
     * Update value for references to view
     */
     updateViewReferences(): void {
        // remove button
        const selectedSearchId = this.searchSavedModuleRef.config.options.provider.selectedSearchId;
        this.isVisibleRemoveSearchButton = selectedSearchId != undefined && selectedSearchId > -1
            // &&
            // this.config.options.builderData.groups.length > 0
            &&
            this.provider.getSearchMode() === 'builder';

        // create button
        this.isVisibleCreateSearchButton = selectedSearchId != undefined && selectedSearchId > -1
            &&
            this.provider.getSearchMode() === 'builder';

        this.cdr.detectChanges();
    }

    /**
     * Add group
     * @param id
     * @param mode
     */
    addGroup(id: number = null, mode: AdvancedModeTypes = 'builder'): void {
        this.provider.addGroup(id, mode);
    }

    /**
     * Remove group by id
     * @param $event
     */
    removeGroup($event: AdvancedPointerGroupType): void {
        this.provider.removeGroup($event);
    }

    /**
     * Add criteria
     * @param $event
     */
    addCriteria($event: AdvancedPointerGroupType): void {
        this.provider.addCriteria($event);
    }

    /**
     * Remove criteria
     * @param $event
     */
    removeCriteria($event: AdvancedPointerCriteriaType): void {
        this.provider.removeCriteria($event);
    }

    /**
     * Update criteria
     * @param $event
     */
    updateCriteria($event: AdvancedSearchDataCriteriaReturnType): void {
        this.provider.updateCriteria($event);
    }

    /**
     * Clear params of search for qba
     */
    clearParams(mode?: AdvancedModeTypes): void {
        let _mode = mode ? mode : this.provider.getSearchMode();
        if (_mode === 'builder') {
            this.provider.clearParamsForBuilder();
        } else {
            this.provider.clearParamsForExample();
        }
        this.provider.validateBuilderModels()
        this.updateViewReferences();

    }

    /**
     * Send params for search
     */
    sendSubmit() {
        this.provider.sendSubmit()
    }

    /**
     * Switch adv mode
     * @param mode
     */
    setAdvSearchMode(mode: AdvancedModeTypes): void {
        this.provider.setMode(mode);
    }

    /**
     * Save cutrent search params
     */
    saveSearch() {
        this.searchSavedModuleRef.config.options.provider.save(
            this.provider.getModelsPreparedToRequest(this.provider.getSearchMode(), {skipValidation: true})
        );
    }

    /**
     * Remove current search
     */
    removeSearch() {
        this.searchSavedModuleRef.config.options.provider.remove();
    }

    /**
     * Create current search as new for save
     */
    createSearch() {
        this.searchSavedModuleRef.config.options.provider.clearSelectedSearch();
        this.updateViewReferences();
    }


}
