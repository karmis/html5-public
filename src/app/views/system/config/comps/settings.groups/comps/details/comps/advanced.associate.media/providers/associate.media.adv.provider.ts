import { SearchAdvancedProvider } from '../../../../../../../../../../modules/search/advanced/providers/search.advanced.provider';
import { Injectable } from '@angular/core';

@Injectable()
export class AssociateMediaAdvSetupProvider extends SearchAdvancedProvider {
    updateStateForSearchButton() {
        // if (this.isValidStructureFlag.builder == true) {
        //     this.config.componentContext.refreshData();
        // }
    }

    sendSubmit() {
        // if (this.isValidStructureFlag.builder == true) {
        //     this.config.componentContext.refreshData();
        // }
    }
}
