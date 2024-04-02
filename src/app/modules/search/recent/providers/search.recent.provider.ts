/**
 * Created by Sergey Trizna on 15.03.2017.
 */
import * as $ from "jquery";
import {Injectable} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {SearchRecentConfig} from "../search.recent.config";
import {RecentModel} from "../models/recent";
import {SearchModel} from "../../../../models/search/common/search";
import {AdvancedSearchModel} from "../../../../models/search/common/advanced.search";
import {SearchRecentProviderInterface} from "./search.recent.provider.interface";
import {AdvancedModeTypes, AdvancedSearchGroupRef} from "../../advanced/types";
import {SearchFormProvider} from '../../form/providers/search.form.provider';

@Injectable()
export class SearchRecentProvider implements SearchRecentProviderInterface {
    config: SearchRecentConfig;

    /**
     * Array of recent searches
     */
    recentSearches: Array<RecentModel> = [];

    /**
     * Return array of recent searches
     */
    getRecentSearches(): Observable<Array<RecentModel>> {
        return new Observable((observer: any) => {
                this.config.options.service.retrieveRecentSearches(
                    this.config.options.viewType, this.config.options.itemsLimit)
                    .subscribe((recentsJSONs) => {
                        observer.next(recentsJSONs);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            }
        );
    }

    selectRecentSearch(recentSearch: RecentModel) {
        let searchModel: SearchModel = recentSearch.getSearchModel();
        if (this.config.moduleContext.externalMode) {
            this.config.moduleContext.onSelect.emit(searchModel);
            return;
        }

        // this.overlayRecentSearches.show($(this.recentsList.nativeElement));
        let searchAdvConfig = this.config.componentContext.searchAdvancedConfig;
        let searchFormConfig = this.config.componentContext.searchFormConfig;
        let advModule = searchAdvConfig.options.provider.config.moduleContext;
        if (!searchAdvConfig || !searchFormConfig) {
            throw new Error('Not found config for advanced or searchForm');
        }
        let advProv = advModule.config.options.provider;
        // get mode for current recent search (by first criteria in search)
        let crit = searchModel.getAdvancedItem(0);
        let mode: AdvancedModeTypes = searchModel.getMode();
        const specialField = this.applySpecialFields(searchModel);
        advModule.clearParams();
        if (crit) {
            if (!mode && !specialField) {
                console.error('>>>Search mode or adv not found; you call recent search with deprecated structure');
                mode = 'builder';
            }
            advProv.setMode(mode);
            let structs: Array<AdvancedSearchGroupRef> = advProv.turnCriteriasToStructures(searchModel.getModelForRestore());
            if (mode === 'builder') {
                advProv.buildStructure(structs);
            } else {
                let defStruct: Array<AdvancedSearchGroupRef> = advModule.service.getStructure();
                structs = $.extend(true, {}, defStruct, structs);
                advProv.buildStructure(structs);
            }
        }

        // restore result
        if (this.config.componentContext.slickGridComp) {
            this.config.componentContext.slickGridComp.provider.buildPage(searchModel, true);
        }

        // clear selected facets
        if (this.config.componentContext.searchFacetsProvider)
            this.config.componentContext.searchFacetsProvider.clearSelectedFacets();

        // restore search form value

        if (searchModel.getSpecialFields().length > 0) {
            const dv = (<AdvancedSearchModel>searchModel.getSpecialFields()[0]).getDirtyValue();
            // if(searchModel.hasSpecialFields()) {
                // const t = searchModel.getTextForSpecialField();
                searchModel.getSpecialFields()[0].setDirtyValue({fromSuggestion: {title: searchModel.getBase().getValue()}});
            // }
            // if (dv && dv.fromSuggestion && dv.fromSuggestion.title) {
                this.config.componentContext.searchFormConfig.options.provider.setSearchString(
                    searchModel.getBase().getValue()
                );
            // }

            searchModel.fromSuggestion = true;
        } else if (searchModel.getBase().getValue() && searchModel.getBase().getValue() != '') {
            this.config.componentContext.searchFormConfig.options.provider.setSearchString(
                searchModel.getBase().getValue()
            );
        } else {
            if (!specialField) {
                this.config.componentContext.searchFormConfig.options.provider.clearSearchString();
            }
        }


        // change position for selected search model
        // let self = this;
        if (this.config.moduleContext) {
            this.moveToTop(recentSearch).subscribe(() => {
                // self.overlayRecentSearches.hide($(this.recentsList.nativeElement));
                setTimeout(() => {
                    advProv.validateModels();
                    advModule.updateViewReferences();
                });
            });
        }
    }

    applySpecialFields(searchModel): string {
        // exclude special params for search.form comp
        console.log(searchModel.specialFields);
        // if specialFields exist in the request
        const specialFields: AdvancedSearchModel[] = searchModel.getSpecialFields();
        let currentMode = 'Titles';
        // @ TODO  searchFormProvider.config.options.currentMode takes last value if special search criterias will be more that 1
        if (specialFields.length > 0) {
            specialFields.forEach((specialField: AdvancedSearchModel) => {
                console.log('specialFields exist in the request');
                const searchFormProvider: SearchFormProvider = this.config.moduleContext.injector.get(SearchFormProvider);
                // searchFormProvider.setSearchString(specialField.getValue());
                if (specialField.getDBField() === 'SERIES_ID') {
                    currentMode = 'Series';
                } else if (specialField.getDBField() === 'CONTRIBUTOR_ID') {
                    currentMode = 'Contributors';
                }
                searchFormProvider.config.options.currentMode = currentMode;
            });

            return specialFields[0].getDBField();
        } else {
            const searchFormProvider: SearchFormProvider = this.config.moduleContext.injector.get(SearchFormProvider);
            searchFormProvider.config.options.currentMode = currentMode;

            return;
        }
    }

    setRecentSearches(recentsJSONs: Array<any>, clear: boolean = false) {
        if(clear){
            this.recentSearches = [];
        }
        $.each(recentsJSONs, (i, recentJSON) => {
            if (recentJSON && recentJSON.searchModel) {
                const searchModel = (new SearchModel()).createFromJSON(recentJSON.searchModel, recentJSON.beautyString);
                if (searchModel.isEmpty()) {
                    return true;
                }

                let recentSearch = new RecentModel();
                recentSearch.setSearchModel(searchModel);
                recentSearch.setTotal(recentJSON.total);
                recentSearch.setBeautyString(recentJSON.beautyString);
                this.recentSearches.push(recentSearch);
                // if(this.config.moduleContext.externalMode){
                //     this.recentSearches.push(recentSearch);
                // } else {
                //
                // }
            }
        });
        // for (let i = 0; i < recentsJSONs.length; i++) {
        //     const recentJSON = recentsJSONs[i];
        //
        //
        //     // let advancedSearchModels = new Array<AdvancedSearchModel>();
        //     // let baseSearchModel = new BaseSearchModel();
        //     //
        //     // if (recentJSON.searchModel._base) {
        //     //     baseSearchModel.setValue(recentJSON.searchModel._base._value);
        //     // }
        //     //
        //     // for (let j = 0; j < recentJSON.searchModel._advanced.length; j++) {
        //     //     let advancedSearchModel = new AdvancedSearchModel();
        //     //     advancedSearchModel.fillModel(recentJSON.searchModel._advanced[j]);
        //     //     advancedSearchModels.push(advancedSearchModel);
        //     // }
        //     //
        //     // let searchModel = new SearchModel();
        //     // searchModel.setBase(baseSearchModel);
        //     // searchModel.setAdvanced(advancedSearchModels);
        //     // searchModel.setMode(recentJSON.searchModel._mode);
        //     //
        //     // let recentSearch = new RecentModel();
        //     // recentSearch.setSearchModel(searchModel);
        //     // recentSearch.setTotal(recentJSON.total);
        //     // recentSearch.setBeautyString(recentJSON.beautyString);
        //     // let isSet = false;
        //     // $.each(this.recentSearches, (key, recentSearchItem) => {
        //     //     if (recentSearchItem.getBeautyString() == recentSearch.getBeautyString()) {
        //     //         isSet = true;
        //     //         return false;
        //     //     }
        //     // });
        //     //
        //     // if (!isSet) {
        //     // this.recentSearches.unshift(recentSearch);
        //     // }
        // }

        this.applyInModule();
    }

    /**
     * Add model of recent search to stack
     * @param recentModel
     * @param config
     */
    addRecentSearch(recentModel: RecentModel, config?: SearchRecentConfig): void {
        if (config) {
            this.config = $.extend({}, this.config, config, true);
        }
        if(this.config.moduleContext) {
            this._addWithoutDuplicates(recentModel, config)

        } else {
            this.getRecentSearches().subscribe((recents) => {
                this.setRecentSearches(recents);
                this._addWithoutDuplicates(recentModel, config)
            })
        }
    }

    _addWithoutDuplicates(recentModel: RecentModel, config?: SearchRecentConfig) {
        let isSet = false;
        $.each(this.recentSearches, (key, recentSearchItem) => {
            // if it is new search then add to stack
            // with results
            // if (recentSearchItem.getBeautyString() == recentModel.getBeautyString()) {
            // without results
            // @todo check it
            let sm: any = recentModel;
            if(recentModel.getSearchModel) {
                sm = recentModel.getSearchModel();
            }
            if (recentSearchItem.getSearchModel().isEqual(sm)) {
                isSet = true;
                if(recentModel.getTotal) {
                    recentSearchItem.setTotal(recentModel.getTotal());
                    recentSearchItem.fillBeautyString();
                }

                if (this.config.moduleContext) {
                    this.moveToTop(recentSearchItem).subscribe();
                }
                return false;
            }
        });
        if (!isSet) {
            this.recentSearches.unshift(recentModel);
            if (this.recentSearches.length > this.config.options.itemsLimit) {
                this.recentSearches = this.recentSearches.slice(0, this.config.options.itemsLimit);
            }

            if (this.config.moduleContext) {
                this.config.moduleContext._recentSearches = this.recentSearches;
                this.config.moduleContext.cdr.markForCheck();
                this.config.options.service.storeRecentSearches(this.config.options.viewType, this.recentSearches).subscribe(() => {});
            } else {
                // for consumer search
                this.config.options.service.addRecentSearch(this.config.options.viewType, recentModel, this.config.options.itemsLimit).subscribe(() => {
                });
            }
        }
    }

    /**
     * Clear stack of recent searches
     */
    clearRecentSearches(): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.config.options.service.clearRecentSearches(this.config.options.viewType).subscribe((resp: any) => {
                this.recentSearches = [];
                observer.next(resp);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    moveToTop(recentSearch: RecentModel, withoutSave: boolean = false): Observable<Subscription> {
        return new Observable((observer: any) => {
            let _rc: Array<RecentModel> = this.config.moduleContext._recentSearches.slice(0);
            this.recentSearches = this.config.moduleContext.arrayProvider.move(
                _rc,
                this.config.moduleContext.arrayProvider.getIndexArrayByProperty(recentSearch.getBeautyString(), this.config.moduleContext._recentSearches, 'beautyString'),
                0);

            this.config.moduleContext._recentSearches = _rc.slice(0);
            if (!withoutSave) {
                this.config.options.service.storeRecentSearches(this.config.options.viewType, _rc).subscribe((resp: Array<RecentModel>) => {
                    this.recentSearches = resp;
                    this.applyInModule();
                    observer.next();
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next();
                observer.complete();
                // });
            }
        });
    }

    applyInModule() {
        if(this.config.moduleContext){
            this.config.moduleContext._recentSearches = this.recentSearches;
            this.config.moduleContext.cdr.markForCheck();
        }
    }
}
