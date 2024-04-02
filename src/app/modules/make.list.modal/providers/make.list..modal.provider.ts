import { Injectable } from '@angular/core';
import { IMFXSearchComponent } from '../../search/search.component';
import { SearchModel } from '../../../models/search/common/search';
import { AdvancedCriteriaListTypes, AdvancedCriteriaType } from '../../search/advanced/types';
import { MakeListModalComponent } from "../make.list.modal.component";

export type MediaTypesWizard = {
    Audio: number,
    Video: number,
    Usage?: number | string,
    MediaFormat?: number | string
}

@Injectable()
export class MakeListModalProvider {
    // ref to module
    moduleContext: MakeListModalComponent;

    // ref to component
    componentContext: IMFXSearchComponent;

    // // reference to modalComponent
    // public wizardModal: ModalComponent;

    // current state of modal
    public modalIsOpen: boolean = false;

    // media types
    private constMediaTypes: MediaTypesWizard = {
        Audio: 150,
        Video: 100,
    };

    private rows: Array<any> = [];

    // models
    public models: AdvancedCriteriaListTypes = [
        {
            "Field": 'Media Type',
            "DBField": 'MEDIA_TYPE',
            "Operation": '=',
            "Value": this.constMediaTypes.Audio,
            "GroupId": 0
        },
        {
            "Field": 'Media Type',
            "DBField": 'MEDIA_TYPE',
            "Operation": '=',
            "Value": this.constMediaTypes.Video,
            "GroupId": 1
        }
    ];

    /**
     * Show modal
     */
    showModal() {
        this.modalIsOpen = true
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
        console.log(this.models);
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
    getMediaTypes(): MediaTypesWizard {
        return this.constMediaTypes;
    }

    getSearchModel(): SearchModel {
        let sm: SearchModel = new SearchModel();
        let json = this.prepareModels();
        sm = sm.createFromJSON(json);

        return sm;
    }

    setRows(resp) {
        this.rows = resp;
    }

    getRows(): Array<any> {
        return this.rows;
    }

    public prepareModels(): Object {
        let advOpts = [];
        $.each(this.models, (k, json) => {
            if (json.Value !== undefined && json.Value != "") {
                advOpts.push(json);
            }
        });

        return {
            'SearchCriteria': advOpts
        };
    }

}
