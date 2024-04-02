import {Injectable} from "@angular/core";
import {GoldenProvider} from "../../../../modules/search/detail/providers/gl.provider";

@Injectable()
export class VersionGoldenProvider extends GoldenProvider {
    public setView(self, outsideUpdate) {
        self.config.options.params.addMedia = false;
        this.addDataLayout(self);
        if (outsideUpdate) {
            this.addMediaBlockIfNeed(self.layout);
            self.addMediaLayout(self, outsideUpdate);
        } else {
            self.addMediaLayout(self);
        }
        if (outsideUpdate) {
            self.addTabsLayout(self, outsideUpdate);
        } else {
            self.addTabsLayout(self);
        }
    }
}
