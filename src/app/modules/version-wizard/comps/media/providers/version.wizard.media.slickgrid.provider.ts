import {MediaSlickGridProvider} from "../../../../../views/media/providers/media.slick.grid.provider";
import {Injectable} from "@angular/core";
import * as Cookies from 'js-cookie';
import { SlickGridEventData } from '../../../../search/slick-grid/types';
import { appRouter } from '../../../../../constants/appRouter';

@Injectable()
export class VersionWizardMediaSlickGridProvider extends MediaSlickGridProvider {
    onRowDoubleClicked(data: SlickGridEventData) {
        return;
    }

}
