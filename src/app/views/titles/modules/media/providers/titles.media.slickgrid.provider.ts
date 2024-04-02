/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridEventData} from "../../../../../modules/search/slick-grid/types";
import {appRouter} from "../../../../../constants/appRouter";
import * as Cookies from 'js-cookie';
import {TitlesComponent} from "../../../titles.component";
import {VersionsInsideTitlesComponent} from "../../versions/versions.component";
import {TitlesSlickGridProvider} from "../../../providers/titles.slick.grid.provider";
import { MediaSlickGridProvider } from '../../../../media/providers/media.slick.grid.provider';
import {Inject, Injector} from "@angular/core";

export class TitlesMediaSlickGridProvider extends MediaSlickGridProvider {
    versionId: number = null;
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }
    onRowDoubleClicked(data: SlickGridEventData) {
        if (this.config.options.type) {
            let destination = this.config.options.type.replace('inside-', '').toLowerCase();
            this.router.navigate([
                appRouter[destination].detail.substr(0, appRouter[destination].detail.lastIndexOf('/')),
                (<any>data.row).ID
            ]);
        }
    }

    updateExtendsColumnsCallback() {
        let comp: TitlesComponent = (<VersionsInsideTitlesComponent>this.config.componentContext).moduleTitleContext;
        if (!comp) {
            return;
        }
        (<TitlesSlickGridProvider>comp.versionsGridRef.slickGridComp.provider).onRowChanged();
    }

    getExportUrl() {
        return '/api/v3/version/' + this.versionId + '/media/export';
    }
}
