import {ApplicationRef, ComponentFactoryResolver, EventEmitter, Inject, Injectable, Injector} from "@angular/core";
import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridEventData, SlickGridRowData} from "../../../../../modules/search/slick-grid/types";
import {WorkflowDecisionMediaSlickGridProvider} from "./wf.decision.media.slick.grid.provider";
import {Router} from "@angular/router";
import {BasketService} from "../../../../../services/basket/basket.service";
export type ItemDecisionDictionaryType = {
    [key:number]: number
}
@Injectable()
export class WorkflowDecisionOptionsSlickGridProvider extends SlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }
    public mediaGridProvider: WorkflowDecisionMediaSlickGridProvider;
    onSelectDecision: EventEmitter<ItemDecisionDictionaryType> = new EventEmitter<ItemDecisionDictionaryType>();
    onRowDoubleClicked(data: SlickGridEventData) {
        if(!this.mediaGridProvider) {
            return;
        }
        let mediaData = this.mediaGridProvider.getData();
        mediaData[this.mediaGridProvider.getSelectedRowId()]['Decision'] = (<any>data.row).OptionName;
        this.mediaGridProvider.setData(mediaData,true);
        this.onSelectDecision.emit({[mediaData[this.mediaGridProvider.getSelectedRowId()].ID]: (<any>data.row).Index})
    }
}
