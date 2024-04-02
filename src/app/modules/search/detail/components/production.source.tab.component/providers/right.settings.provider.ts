import { Injectable, Injector } from "@angular/core";
import { SearchSettingsProvider } from '../../../../settings/providers/search.settings.provider';
import { ViewsProvider } from '../../../../views/providers/views.provider';
import { IMFXModalProvider } from '../../../../../imfx-modal/proivders/provider';

@Injectable()
export class RightSettingsProvider extends SearchSettingsProvider{
    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider) {
        super(injector, modalProvider);
    }

    public setupColumns() {
        let viewsProvider = this.injector.get(ViewsProvider);
        viewsProvider.setupColumns();
    }
}
