import * as $ from "jquery";
import { SearchRecentProvider } from "../../../modules/search/recent/providers/search.recent.provider";
import { RecentModel } from "../../../modules/search/recent/models/recent";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { TasksComponent } from "../../tasks/tasks.component";
import { TasksMySearchFormProvider } from "./search.form.provider";
import { TasksSearchFormProvider } from "../../tasks/providers/search.form.provider";
import { WorkflowComponent } from "../../workflow/workflow.component";
import { IMFXControlsTreeComponent } from "../../../modules/controls/tree/imfx.tree";
import { AdvancedModeTypes, AdvancedSearchGroupRef } from "../../../modules/search/advanced/types";
import {TasksMyComponent} from "../tasks.my.component";

export class TaskMySearchRecentProvider extends SearchRecentProvider {
    selectRecentSearch(recentSearch: RecentModel) {
        const searchModel = recentSearch.getSearchModel();
        const comp: TasksMyComponent = this.config.componentContext;
        comp.ddUser.preventBuildPage = true;
        if (this.config.moduleContext.externalMode) {
            this.config.moduleContext.onSelect.emit(searchModel);
            return;
        }

        // remove unused properties
        let manuallyAdv: {
            SHOW_COMPLETED: AdvancedSearchModel,
            HIDE_FAILED: AdvancedSearchModel,
            SCHEDULE: AdvancedSearchModel,
            J_FAILURE_RESOLVED: AdvancedSearchModel
        } = <any>{};

        searchModel.getAdvanced().forEach((adv: AdvancedSearchModel) => {
            if (adv.getDBField() === 'J_FAILURE_RESOLVED' ||
                adv.getDBField() === 'HIDE_FAILED' ||
                adv.getDBField() === 'SHOW_COMPLETED' ||
                adv.getDBField() === 'SCHEDULE') {
                manuallyAdv[adv.getDBField()] = adv;
            }
        });

        let sfp: TasksMySearchFormProvider | TasksSearchFormProvider = (<any>comp.searchFormProvider);
        let sfpHideFailed: boolean = null;
        sfp.hideFailed = false;
        if (!(this.config.componentContext instanceof WorkflowComponent) &&
            manuallyAdv.J_FAILURE_RESOLVED) {
            sfpHideFailed = true;
        }

        if (this.config.componentContext instanceof WorkflowComponent &&
            manuallyAdv.HIDE_FAILED) {
            sfpHideFailed = true;
        }
        sfp.hideFailed = sfpHideFailed;
        sfp.showCompleted = !!manuallyAdv.SHOW_COMPLETED;

        if (manuallyAdv.SCHEDULE) {
            if (comp.ddUser) {
                const tree: IMFXControlsTreeComponent = (<IMFXControlsTreeComponent>comp.ddUser.tree);
                const ids = manuallyAdv.SCHEDULE.getValue();
                tree.getTree().visit((node) => {
                    if (ids.indexOf(parseInt(node.key)) > -1 || ids.indexOf(parseInt(node.key) * -1) > -1) {
                        if(!node.selected) {
                            node.setSelected(true);
                        }
                    } else {
                        if(node.selected) {
                            node.setSelected(false);
                        }
                    }
                });
            }
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
        const specialField = this.applySpecialFields(searchModel);
        if (crit) {
            let mode: AdvancedModeTypes = searchModel.getMode();
            advProv.setMode(mode);
            if (!mode && !specialField) {
                console.error('>>>Search mode or adv not found; you call recent search with deprecated structure');
                mode = 'builder';
            }
            let crits = searchModel.getModelForRestore();
            let structs: Array<AdvancedSearchGroupRef> = advProv.turnCriteriasToStructures(crits, null, [
                'SHOW_COMPLETED', 'HIDE_FAILED', 'SCHEDULE'
            ]);
            if (mode === 'builder') {
                advProv.clearParamsForBuilder();
                advProv.buildStructure(structs);
            } else {
                advProv.clearParamsForExample('empty');
                let defStruct: Array<AdvancedSearchGroupRef> = advModule.service.getStructure();
                structs = $.extend(true, {}, defStruct, structs);
                advProv.buildStructure(structs);
            }
        }

        // restore result

        if (this.config.componentContext.slickGridComp) {
            this.config.componentContext.slickGridComp.provider.buildPage(searchModel, true);
        }

        //clear selected facets
        if (this.config.componentContext.searchFacetsProvider)
            this.config.componentContext.searchFacetsProvider.clearSelectedFacets();

        // restore search form value
        // restore search form value
        if (searchModel.getBase().getValue() && searchModel.getBase().getValue() != '') {
            this.config.componentContext.searchFormConfig.options.provider.setSearchString(searchModel.getBase().getValue());
        } else {
            if (!specialField) {
                this.config.componentContext.searchFormConfig.options.provider.clearSearchString();
            }
        }

        // change position for selected search model
        // let self = this;
        this.moveToTop(recentSearch).subscribe(() => {
            // self.overlayRecentSearches.hide($(this.recentsList.nativeElement));

            setTimeout(() => {
                advProv.validateModels();
                advModule.updateViewReferences();
                comp.ddUser.preventBuildPage = false;
            })
        });
    }
}
