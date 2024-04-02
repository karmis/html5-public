/**
 * Created by Sergey Trizna on 27.11.2017.
 */
import {CoreConfig, CoreConfigOptions, CoreProviderConfig} from "./core.config";
import {Injector, Input} from "@angular/core";
import {ReplaySubject} from "rxjs";

export class CoreComp {
    // config
    protected readonly setups: CoreConfig;

    private _isModuleReady: boolean = false;
    public get isModuleReady(): boolean {
        return this._isModuleReady
    }
    public onModuleReady:ReplaySubject<boolean> = new ReplaySubject();
    @Input('config') set config(_config: CoreConfig) {
        // config for component
        let compConfig: CoreConfig = $.extend(true, {}, this.setups, _config);
        compConfig.options = <CoreConfigOptions>$.extend(true, {}, this.setups.options, _config.options);
        compConfig.options.parentConfig = compConfig;
        // provider
        if (_config.providerType) {
            compConfig.provider = this.injector.get(_config.providerType);
        }

        // service
        if (_config.serviceType) {
            compConfig.service = this.injector.get(_config.serviceType);
        }

        if (_config.appSettingsType) {
            compConfig.appSettings = this.injector.get(_config.appSettingsType);
        }

        if (compConfig.options.module) {
            compConfig.options.module.parentConfig = compConfig;
        }

        if (compConfig.options.plugin) {
            compConfig.options.plugin.parentConfig = compConfig;
        }


        // moduleContext
        compConfig.moduleContext = this;


        // set config for provider
        if (compConfig.provider) {
            compConfig.provider.config = <CoreProviderConfig>{
                moduleContext: compConfig.moduleContext,
                componentContext: compConfig.componentContext,
                service: compConfig.service,
                options: compConfig.options,
                appSettings: compConfig.appSettings
            };
        }

        // magic
        Object.defineProperty(this, 'config', {
            get: (): typeof compConfig => {
                return compConfig
            },
        });

        Object.defineProperty(this, 'componentContext', {
            get: (): typeof compConfig.componentContext => {
                return compConfig.componentContext
            },
        });

        Object.defineProperty(this, 'provider', {
            get: (): typeof compConfig.provider => {
                return compConfig.provider
            },
        });
        //
        Object.defineProperty(this, 'service', {
            get: (): typeof compConfig.service => {
                return compConfig.service
            },
        });

        Object.defineProperty(this, 'appSettings', {
            get: (): typeof compConfig.appSettings => {
                return compConfig.appSettings
            },
        });

        // TODO remove it.
        // see src/app/modules/search/slick-grid/slick-grid.ts:245
        // this.onModuleReady.subscribe(() => {
        new Promise((r) => {
            r();
        }).then(() => {
            this._isModuleReady = true;
            this.onModuleReady.next(true);
        });
    }

    constructor(protected injector: Injector) {
    }
}
