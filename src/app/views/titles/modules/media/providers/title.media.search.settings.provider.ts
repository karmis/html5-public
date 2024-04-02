import { SearchSettingsProvider } from '../../../../../modules/search/settings/providers/search.settings.provider';
import {Injectable, Injector} from '@angular/core';
import {IMFXModalProvider} from "../../../../../modules/imfx-modal/proivders/provider";
@Injectable()
export class TitlesMediaSearchSettingsProvider extends SearchSettingsProvider{
    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider) {
        super(injector, modalProvider)
    }

}
