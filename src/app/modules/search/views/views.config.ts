/**
 * Created by Sergey Trizna on 04.03.2017.
 */
import {ModuleWithProviders} from '@angular/core';
import {ViewsService, ViewsServiceInterface} from './services/views.service';
import {ViewsProvider} from './providers/views.provider';
import {ViewType} from "./types";

export class ViewsSettings {
    /**
     * Service for working with views
     */
    service?: ViewsService;

    /**
     * Provider for working with views
     */
    provider?: ViewsProvider;

    /**
     * String of type for rest requests
     * @type {any}
     */
    type?: string = null;

    /**
    //  * List of views
    //  * @type {Array}
    //  */
    // views?: Array<ViewType> = [];
    //
    // /**
    //  * Current view
    //  * @type {{}}
    //  */
    // view?: ViewType = null;
    // /**
    //  * Default view
    //  * @type {{}}
    //  */
    // defaultView?: ViewType = null;
    //
    // error?: Object = null;
    //
    // newName?: string;
}

export class ViewsConfig {
    /**
     * Context of top component
     */
    public componentContext: any;
    /**
     * Context of module
     */
    public moduleContext?: any;

    /**
     * Model of Views settings
     * @type {{}}
     */
    public options: ViewsSettings = {};
}
