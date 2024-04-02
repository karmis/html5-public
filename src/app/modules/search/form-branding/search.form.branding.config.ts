/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {EventEmitter} from '@angular/core';
import {SearchFormServiceInterface} from './services/search.form.branding.service';
import {AppSettingsInterface} from '../../common/app.settings/app.settings.interface';
import {SearchFormBrandingComponent} from "./search.form.branding";
import { SearchFormBrandingProvider } from './providers/search.form.branding.provider';

export class SearchFormSettings {
    /**
     * Service for working with views
     */
    service?: SearchFormServiceInterface;

    /**
     * Provider for working with views
     */
    provider?: SearchFormBrandingProvider;

    /**
     * Mode for suggestion search
     * @type {any}
     */
    currentMode?: string = null;

    /**
     * ???
     */
    arraysOfResults?: Array<string>;

    /**
     * Min length of search string for search
     */
    minLength?: number;

    /**
     * Search line
     */
    searchString?: string;

    /**
     * App constants
     */
    appSettings: AppSettingsInterface;

    /**
     * Search button always  enabled
     */
    searchButtonAlwaysEnabled?: boolean;

    /**
     * Do search on startup
     */
    doSearchOnStartup?: boolean;

    /**
     * Enabled search button
     */
    enabledSearchButton?: boolean;
    /**
    * outside search string in the consumer search
    */
    outsideSearchString?: string;
    /**
    * outside criteria in the consumer search
    */
    outsideCriteria?: any;
    /**
    * EventEmitter for the consumer search
    */
    selectedFilters?: EventEmitter<any>;
    /**
    * EventEmitter for the consumer search
    */
    onSearch?: EventEmitter<any>;
    /**
     * EventEmitter for the title search
     */
    onSubmitEmitter?: EventEmitter<any>;

    /**
     * Is busy now for request
     */
    isBusy?: boolean;

    /**
     * Available search's tags
     */
    forbiddenTags?: string[];
    /**
     * Search type for suggestion request
     */
    searchType?: string;
}

export class SearchFormBrandingConfig {
    /**
     * Context of top component
     */
    public componentContext: any;

    /**
     * Context of module
     */
    public moduleContext?: SearchFormBrandingComponent;

    /**
     * Model of Views settings
     * @type {{}}
     */
    public options: SearchFormSettings = {
        appSettings: <AppSettingsInterface> null,
        currentMode: null,
        arraysOfResults: [],
        minLength: 3,
        searchString: '',
        searchButtonAlwaysEnabled: false,
        enabledSearchButton: false,
        doSearchOnStartup: false,
        forbiddenTags: [],
        searchType: 'Version'
    };
}
