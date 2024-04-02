/**
 * Created by Sergey Trizna on 09.03.2018.
 */
import {SearchSettingsProvider} from "../../../../../modules/search/settings/providers/search.settings.provider";
import {Injectable, Injector} from "@angular/core";
import {IMFXModalProvider} from "../../../../../modules/imfx-modal/proivders/provider";

@Injectable()
export class MediaSearchSettingsProvider extends SearchSettingsProvider {
    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider) {
        super(injector, modalProvider);
    }

}
