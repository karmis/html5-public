import {CoreService} from "./core.service";
import {CoreProvider} from "./core.provider";
import {CoreComp} from "./core.comp";
import {AppSettings} from "../modules/common/app.settings/app.settings";


export class CoreProviderConfig {
    componentContext: CoreComp|any
    moduleContext?: CoreComp;
    service?: CoreService;
    serviceType?: typeof CoreService;
    options?: CoreConfigOptions;
    appSettingsType?: typeof AppSettings;
    appSettings?: AppSettings;

    constructor(c: CoreConfig) {
        this.componentContext = c.componentContext;
        this.moduleContext = c.moduleContext;
        this.serviceType = c.serviceType;
        this.service = c.service;
        this.options = c.options;
        this.appSettingsType = c.appSettingsType
        this.appSettings = c.appSettings
    }
}

export class CoreConfig extends CoreProviderConfig {
    providerType?: typeof CoreProvider;
    provider?: CoreProvider;
    appSettingsType?: typeof AppSettings;
    appSettings?: AppSettings;

    constructor(c: CoreConfig) {
        super(c);
        this.providerType = c.providerType;
        this.provider = c.provider;
        this.appSettingsType = c.appSettingsType;
        this.appSettings = c.appSettings
    }
}


export class CoreConfigOptions {
    plugin?: CoreConfigPluginOptions;
    module?: CoreConfigModuleOptions;
    parentConfig?: CoreConfig;

    constructor(c: CoreConfigOptions) {
        this.plugin = c.plugin;
        this.module = c.module;
    }
}


export class CoreConfigPluginOptions {
    parentConfig?: CoreConfig
}

export class CoreConfigModuleOptions {
    parentConfig?: CoreConfig
}
