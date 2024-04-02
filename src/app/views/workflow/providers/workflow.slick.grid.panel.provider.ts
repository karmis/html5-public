/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import {SlickGridPanelProvider} from "../../../modules/search/slick-grid/comps/panels/providers/panels.slick.grid.provider";

export class WorkflowSlickGridPanelProvider extends SlickGridPanelProvider {
    isShowAdditionalTopPanel(): boolean {
        return false;
        // let res = false;
        // if(this.slickGridProvider.getSelectedRowsIds().length > 1){
        //     res = true;
        // }
        //
        // return res;
    }
}