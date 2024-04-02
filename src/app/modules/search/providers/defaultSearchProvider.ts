import {Injectable} from "@angular/core";
import {SearchModel} from "../../../models/search/common/search";
import {ConsumerSearchModel} from "../../../models/search/common/consumer.search";
import {ConsumerSearchType} from "../../../views/consumer/consumer.search.component";

@Injectable()
export class DefaultSearchProvider {

    private defaultSearchParams: {
        searchString: string;
        searchCriteria: any;
    };

    private searchFormModel: SearchModel;
    private cst: ConsumerSearchType;
    private fakeSearchString: string;

    constructor() {
    }

    public setConsumerSearchType(cst: ConsumerSearchType) {
        this.cst = cst;
    }

    public getConsumerSearchType(): ConsumerSearchType {
        return this.cst;
    }

    getDefaultSearchModel() {
        return this.searchFormModel;
    }

    setDefaultSearchModel(sfm: SearchModel) {
        this.searchFormModel = sfm;
    }

    setSearchFormModel(sfm: SearchModel) {
        this.searchFormModel = sfm;
    }







    public setDefaultSearchParams(ds) {
        this.defaultSearchParams = ds;
    }

    public getDefaultSearchParams() {
        return this.defaultSearchParams;
    }

    public clearDefaultSearchParams() {
        this.defaultSearchParams = null;
    }

    public clearDefaultSearchModel() {
        this.searchFormModel = null;
    }

    public setFakeSearchString(str: string) {
        this.fakeSearchString = str;
    }

    public clearFakeSearchString() {
        this.fakeSearchString = null;
    }

    public getFakeSearchString(): string {
        return this.fakeSearchString;
    }
}
