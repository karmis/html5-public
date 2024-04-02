/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import { EventEmitter, Injectable } from "@angular/core";
import { SearchFormConfig } from "../search.form.config";
import { Observable, Subscription } from "rxjs";
import { SearchModel } from "../../../../models/search/common/search";
import { AdvancedSearchModel } from "../../../../models/search/common/advanced.search";
import { BaseSearchModel } from "../../../../models/search/common/base.search";
import { SearchSuggessionType } from "../types";
import { SearchAdvancedProvider } from "../../advanced/providers/search.advanced.provider";

@Injectable()
export class SearchFormProvider {
    public onSubmitForm: EventEmitter<{ data: any }> = new EventEmitter<{ data: any }>();
    config: SearchFormConfig;
    searchForm: any;
    protected loadingInput: boolean = false;

    /**
     * Before search
     * @param searchString
     * @param currentItem
     * @param isValid
     * @returns {any}
     */
    beforeSearchSuggestion(searchString, currentItem, isValid): SearchSuggessionType {
        let config = this.config;
        let ssp: SearchSuggessionType = {
            showAutocompleteDropdown: false,
            searching: false,
            results: {
                titles: [],
                series: [],
                contributors: []
            },
            currentItem: -1,
            currentArray: 0,
        };

        if (!isValid || searchString.length < config.options.minLength) {
            ssp.searching = false;
        } else if (currentItem >= 0) {
            ssp.searching = true;
        } else {
            ssp.searching = true;
            ssp.showAutocompleteDropdown = true;
        }

        return ssp;
    }

    /**
     * On search
     * @param searchString
     * @param currentItem
     * @param isValid
     * @returns {any}
     */
    onSearchSuggestion(searchString, currentItem, isValid): Observable<Subscription> {
        return Observable.create((observer) => {
                this.config.options.service.searchSuggestion(searchString, this.config.options.searchType).subscribe(
                    (res: any) => {
                        let results = {
                            titles: [],
                            series: [],
                            contributors: []
                        };
                        for (var e in res) {
                            for (var i = 0; i < res[e].length; i++) {
                                let elem = {
                                    title: res[e][i].Title,
                                    count: res[e][i].Count,
                                    image: window.location.protocol.indexOf("https") == 0 ? res[e][i].ThumbUrl && res[e][i].ThumbUrl.replace("http://", "https://") : res[e][i].ThumbUrl,
                                    type: e
                                };
                                switch (e) {
                                    case 'Series': {
                                        elem['id'] = res.Series[i].SeriesId;
                                        break;
                                    }
                                    case 'Contributors': {
                                        elem['id'] = res.Contributors[i].ContributorId;
                                        elem['image'] = elem.image || this.config.options.appSettings.getContributorThumb();
                                        break;
                                    }
                                    default:
                                        break;
                                }

                                results[e.toLocaleLowerCase()].push(elem);
                            }
                        }
                        if (res.Contributors.length > 0 || res.Titles.length > 0 || res.Series.length > 0) {
                            this.config.options.onSearch.emit(true);
                        }

                        observer.next({res: res, results: results, searching: false});
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    }
                );
            }
        );
    }

    /**
     * On reset
     * @returns {any}
     */
    resetSuggestion(): Observable<Subscription> {
        return Observable.create((observer) => {
            observer.next({
                showAutocompleteDropdown: false,
                currentItem: -1,
                currentArray: 0
            });
            observer.complete();
        });
    }

    /**
     * On select
     * @param result
     * @returns {any}
     */
    selectResult(result): { model: SearchModel, result: any } {
        let searchModel = this.getModel();

        if (result && result.type !== 'Titles') {
            let advSearchModel = new AdvancedSearchModel();
            advSearchModel.setValue(result.id);
            advSearchModel.setOperation('=');
            if (result.type === 'Series') {
                advSearchModel.setDBField('SERIES_ID');
                advSearchModel.setField('Series');
            } else if (result.type === 'Contributors') {
                advSearchModel.setDBField('CONTRIBUTOR_ID');
                advSearchModel.setField('Contributors');
            }
            advSearchModel.setDirtyValue({fromSuggestion: result});
            if (!searchModel.hasAdvancedItem(advSearchModel)) {
                searchModel.addAdvancedItem(advSearchModel);
            }
            searchModel.setBase((new BaseSearchModel()));
        } else {
            let baseSearchModel = new BaseSearchModel();
            baseSearchModel.setValue(result.title);
            searchModel.setBase(baseSearchModel);

        }

        // to facets
        let facetsConfig = this.config.componentContext.searchFacetsConfig;
        if (facetsConfig) {
            facetsConfig.options.onSearchStringUpdated.emit(true);
        }

        return {
            result: result,
            model: searchModel
        };
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    onSubmit(data): any {
        // this.config.options.currentMode = 'Titles';
        let results = {
            titles: [],
            series: [],
            contributors: []
        };

        let advProv = this.config.componentContext.searchAdvancedProvider;
        let withAdv = advProv ? advProv.withAdvChecking() : false;
        let searchModel: SearchModel = this.getModel(true, withAdv);
        let facetsConfig = this.config.componentContext.searchFacetsConfig;

        if (facetsConfig) {
            facetsConfig.options.onSearchStringUpdated.emit(true);
        }
        this.onSubmitForm.emit({data: data});
        return {
            results: results,
            model: searchModel
        };
    };

    getModel(withTitle: boolean = true, withAdv: boolean = true): SearchModel {
        let searchModel = new SearchModel();
        if (withTitle) {
            let baseSearchModel = new BaseSearchModel();
            baseSearchModel.setValue(this.getSearchString());
            searchModel.setBase(baseSearchModel);
        }

        // get data from adv
        let advProv: SearchAdvancedProvider = this.config.componentContext.searchAdvancedProvider;
        let advModels: AdvancedSearchModel[] = [];
        if (advProv && withAdv) {
            // advModels = advModels.concat(this.getCustomCriterias());
            // advModels = advModels.concat(advProv.getCustomModels());
            if (advProv.getStateForPanel() === true) {
                advModels = advModels.concat(advProv.getModels());
                searchModel.setAdvanced(advModels);
            }
            searchModel.setMode(advProv.getSearchMode());
        }

        // add to log request from search tree (Media screen`)
        const compContext = this.config.componentContext;
        // /* && compContext.searchFormConfig.options.searchType === 'Media'  */
        if (compContext && compContext.searchFormConfig && compContext.stateGroupPanel === true && compContext.searchGroupProvider) {
            const groupAdvModel = compContext.searchGroupProvider.getAdvancedModel();
            if (groupAdvModel.getValue() != null) {
                searchModel.addAdvancedItem(groupAdvModel);
            }
        }

        const suggestionSearch = this.config.moduleContext.getPreparedModel();
        if (suggestionSearch && suggestionSearch.getSpecialFields().length > 0) {
            suggestionSearch.getSpecialFields().forEach((adv: AdvancedSearchModel) => {
                if (!searchModel.hasAdvancedItem(adv)) {
                    searchModel.addAdvancedItem(adv);
                }
            });
            searchModel.fromSuggestion = true;
        }

        searchModel.getAdvanced().concat(advModels);
        // searchModel.setAdvanced(advModels);


        return searchModel;
    }

    getSearchString(): string {
        if(!this.config || !this.config.moduleContext) {
            return '';
        }
        const searchStr = this.config.moduleContext.searchStringEl.nativeElement.value;
        return $.trim(searchStr) ? $.trim(searchStr) : $.trim(this.searchForm ? this.searchForm.controls ? this.searchForm.controls.searchString.value : null : null);
    }

    setSearchString(value): void {
        this.config.moduleContext.setSearchValue(value);
    }

    clearSearchString() {
        this.config.moduleContext.clearSearchValue();
    }

    submit(): void {
        let btnEl = this.config.moduleContext.submitButtonEl.nativeElement;
        if (!btnEl.disabled) {
            btnEl.click();
        }
    }

    // lockForm() {
    //     this.config.options.isBusy = true;
    //     this.config.moduleContext.cdr.markForCheck();
    // }
    //
    // unlockForm() {
    //     this.config.options.isBusy = false;
    //     this.config.moduleContext.cdr.markForCheck();
    // }

    isLockedForm(): boolean {
        return !this.isEnabledSearchButton();
    }

    setStateForForm(state: boolean) {
        this.config.options.enabledSearchButton = state;
        this.config.moduleContext.cdr.markForCheck();
    }

    showLoadingInput() {
        this.loadingInput = true;
        this.config.moduleContext.cdr.markForCheck();
        // this.config.moduleContext.cdr.detectChanges();
    }

    hideLoadingInput() {
        this.loadingInput = false;
        this.config.moduleContext.cdr.markForCheck();
    }

    isLoadingInput() {
        return this.loadingInput;
    }


    /**
     * Is  enabled search button
     * @returns {boolean}
     */
    isEnabledSearchButton(): boolean {
        let res: boolean = false;
        const sac = this.config.moduleContext.config.componentContext.searchAdvancedConfig;
        // const groupPanel = this.config.moduleContext.config.componentContext.stateGroupPanel;
        // if(groupPanel) {
        //     res = false;
        // } else {
            if (sac) {
                // throw new Error('this.config.moduleContext.config.componentContext.searchAdvancedConfig is not available')
                let isValidAdv = sac.options.provider.isValidStructure();
                if (isValidAdv === null) {
                    res = this.config.options.enabledSearchButton && (
                        this.getSearchString() != "" || this.config.moduleContext.searchStringEl.nativeElement.value != "" || this.config.options.searchButtonAlwaysEnabled
                    );
                } else {
                    res = isValidAdv && !this.config.options.isBusy;
                }
            } else {
                res = true;
            }
        // }

        return res;
    }

    refresh() {
        this.config.componentContext.searchGridConfig.options.provider.refreshResults();
    }
}
