import { Injectable } from "@angular/core";
import { CustomLabels } from "../system.config/search.types";
import { SessionStorageService } from "ngx-webstorage";

@Injectable({
    providedIn: "root"
})
export class UtilitiesService {
    constructor(
        private sessionStorage: SessionStorageService
    ) {
    }

    customLabels(array, field) {
        const customLabels = this.getCustomLabels();
        // debugger
        return array.map(el => {
            if (typeof el[field] === 'string' && customLabels[el[field].toLowerCase()]) {
                el[field] = customLabels[el[field].toLowerCase()];
            }
            return el;
        });
    }

    getCustomLabels(): CustomLabels {
        const customLabels: CustomLabels = {
            comments: 'Comments',
            legal: 'Legal',
            cuts: 'Cuts'
        }

        const storDef = this.sessionStorage.retrieve('settings.group.0');
        const storUser = this.sessionStorage.retrieve('config.user.group.preferences.customLabels');

        let defaultCustomLabels: CustomLabels = customLabels;
        let userCustomLabels: CustomLabels =  customLabels;

        if (storDef) {
            const data = storDef.TM_SETTINGS_KEYS.find(el => el.KEY === 'customLabels')
            if (data) {
                defaultCustomLabels = JSON.parse(data.DATA).CustomLabels;
                if (defaultCustomLabels.cuts === null || defaultCustomLabels.cuts.length === 0) {
                    defaultCustomLabels.cuts = customLabels.cuts
                }
                if (defaultCustomLabels.legal === null || defaultCustomLabels.legal.length === 0) {
                    defaultCustomLabels.legal = customLabels.legal
                }
                if (defaultCustomLabels.comments === null || defaultCustomLabels.comments.length === 0) {
                    defaultCustomLabels.comments = customLabels.comments
                }
            }
        }
        if (storUser) {
            userCustomLabels =  JSON.parse(storUser).CustomLabels;
            if (userCustomLabels === undefined) {
                userCustomLabels = customLabels;
            }
        }
        return {
            legal: userCustomLabels.legal ? userCustomLabels.legal : defaultCustomLabels.legal,
            comments: userCustomLabels.comments ? userCustomLabels.comments : defaultCustomLabels.comments,
            cuts: userCustomLabels.cuts ? userCustomLabels.cuts : defaultCustomLabels.cuts,
        }
    }
}
