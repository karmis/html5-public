import {Injectable} from "@angular/core";
import {IMFXHtmlPlayerComponent} from "../imfx.html.player";
import {AbstractPlayerProvider} from "./abstract.player.provider";


@Injectable()
export class SubtitlesProvider extends AbstractPlayerProvider {
    initSubtitles() {
        let increaseMenuLength = false;
        for (var track of this.componentRef.subtitles) {
            let url = this.checkUrlParams(track.Url);
            let label = track.Language;
            if ( track.Format ) {
                label += ' - ' +  track.Format;
                increaseMenuLength = true;
            }
            let tr = this.componentRef.player.addRemoteTextTrack({
                kind: 'subtitles',
                src: url,
                //srclang: 'en',
                label: label,
                id: track.Id
            }, false);
        }

        this.componentRef.player.increaseMenuLength = increaseMenuLength;
    }
    checkUrlParams(url) {
        let paramsStr = url.slice(url.indexOf('?') + 1);
        let params = new URLSearchParams(paramsStr);
        if (!params.has('format')) {
            params.append('format', 'WebVTT');
            url = url.slice(0, url.indexOf('?') + 1).concat(params.toString());
        }
        return url + '&converttorealtime=true';
    }
}
