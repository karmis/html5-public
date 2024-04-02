import {Injectable} from '@angular/core';

@Injectable()
export class ConfigService {

    static getAppVersion(): string {
        return (<any>window).IMFX_VERSION;
    }

    static getAppApiUrl(): string {
        return (<any>window).IMFX_API_URL;
        // return 'https://delivery.yleisradio.fi'
        //return 'http://192.168.90.39:889'
        // return 'http://craigm.mynetgear.com:81'
    }

    static getSetupsForRoutes() {
        return {
            "logout": "logout",
            "login": "login",
            "loginauto": "login?auto",
            "main": "search",
            "noAccess": "no-access"
        }
    }

    /**
     * Default language for app; the defaulLang property must be fully filed
     */
    static getDefaultLang() {
        return 'en-GB';
    }

    /**
     * Additional languages
     */
    static getAdditionalLangs() {
        return ["en-GB", "en-US", "en-AU", "hr-CRO", "ru-RU"];
    }
}
