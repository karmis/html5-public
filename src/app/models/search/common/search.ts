/**
 * Created by Sergey Trizna on 09.03.2017.
 */
import {Injectable} from "@angular/core";
import {SearchInterfaceModel} from "./search.interface";
import {BaseSearchModel} from "./base.search";
import {AdvancedSearchModel} from "./advanced.search";
import {
    AdvancedCriteriaListTypes,
    AdvancedCriteriaType,
    AdvancedModeTypes
} from "../../../modules/search/advanced/types";
import {ConsumerSearchModel} from "./consumer.search";

export type StringNameForSearchModel = 'SearchModel' | 'ConsumerSearchModel';

@Injectable()
export class SearchModel implements SearchInterfaceModel {
    public fromSuggestion: boolean = false;
    protected _base?: BaseSearchModel;
    protected _advanced?: Array<AdvancedSearchModel> = [];
    private _mode?: AdvancedModeTypes;
    private _beautyString: string;

    private _specialFields: string[] = ['SERIES_ID', 'CONTRIBUTOR_ID'];

    public get specialFields(): string[] {
        return this._specialFields;
    }

    getBase(): BaseSearchModel {
        return this._base;
    }

    setBase(value: BaseSearchModel) {
        this._base = value;
    }

    getAdvanced(): Array<AdvancedSearchModel> {
        return this._advanced;
    }

    setAdvanced(advs: Array<AdvancedSearchModel>) {
        advs.forEach((adv: AdvancedSearchModel) => {
            this.addAdvancedItem(adv);
        });
    }

    addAdvancedItem(adv: AdvancedSearchModel) {
        if (!this.hasAdvancedItemSpecGroup(adv)) {
            this._advanced.push(adv);
        }
    }

    addAdvancedItems(res: AdvancedSearchModel[]) {
        if (!!res.length) {
            for (let item of res) {
                this.addAdvancedItem(item);
            }
        }
    }

    getAdvancedItem(key): AdvancedSearchModel {
        return this._advanced[key];
    }

    hasAdvancedItem(m: AdvancedSearchModel): boolean {
        return this.findAdvancedItem({
            dbField: m.getDBField(),
            operation: m.getOperation(),
            value: m.getValueAsString()
        }) !== null;
    }

    hasAdvancedItemSpecGroup(m: AdvancedSearchModel): boolean {
        return this.findAdvancedItemSpecGroup({
            dbField: m.getDBField(),
            operation: m.getOperation(),
            value: m.getValueAsString(),
            group: m.getGroupId()
        }) !== null;
    }

    hasSpecialFields() {
        let found: boolean = false;
        $.each(this.specialFields, (k, field) => {
            if (this.findAdvancedItemByField(field)) {
                found = true;
                return false;
            }
        });

        return found;
    }

    hasCritsFromSuggestion() {
        if (
            this.fromSuggestion === true
            &&
            this.getAdvanced().length > 0
            &&
            this.getSpecialFields().length > 0) {
            return true;
        }
        return false;
    }

    getTextForSpecialField() {
        const sf = this.getSpecialFields()[0]._dbField;
        let t = '';
        // ['SERIES_ID', 'CONTRIBUTOR_ID', 'SEASON_ID'];
        if (sf === 'SERIES_ID') {
            t = 'Series';
        } else if (sf === 'CONTRIBUTOR_ID') {
            t = 'Contributor';
        } else if (sf === 'SEASON_ID') {
            t = 'Seasons'
        }

        return t;
    }

    isEqual(m: SearchModel) {
        if (!m) {
            return false;
        }
        if(this.getBase() && m.getBase()) {
            if (this.getBase().getValue() !== m.getBase().getValue()) {
                return false;
            }
        }

        if(this.getAdvanced() && m.getAdvanced()) {
            if (this.getAdvanced().length !== m.getAdvanced().length) {
                return false
            }
        }

        let iseq: boolean = true;
        $.each(m.getAdvanced(), (k, adm: AdvancedSearchModel) => {
            if (!this.hasAdvancedItem(adm)) {
                iseq = false;
                return false
            }
        });

        return iseq;

    }

    findAdvancedItem(crits: {
        dbField: string,
        operation: string,
        value: string | number
    }): number {
        let index: number = null;
        $.each(this.getAdvanced(), (k, itemModel: AdvancedSearchModel) => {
            if (
                itemModel &&
                itemModel.getDBField().toUpperCase() === crits.dbField.toUpperCase() &&
                itemModel.getOperation() === crits.operation &&
                itemModel.getValueAsString() == crits.value
            ) {
                index = k + 1;
                return false;
            }
        });

        return index;
    }

    findAdvancedItemSpecGroup(crits: {
        dbField: string,
        operation: string,
        group: string | number,
        value: string | number
    }): number {
        let index: number = null;
        $.each(this.getAdvanced(), (k, itemModel: AdvancedSearchModel) => {
            if (
                itemModel &&
                itemModel.getDBField().toUpperCase() === crits.dbField.toUpperCase() &&
                itemModel.getOperation() === crits.operation &&
                itemModel.getGroupId() === crits.group &&
                itemModel.getValueAsString() == crits.value
            ) {
                index = k + 1;
                return false;
            }
        });

        return index;
    }

    findAdvancedItemByField(field: string): boolean {
        let found: boolean = null;
        $.each(this.getAdvanced(), (k, itemModel: AdvancedSearchModel) => {
            if (
                itemModel &&
                itemModel.getDBField().toUpperCase() === field.toUpperCase()
            ) {
                found = true;
                return false;
            }
        });

        return found;
    }

    removeAdvancedItemByDBField(dbfield: string): Array<AdvancedSearchModel> {
        $.each(this._advanced, (k, item: AdvancedSearchModel) => {
            if (item && item.getDBField().toUpperCase() === dbfield.toUpperCase()) {
                this._advanced.splice(k, 1);
            }
        });
        return this._advanced;
    }

    clearAdvanced() {
        // const msf = this.getSpecialFields();
        // this._advanced = msf
        this._advanced = [];
    }

    setMode(mode: AdvancedModeTypes) {
        this._mode = mode;
    }

    getMode(): AdvancedModeTypes {
        return this._mode || "builder";
    }

    /**
     * @inheritDoc
     */
    _toJSON(type: StringNameForSearchModel = 'SearchModel'): any {
        return {
            'Text': this.baseToRequest(),
            'SearchCriteria': this.advancedToRequest(type),
            'fromSuggestion': this.fromSuggestion
        };
    }

    /**
     * Prepare parameters base of search to request (like url decode may be)
     * @returns {string}
     */
    baseToRequest(): string {
        return this.getBase() ? this.getBase()._toJSON() : "";
    }

    /**
     * Prepare parametes of advacned search to request
     * @returns {Array}
     */
    advancedToRequest(type: StringNameForSearchModel): AdvancedCriteriaListTypes {
        let res = [];
        this.getAdvanced().forEach((adv: AdvancedSearchModel) => {
            if (adv.getValue() !== undefined && adv.getValue() !== '') {
                if (type && type.toLowerCase() === 'SearchModel'.toLowerCase()) {
                    res.push(adv._toJSON());
                } else {
                    res.push(adv.toSimpleRequest());
                }

            }
        });

        return res;
    }


    getModelForRestore(): AdvancedCriteriaListTypes {
        let res = [];
        this.getAdvanced().forEach((adv) => {
            if (this.specialFields.indexOf(adv.getDBField()) === -1) {
                res.push(adv.toRestore());
            }
        });

        return res;
    }

    getSpecialFields(): AdvancedSearchModel[] {
        let m: AdvancedSearchModel[] = [];
        $.each(this.getAdvanced(), (k, adv: AdvancedSearchModel) => {
            if (this.specialFields.indexOf(adv.getDBField()) !== -1) {
                m.push(adv);
                return false;
            }
        });

        return m;
    }

    /**
     * Convert search criterias to string
     * @returns {string}
     */
    toBeautyString(): string {
        if (!this._beautyString) {
            let res = '';
            if (!this.hasCritsFromSuggestion()) { // from consumer
                let base = this.getBase();
                if (base && base.getValue()) {
                    res += this.baseToBeautyString(base.getValue());
                }
            } else {
                // res += this.baseToBeautyString(base.getValue());
            }

            res += this.advancedToBeautyString(this.getAdvanced());

            // this.getSpecialFields().forEach((advModel: AdvancedSearchModel, i) => {
            //     if (advModel && advModel.getDirtyValue() && advModel.getDirtyValue().fromSuggestion) {
            //         res += advModel.getDirtyValue().fromSuggestion.title;
            //         if (i !== this.getSpecialFields().length) {
            //             res += ',';
            //         }
            //     }
            // });

            this._beautyString = res;
        }

        return this._beautyString;
    }


    /**
     * Base to beauty string
     * @param str
     * @returns {string}
     */
    baseToBeautyString(str: string): string {
        let res = '';
        if (str && str.length) {
            res += str;
        }

        return res;
    }

    /**
     * advanced to beauty string
     * @param criterias
     * @returns {string}
     */
    advancedToBeautyString(criterias): string {
        let res = '';
        if (criterias.length > 0) {
            res += ' (';
            criterias.forEach((crit) => {
                let humanVal = '';
                if (crit.dirtyValue && crit.dirtyValue.fromSuggestion && crit.dirtyValue.fromSuggestion.title) {
                    humanVal = crit.dirtyValue.fromSuggestion.title;
                } else {
                    humanVal = crit.getHumanValue() ? crit.getHumanValue() : crit.getValue();
                }
                res += ((crit.getField() || crit.getDBField()) + ' ' + crit.getOperation() + ' ' + humanVal + '; ');
            });
            res += ') ';
        }
        return res;
    }

    setBeautyString(str: string): void {
        this._beautyString = str;
    }


    /**
     * @inheritDoc
     */
    isValid(): boolean {
        return true;
    }

    createFromJSON(json, beautyString?: string): SearchModel | ConsumerSearchModel {
        // filing base model
        let baseSearchModel = new BaseSearchModel();
        if (json._base && json._base._value) {
            baseSearchModel.setValue(json._base._value || json._base._fakeValue || '');
        } else {
            baseSearchModel.setValue(json.Text || '');
        }

        this.setBase(baseSearchModel);
        this.fromSuggestion = json.fromSuggestion as boolean;
        // filling adv model
        let advModels: Array<AdvancedSearchModel> = [];
        if (!json.SearchCriteria) {
            json.SearchCriteria = json._advanced;
        }
        if (json.SearchCriteria && json.SearchCriteria.length > 0) {
            for (let j = 0; j < json.SearchCriteria.length; j++) {
                let crit: AdvancedCriteriaType = json.SearchCriteria[j];
                let advModel = new AdvancedSearchModel();
                advModel = advModel.fillByJSON(crit);
                advModels.push(advModel);
            }
            this.setAdvanced(advModels);
        }

        this.setMode(json._mode || 'builder');

        if (!this._beautyString && beautyString) {
            this._beautyString = beautyString;
        }
        return this;
    }

    getSearchMode(): string {
        if (this.getSpecialFields().length) {
            return this.getSpecialFields()[0].getDBField().replace('_ID', '').replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        } else {
            return 'Titles';
        }
    }

    isEmpty(): boolean {
        return !this.getBase().getValue() && this.getAdvanced().length === 0;
    }

    getNextAvailableGroupId() {
        let groupsIds = this._advanced.map(e => <number>e.getGroupId());

        return (groupsIds.length > 0)
            ? Math.max(...groupsIds) + 1
            : 0;
    }

    getUniqueGroupIds(): Array<string | number> {
        return Array.from(
            new Set(this._advanced.map(el => el.getGroupId()))
        );
    }


}
