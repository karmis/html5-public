/**
 * Created by Sergey Trizna on 22.09.2017.
 */
import {EventEmitter, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {SearchSavedConfig} from "../search.saved.config";
import {SearchTypesType} from "../../../../services/system.config/search.types";
import {SavedSearchList, SaveSearchResponse} from "../types";
import {AdvancedCriteriaListTypes, AdvancedSearchGroupRef} from "../../advanced/types";
import { IMFXModalPromptComponent } from '../../../imfx-modal/comps/prompt/prompt';
import { IMFXModalComponent } from '../../../imfx-modal/imfx-modal';
import { IMFXModalProvider } from '../../../imfx-modal/proivders/provider';
import { IMFXModalEvent } from '../../../imfx-modal/types';
import { IMFXModalAlertComponent } from '../../../imfx-modal/comps/alert/alert';
import {SearchSavedComponent} from "../search.saved";
import { lazyModules } from "../../../../app.routes";


@Injectable()
export class SearchSavedProvider {
    public config: SearchSavedConfig;
    selectedSearchId: number = -1;
    /**
     * On select saved  search emitter
     */
    onSelect: EventEmitter<number> = new EventEmitter<number>();

    /**
     * On remove saved  search emitter
     */
    onRemove: EventEmitter<void> = new EventEmitter<void>();

    constructor(private modalProvider: IMFXModalProvider) {}

    /**
     * Save or update params of search
     * Media -> Advanced Search -> Add Filter -> Save
     * @param models
     */
    save(models: AdvancedCriteriaListTypes) {
        if (this.getSelectedSearch() > -1) {
            let name = this.getNameForSearch();
            this.processSave(this.getSelectedSearch(), name, this.config.options.type, models);
        } else {
            let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.imfx_modal_prompt,
                IMFXModalPromptComponent, {
                size: 'md',
                title: 'advanced.modal_name_for_search',
                position: 'center',
                footer: 'cancel|ok'
            });
            modal.load().then(cr => {
                let modalContent: IMFXModalPromptComponent = cr.instance;
                modalContent.setLabel('advanced.modal_need_name_for_search');
                modalContent.setPlaceholder('advanced.modal_name_for_search_placeholder');
                modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name === 'ok') {
                        const name = modalContent.getValue();
                        if (!name) {
                            this.config.moduleContext.notificationRef.notifyShow(2, "common.error_empty_name");
                            return;
                        }
                        this.processSave(-1, name, this.config.options.type, models);
                        this.updateList().subscribe(() => {});
                        modal.hide();
                    } else if (e.name === 'hide') {
                        modal.hide();
                    }
                });
            })

        }
    }

    /**
     * Process save params of search
     * @param id
     * @param name
     * @param type
     * @param models
     */
    processSave(id: number, name: string, type, models: AdvancedCriteriaListTypes): void {
        this.config.options.service.saveSearch(id, name, this.config.options.type, models).subscribe(
            (resp: SaveSearchResponse) => {
                if (resp.Result === true) {
                    this.config.moduleContext.notificationRef.notifyShow(1, "saved.save_success");
                } else {
                    this.config.moduleContext.notificationRef.notifyShow(2, "saved.save_error");
                }

                if (id == -1) {
                    this.updateList(type, true).subscribe((searchList: SavedSearchList) => {
                        this.setSelectedSearch(resp.ObjectId);
                    });
                }
            },
            (error: SaveSearchResponse) => {
                this.config.moduleContext.notificationRef.notifyShow(2, "saved.save_error");
            }
        );
    }

    /**
     * Remove search (current or by id)
     * @param searchId
     * @param searchType
     */
    remove(searchId?: number, searchType?: SearchTypesType): void {
        let searchName = this.getNameForSearch();
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'advanced.modal_remove_saved_search_conformation',
                {searchName: searchName}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.processRemove(searchId, searchType);
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    /**
     * Process remove saved search
     * @param searchId
     * @param searchType
     */
    processRemove(searchId?: number, searchType?: SearchTypesType): void {
        let _searchId = searchId ? searchId : this.getSelectedSearch();
        let _searchType = searchType ? searchType : this.config.options.type;
        this.config.options.service.removeSavedSearch(_searchType, _searchId).subscribe((resp: SaveSearchResponse) => {
            if (resp.Result === true) {
                this.config.moduleContext.notificationRef.notifyShow(1, "saved.remove_success");
            } else {
                this.config.moduleContext.notificationRef.notifyShow(2, "saved.remove_error");
            }

            this.updateList(searchType, true).subscribe((searchList: SavedSearchList) => {
                this.clearSelectedSearch();
                this.onRemove.emit();
            });
        });
    }

    /**
     * Update list of saved searches
     * @param searchType
     * @param cacheClear
     * @returns {any}
     */
    updateList(searchType?: SearchTypesType, cacheClear?: boolean): Observable<SavedSearchList> {

        return new Observable((observer: any) => {
            let _searchType = searchType ? searchType : this.config.options.type;
            let _cacheClear = cacheClear ? cacheClear : false;
            let m = this.config.moduleContext;
            // fill list of saved searches
            this.getListOfSavedSearches(_searchType, _cacheClear).subscribe((resp: SavedSearchList) => {
                // remove first hardcoded placeholder
                resp.splice(0, 1);

                // set data to select
                m.searchSavedSelectRef.setData(m.searchSavedSelectRef.turnArrayOfObjectToStandart(resp, {
                    key: 'ID',
                    text: 'Name'
                }), true);

                observer.next(resp);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            })
        });
    }

    /**
     * Set selected search
     * @param searchId
     */
    setSelectedSearch(searchId: number): void {
        if (searchId > -1) {
            this.selectedSearchId = searchId;
            this.config.moduleContext.searchSavedSelectRef.setSelectedByIds([searchId]);
            this.onSelect.emit(searchId);
        } else {
            this.clearSelectedSearch();
        }
    }

    /**
     * Get selected search
     * @returns {number}
     */
    getSelectedSearch(): number {
        return this.selectedSearchId;
    }

    /**
     * Clear selected search
     */
    clearSelectedSearch(): void {
        this.selectedSearchId = -1;
        this.config.moduleContext.searchSavedSelectRef.clearSelected();
    }

    /**
     * Get  list of saved search
     * @param type
     * @param cacheClear
     * @returns {any}
     */
    getListOfSavedSearches(type: SearchTypesType, cacheClear: boolean = false): Observable<SavedSearchList> {
        return new Observable((observer: any) => {
            this.config.options.service.getListOfSavedSearches(type, cacheClear).subscribe((resp: SavedSearchList) => {
                observer.next(resp)
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            })
        });
    }

    /**
     * Gt item of saved search
     * @param type
     * @param id
     * @param cacheClear
     * @returns {any}
     */
    getItemOfSavedSearch(type: SearchTypesType, id: number, cacheClear: boolean = false): Observable<AdvancedCriteriaListTypes> {
        return new Observable((observer: any) => {
            this.config.options.service.getItemOfSavedSearch(type, id, cacheClear).subscribe((resp: AdvancedCriteriaListTypes) => {
                observer.next(resp)
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            })
        });
    }

    /**
     * On select saved search
     * @param searchId
     */
    setSavedSearch(searchId: number): void {
        this.setSelectedSearch(searchId);
        let advComp = this.config.componentContext.searchAdvancedConfig;
        if (!advComp) {
            throw new Error('No adv in component for work with saved searches; You need re implement onSelectSavedSearch method');
        }
        let advProv = advComp.options.provider;
        if (!advProv) {
            throw new Error('No adv provider in component for work with saved searches; You need re implement onSelectSavedSearch method');
        }

        if (!searchId) {
            advProv.clearParamsForBuilder();
            return;
        }

        this.getItemOfSavedSearch(this.config.options.type, searchId).subscribe(
            (crits: AdvancedCriteriaListTypes) => {
                advProv.clearParamsForBuilder();
                let structs: Array<AdvancedSearchGroupRef> = advProv.turnCriteriasToStructures(crits, 'builder');
                advProv.buildStructure(structs);
                this.onSelect.emit(searchId)
            })
    }

    /**
     * Get name search by ID or selected
     * @param searchId
     */
    getNameForSearch(searchId?: number): string {
        let _searchId = searchId ? searchId : this.getSelectedSearch();
        return this.config.moduleContext.searchSavedSelectRef.getSelectedTextByIdForSingle(_searchId);
    }
}
