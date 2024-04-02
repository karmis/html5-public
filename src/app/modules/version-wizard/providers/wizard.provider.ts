import {Injectable} from "@angular/core";
import {VersionWizardComponent} from "../wizard";
import {IMFXSearchComponent} from "../../../modules/search/search.component";
import {AdvancedCriteriaListTypes, AdvancedCriteriaType} from "../../../modules/search/advanced/types";
import {SearchModel} from "../../../models/search/common/search";
import {SlickGridProvider} from "../../../modules/search/slick-grid/providers/slick.grid.provider";

export type VersionMediaTypesWizard = {
    Audio: number,
    Video: number,
    Usage?: number | string,
    MediaFormat?: number | string
}

@Injectable()
export class VersionWizardProvider {
    // ref to module
    moduleContext: VersionWizardComponent;

    // ref to component
    componentContext: IMFXSearchComponent;

    // current state of modal
    public modalIsOpen: boolean = false;

    // request
    public selectedVersionId: number;
    public sgp: SlickGridProvider;
    // media types
    private constMediaTypes: VersionMediaTypesWizard = {
        Audio: 150,
        Video: 100,
    };
    private rows: Array<any> = [];
    // models
    private models: AdvancedCriteriaListTypes = [
        {
            "Field": 'Media Type',
            "DBField": 'MEDIA_TYPE_text',
            "Operation": '=',
            "Value": "",
            "GroupId": 0,
        },
        {
            "Field": 'Usage',
            "DBField": 'USAGE_TYPE_text',
            "Operation": '=',
            "Value": "",
            "GroupId": 0,
        },
        {
            "Field": 'Digital Media Format',
            "DBField": 'MEDIA_FORMAT_text',
            "Operation": '=',
            "Value": "",
            "GroupId": 0,
        },
        {
            "Field": '',
            "DBField": 'PGM_PARENT_ID',
            "Operation": '=',
            "Value": "",
            "GroupId": 0,
        },
        {
            "Field": "Storage Device",
            "DBField": 'STORAGE_ID',
            "Operation": '=',
            "Value": "",
            "GroupId": 0,
        }
    ];

    /**
     * Show modal
     */
    showModal(versionId: number) {
        this.modalIsOpen = true;
        this.selectedVersionId = versionId;
        this.updateModel('PGM_PARENT_ID', versionId);
    }

    /**
     * Update model by field
     * @param field
     * @param value
     */
    updateModel(field, value): void {
        $.each(this.models, (k: number, model: AdvancedCriteriaType) => {
            if (model.DBField == field) {
                this.models[k].Value = value;
                return false;
            }
        });
    }

    /**
     * Get model by field
     * @param field
     * @returns {AdvancedCriteriaType}
     */
    getModel(field): AdvancedCriteriaType {
        let res: AdvancedCriteriaType;
        $.each(this.models, (k: number, model: AdvancedCriteriaType) => {
            if (model.DBField == field) {
                res = model;
                return false;
            }
        });

        return res;
    }

    /**
     * Get available media types
     * @returns {VersionMediaTypesWizard}
     */
    getMediaTypes(): VersionMediaTypesWizard {
        return this.constMediaTypes;
    }

    getSearchModel(): SearchModel {
        let sm: SearchModel = new SearchModel();
        let json = this.prepareModels();
        sm = sm.createFromJSON(json);

        return sm;
    }

    getRows(): Array<any> {
        return this.moduleContext.getRows();
    }

    private prepareModels(): Object {
        let advOpts = [];
        $.each(this.models, (k, json) => {
            if (json.Value !== undefined && json.Value != "") {
                advOpts.push(json)
            }
        });

        return {
            'SearchCriteria': advOpts
        };
    }

}
