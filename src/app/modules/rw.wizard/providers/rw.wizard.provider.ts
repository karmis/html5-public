import { Injectable } from "@angular/core";
import { RaiseWorkflowWizzardComponent } from "../../rw.wizard/rw.wizard";
import { MediaClip } from "../../../views/clip-editor/rce.component";

@Injectable()
export class RaiseWorkflowWizzardProvider {
    // ref to module
    public moduleContext: RaiseWorkflowWizzardComponent;
    private workflowParams: any;

    /**
     * On open modal
     */
    open(itemId, itemType, clips?: Array<MediaClip>, extraData = null) {
        // this.workflowParams = {
        //     'itemId': item.ID,
        //     'itemType': itemType,
        //     'itemTitle': item.TITLE,
        //     'clips': clips
        // };
        if (!Array.isArray(itemId)) {
            this.workflowParams = {
                'ID': itemId,
                'basket_item_type': itemType,
                'clips': clips
            };
        } else {
            this.workflowParams = itemId.map(id => ({
                ID: id,
                basket_item_type: itemType,
                clips: clips})
            )
        }

        let wizardComponent: RaiseWorkflowWizzardComponent = this.moduleContext;
        wizardComponent.init(this.workflowParams, extraData);
    }

    openFromStep(items, extraData) {
        let wizardComponent: RaiseWorkflowWizzardComponent = this.moduleContext;
        // wizardComponent.initFromStep(items, extraData);
        wizardComponent.init(items, extraData);
    }

    // openFinal(extraData) {
    //     let wizardComponent: RaiseWorkflowWizzardComponent = this.moduleContext;
    //     wizardComponent.initFinal(extraData);
    // }
}
