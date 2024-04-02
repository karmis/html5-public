/**
 * Created by Sergey Trizna on 27.11.2017.
 */

import {CoreService} from "./core.service";
import {CoreComp} from "./core.comp";
import {Injectable, Injector} from "@angular/core";
import {CoreProviderConfig} from "./core.config";

@Injectable()
export class CoreProvider {
    // default config
    public _config: CoreProviderConfig = {
        moduleContext: <CoreComp>null,
        componentContext: <CoreComp>null,
    };
    protected _service: CoreService;

    constructor(protected injector?: Injector){
    }

    // config
    get config(): CoreProviderConfig {
        return this._config;
    }

    set config(_config: CoreProviderConfig) {
        this._config = _config;
    }

    // service
    get service(): CoreService {
        return this._service;
    }

    set service(_service: CoreService) {
        this._service = _service;
    }

    // module context
    get moduleContext(): CoreComp {
        return this.config.moduleContext;
    }
}
