import { MediaSlickGridProvider } from '../../../../../views/media/providers/media.slick.grid.provider';
import { Inject, Injectable, Injector } from '@angular/core';
import { SearchModel } from '../../../../../models/search/common/search';
import { ClipEditorService } from '../../../../../services/clip.editor/clip.editor.service';
import { SlickGridEventData } from '../../../../search/slick-grid/types';
import { AdvancedCriteriaType } from '../../../../search/advanced/types';

@Injectable()
export class ItemTableSlickGridProvider extends MediaSlickGridProvider {

    public ceService;
    public filterText: string = "";
    public models: any;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.ceService = this.injector.get(ClipEditorService);
        this.onDataUpdated.subscribe((data:SlickGridEventData) => {
            this.ceService.prepareItemToMediaList(data.row);
        })
    }
    enterPress($event) {
        if ($event.which == 13) {
            this.filterRequest();
        }
    }

    filterRequest() {
        if(this.filterText.trim().length > 0) {
            let models = this.prepareModels();
            let sm: SearchModel = new SearchModel();
            sm = sm.createFromJSON(models);
            this.buildPage(sm);
        }
    }

    updateModel(field, value): void {
        $.each(this.models, (k: number, model: AdvancedCriteriaType) => {
            if (model.DBField == field) {
                this.models[k].Value = value;
            }
        });
    }

    prepareModels(): Object {
        let advOpts = [];
        $.each(this.models, (k, json) => {
            if (json.Value !== undefined && json.Value != "") {
                advOpts.push(json)
            }
        });

        return {
            'SearchCriteria': advOpts,
            'Text': this.filterText.trim()
        };
    }

    /**
     * On double click by row
     * @param $event
     */
    onRowDoubleClicked($event): any {
        return false;
    }

    onRowMousedown(data:SlickGridEventData): any {
        this.ceService.prepareItemToMediaList(data.row);
    }
}
