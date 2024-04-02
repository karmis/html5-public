/**
 * Created by Sergey Klimenko on 08.03.2017.
 */
import {SearchColumnsServiceInterface} from './services/search.columns.service';
import {SearchColumnsProvider} from './providers/search.columns.provider';

export class SearchColumnsSettings {
    /**
     * Service for working moduke
     */
    service?: SearchColumnsServiceInterface;

    /**
     * Provider for working with module
     */
    provider?: SearchColumnsProvider;
}

export class SearchColumnsConfig {
    /**
     * Context of top component
     */
    public componentContext: any;

    /**
     * Model of settings
     * @type {{}}
     */
    public options: SearchColumnsSettings = {};
    public searchText?: String;
}
