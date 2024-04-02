/**
 * Created by Sergey Trizna on 22.09.2017.
 */

import {SearchTypesType} from "../../../services/system.config/search.types";
import { SearchSavedProvider } from './providers/search.saved.provider';
import { SearchSavedService } from './services/search.saved.service';

export class SearchSavedSettings {
    /**
     * Service for working module
     */
    service?: SearchSavedService;

    /**
     * Provider for working with module
     */
    provider?: SearchSavedProvider;

    /**
     * String of type for rest requests
     * @type {any}
     */
    type?: SearchTypesType;
}

export class SearchSavedConfig {
    /**
     * Context of top component
     */
    public componentContext: any;

    /**
     * Context of module
     */
    public moduleContext?: any;

    /**
     * Model of settings
     * @type {{}}
     */
    public options: SearchSavedSettings = {};
}
