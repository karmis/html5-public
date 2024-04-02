import {Injectable} from "@angular/core";
import {IMFXHtmlPlayerComponent} from "../imfx.html.player";
import {AbstractPlayerProvider} from "./abstract.player.provider";

@Injectable()
export class TextTracksProvider extends AbstractPlayerProvider {
    constructor() {
        super();
    }
    resetTextTracks() {
        if (this.componentRef.player.textTracks().tracks_.length > 0) {
            let _tracks = this.componentRef.player.textTracks().tracks_;
            for (var i = _tracks.length - 1; i >= 0; i--) {
                this.componentRef.player.textTracks().removeTrack_(_tracks[i]);
            }
        }
    }

    public timedTextChanged(o) {
        this.componentRef.timedTextChange.emit(o);
    }
    public timedTextChangedByIndex(index) {
        if (index < 0) {
            this.componentRef.timedTextChange.emit({src: undefined, id: undefined});
        } else {
            if (!this.componentRef.file.Subtitles) {
                return;
            }
            let url = this.componentRef.file.Subtitles[index].Url;
            let id = this.componentRef.file.Subtitles[index].Id;
            this.componentRef.timedTextChange.emit({src: url, id: id});
        }
    }

}
