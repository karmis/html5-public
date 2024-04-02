/**
 * Created by initr on 27.12.2016.
 */
import * as $ from 'jquery';
import {Component, ViewEncapsulation, Input} from '@angular/core';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';
import {LocalStorageService} from "ngx-webstorage";
import {DebounceProvider} from '../../providers/common/debounce.provider';
import {ConfigService} from '../../services/config/config.service';
// import any = jasmine.any;
@Component({
    selector: 'imfx-language-switcher',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class LanguageSwitcherComponent {
    @Input('asLink') public asLink;
    additionalLangs: any;
    deflang: any;
    constructor(private translate: TranslateService,
                private storage: LocalStorageService,
                private debounceProvider: DebounceProvider) {
        let _this = this;
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            _this.storage.store('base.settings.lang', event.lang);
        });
        this.additionalLangs = ConfigService.getAdditionalLangs();
        this.setDefault();
    }

    public setDefault() {
        this.deflang = ConfigService.getDefaultLang();

        // Trying get default language from browser;
        // let navigator: any = <any>window.navigator;
        // let browserLang: string = navigator.language || navigator.browserLanguage;
        let browserLang: string = this.translate.getBrowserCultureLang();

        // Retrieve language from storage or use default browser language
        let storedLang = this.storage.retrieve('base.settings.lang') || browserLang;
        // store lang if it'i not stored
        if (this.storage.retrieve('base.settings.lang') == null) {
            this.storage.store('base.settings.lang', browserLang);
        }
        if (this.additionalLangs.indexOf(storedLang) == -1) {
            let res = this.additionalLangs.find(el => el.indexOf(browserLang) > -1);
            if (res) {
                storedLang = res;
            } else {
                storedLang = this.deflang;
            }
        }



        // use language
        this.translate.use(storedLang);

        // set defaults langs;
        this.translate.setDefaultLang(this.deflang);


        // this.debounceProvider.debounce(function () {
        //   // Trying get default language from browser;
        //   let navigator: any = <any>window.navigator;
        //   let browserLang: string = navigator.language || navigator.browserLanguage;
        //
        //   // Retrieve language from storage or use default browser language
        //   let storedLang = self.storage.retrieve('base.settings.lang') || browserLang;
        //   if (self.additionalLangs.indexOf(storedLang) == -1) {
        //     storedLang = self.deflang;
        //   }
        //
        //   // use language
        //   self.translate.use(storedLang);
        //
        //   // set defaults langs;
        //   self.translate.setDefaultLang(self.deflang);
        // }, 0, false)();
    }

    private setLang(lang) {
        //event.preventDefault();
        this.translate.use(lang);
        this.storage.store('base.settings.lang', lang);

        // set defaults langs;
        this.translate.setDefaultLang(this.deflang);
        return false;
    }
}


// export class LanguageSwitcherComponent {
//   @Input('asLink') public asLink;
//
//   constructor(private translate: TranslateService,
//               private storage: LocalStorageService,
//               private debounceProvider: DebounceProvider) {
//     let _this = this;
//     this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
//       _this.storage.store('base.settings.lang', event.lang);
//     });
//
//     this.setDefault();
//   }
//
//   public setDefault() {
//     let self = this;
//     this.translate.getTranslation(ConfigService.getDefaultLang()).subscribe((defaultLangObj) => {
//       this.translate.setTranslation(ConfigService.getDefaultLang(), defaultLangObj, false);
//       ConfigService.getAdditionalLangs().forEach((v) => {
//         this.translate.getTranslation(v).subscribe((obj) => {
//           this.translate
//           let temp = {};
//           $.extend(true, temp, defaultLangObj, obj);
//           self.translate.setTranslation(v, temp, true);
//           this.debounceProvider.debounce(function () {
//             // Trying get default language from browser;
//             let navigator: any = <any>window.navigator;
//             let browserLang: string = navigator.language || navigator.browserLanguage;
//
//             // Retrieve language from storage or use default browser language
//             let storedLang = self.storage.retrieve('base.settings.lang') || browserLang;
//             if (self..indexOf(storedLang) == -1) {
//               storedLang = ConfigService.getDefaultLang();
//             }
//
//             // use language
//             self.translate.use(storedLang);
//
//             // set defaults langs;
//             self.translate.setDefaultLang(ConfigService.getDefaultLang());
//           }, 100, false)();
//         });
//       });
//     });
//   }
//
//   private setLang(lang) {
//     event.preventDefault();
//     this.translate.use(lang)
//   }
// }
