import {Injectable} from "@angular/core";
import {MediaSlickGridProvider} from "../../../../../views/media/providers/media.slick.grid.provider";
import {SlickGridEventData} from "../../../../search/slick-grid/types";
import {IMFXListOfSameFilesComponent} from "../comp";

@Injectable()
export class MediaSameFilesSlickGridProvider extends MediaSlickGridProvider {
    onRowDoubleClicked(data: SlickGridEventData) {
        (this.config.componentContext as IMFXListOfSameFilesComponent).modalRef.hide();
        (this.config.componentContext as IMFXListOfSameFilesComponent).uploadProvider.moduleContext.modalRef.hide();
        super.onRowDoubleClicked(data);
    }

}
