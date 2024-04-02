import {Injectable} from "@angular/core";
import {GoldenProvider} from "../../../../modules/search/detail/providers/gl.provider";

@Injectable()
export class MediaGoldenProvider extends GoldenProvider {
    // public setView(self, outsideUpdate) {
    //     self.addDataLayout(self);
    //     if (outsideUpdate) {
    //         self.addMediaBlockIfNeed(self.layout);
    //         self.addMediaLayout(self, outsideUpdate);
    //     } else {
    //         self.addMediaLayout(self);
    //     }
    //     if (outsideUpdate) {
    //         self.addTabsLayout(self, outsideUpdate);
    //     } else {
    //         self.addTabsLayout(self);
    //     }
    // }
}
