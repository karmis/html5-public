/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {SearchThumbsConfig, SearchThumbsConfigModuleSetups, SearchThumbsConfigOptions} from "../search.thumbs.config";
import {DetailThumbProvider} from "../../detail/providers/detail.thumb.provider";

// ConfigService.getAppApiUrl();
// import {Observable, Subscription} from 'rxjs';

// export interface SearchThumbsProviderInterface {
//     config: SearchThumbsConfig;
//
//     buildToRows(rows: Array<any>): void;
// }

export class SearchThumbsProvider extends DetailThumbProvider {
    config: SearchThumbsConfig;

    get module(): SearchThumbsConfigModuleSetups {
        return this.config.options.module
    }

    get options(): SearchThumbsConfigOptions {
        return this.config.options
    }

    /**
     * Add thumbs to rows of table
     * @param rows
     */
    buildToRows(rows: Array<any>): void {
        if (!rows || rows.length == 0) {
            return;
        }
        rows.forEach((el) => {
            el = this.buildURL(el, this.config.appSettings, this.module.defaultThumb);
        });
    }
}
