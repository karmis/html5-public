import { Injectable } from '@angular/core';
import { ConsumerCriteriaModificationType, ConsumerSearchType, ConsumerSettingsType } from './consumer.search.component';
import { FacetType } from './components/consumer.facet/consumer.facet.component';
import { SessionStorageService } from 'ngx-webstorage';
import { ConsumerSearchModel } from '../../models/search/common/consumer.search';
import * as _ from 'lodash';
import { LoginProvider } from '../login/providers/login.provider';

@Injectable()
export class ConsumerSearchProvider {
    private cst: ConsumerSearchType = null;
    private storagePrefix: string = 'consumer.type';
    private defaultSettings: ConsumerSettingsType = {
        detail: {
            opened: false
        },
        result: {
            selected: null
        },
        facets: {
            opened: true,
            expanded: []
        }
    };

    constructor(private sessionStorage: SessionStorageService, private loginProvider: LoginProvider) {
        loginProvider.onLogout.subscribe(() => {
            this.clearConsumerSearchType();
        });
    }

    public setConsumerSearchType(cst: ConsumerSearchType | null) {
        this.cst = cst;
        this.sessionStorage.store(this.storagePrefix, {
            mode: cst.mode,
            model: cst.model._toJSON(),
            settings: cst.settings
        } as ConsumerSearchType);
    }

    public getConsumerSearchType(): ConsumerSearchType | null {
        if (!this.cst) {
            // try to get model from storage
            this.cst = this.retrieveConsumerSearchTypeFromStorage();
        }

        if (!this.cst) {
            // console.error('ConsumerSearchType not found');
            return null;
        }

        return this.cst;
    }

    public updateSettings(settings: ConsumerSettingsType | any) {
        const cst = this.getConsumerSearchType();
        if (cst) {
            this.cst = _.merge(cst, {settings: this.defaultSettings}, {settings});
            this.setConsumerSearchType(this.cst);
        } else {
            // console.error('ConsumerSearchType not found');
        }
    }

    public clearConsumerSearchType() {
        this.sessionStorage.clear(this.storagePrefix);
        this.cst = null;
    }

    public setExpandedFacets(facet: FacetType[] = []) {
        const expanded = [];
        if (!facet) {
            return;
        }
        facet.forEach((facet: FacetType) => {
            if (this.getExpandedFacets().indexOf(facet.FacetId) === -1) {
                expanded.push(facet.FacetId);
            }
        });

        this.updateSettings({facets: {expanded}});
    }

    public clearExpandedFacets() {
        const cst = this.getConsumerSearchType();
        if (!cst) {
            console.error('Model not found');
        }
        if (cst && !cst.settings) {
            cst.settings = this.getSettings();
        }

        cst.settings.facets.expanded = [];
        this.setConsumerSearchType(cst);
    }

    public addExpandedFacet(facet: FacetType) {
        if (!this.isExpandedFacet(facet)) {
            const expandedFacets = this.getExpandedFacets();
            expandedFacets.push(facet.FacetId);
            this.updateSettings({facets: {expanded: expandedFacets}});
        }
    }

    public removeExpandedFacet(facet: FacetType) {
        const expandedFacets = this.getExpandedFacets().filter((id: string) => {
            return facet.FacetId !== id;
        });
        const cst = this.getConsumerSearchType();
        if (!cst) {
            console.error('Model not found');
        }
        if (cst && !cst.settings) {
            cst.settings = this.getSettings();
        }

        cst.settings.facets.expanded = expandedFacets;
        this.setConsumerSearchType(cst);

    }

    public isExpandedFacet(facet: FacetType): boolean {
        return this.getExpandedFacets().indexOf(facet.FacetId) > -1;
    }

    public getExpandedFacets() {
        const sFacets = this.getConsumerSearchType().settings.facets;
        if (sFacets && !sFacets.expanded) {
            sFacets.expanded = [];
        }

        return sFacets.expanded
    }

    public getSettings(): ConsumerSettingsType {
        let settings: ConsumerSettingsType;
        if (this.getConsumerSearchType() !== null) {
            settings = _.extend(this.defaultSettings, this.getConsumerSearchType().settings);
        } else {
            settings = this.defaultSettings;
        }

        return settings;
    }

    public toggleModification(mods: ConsumerCriteriaModificationType[]) {
        const cst: ConsumerSearchType = this.getConsumerSearchType();
        cst.mode = 'new';
        mods.forEach((mod: ConsumerCriteriaModificationType) => {
            if (mod.mode === 'add') {
                cst.model.addAdvancedItem(mod.model)
            } else {
                cst.model.removeAdvancedItemByDBField(mod.model.getDBField())
            }
        });
        this.setConsumerSearchType(cst);
        return this.cst;
    }

    getSearchString() {
        let ss = '';
        const cst = this.getConsumerSearchType();
        if (cst && cst.model) {
            ss = cst.model.getBase().getValue();
        }

        return ss;
    }

    private retrieveConsumerSearchTypeFromStorage(): ConsumerSearchType | null {
        const jsonSearchModel = this.sessionStorage.retrieve(this.storagePrefix);
        if (!jsonSearchModel) {
            return null;
        }
        const m: ConsumerSearchModel = (new ConsumerSearchModel()).createFromJSON(jsonSearchModel.model);
        return {
            mode: 'new',
            model: m,
            settings: jsonSearchModel.settings
        } as ConsumerSearchType
    }


}
