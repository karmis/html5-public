/**
 * Created by Sergey Trizna on 15.03.2017.
 */
import {SearchRecentServiceInterface} from './services/search.recent.service';
import {SearchRecentProviderInterface} from "./providers/search.recent.provider.interface";
import {RecentModel} from "./models/recent";

export class SearchRecentSettings {
    /**
     * Service for working module
     */
    service?: SearchRecentServiceInterface;

    /**
     * Provider for working with module
     */
    provider?: SearchRecentProviderInterface;

    /**
     * Prefix for local storage
     */
    viewType?: string;

    /**
     * Prefix for local storage
     */
    itemsLimit?: number;

    /**
     * Array of previous recent searches
     */
    recentSearches?:RecentModel[]
}

export class SearchRecentConfig {
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
    public options: SearchRecentSettings = {};
}
