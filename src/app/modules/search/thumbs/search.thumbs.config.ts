import {
    CoreConfig,
    CoreConfigModuleOptions,
    CoreConfigOptions
} from "../../../core/core.config";
import {SearchThumbsProvider} from "./providers/search.thumbs.provider";

import {AppSettings} from "../../common/app.settings/app.settings";


export class SearchThumbsConfig extends CoreConfig {
    providerType?: typeof SearchThumbsProvider;
    provider?: SearchThumbsProvider;
    appSettingsType?: typeof AppSettings;
    appSettings?: AppSettings;
    options?: SearchThumbsConfigOptions;
    constructor(c: SearchThumbsConfig) {
        super(c);
    }
}

export class SearchThumbsConfigOptions extends CoreConfigOptions {
    module?: SearchThumbsConfigModuleSetups;

    constructor(c: SearchThumbsConfigOptions) {
        super(c);
    }

    get appSettings(): AppSettings {
        if (this.parentConfig) {
            return this.parentConfig.appSettings;
        }
    }

    get provider(): SearchThumbsProvider {
        if(this.parentConfig){
            return (<SearchThumbsConfig>this.parentConfig).provider
        }
    }
}

export class SearchThumbsConfigModuleSetups extends CoreConfigModuleOptions {
    constructor() {
        super();
    }
    enabled?: boolean;
    defaultThumb?: string;
}

