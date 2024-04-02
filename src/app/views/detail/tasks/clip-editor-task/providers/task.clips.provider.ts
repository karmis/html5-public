import {Injectable} from "@angular/core";
import {SegmentetClipsProvider} from "../../../../clip-editor/providers/segmented.clips.provider";
import {TimeCodeFormat, TMDTimecode} from "../../../../../utils/tmd.timecode";
import {MediaClip} from "../../../../clip-editor/rce.component";

@Injectable()
export class TaskClipsProvider extends SegmentetClipsProvider {
    public getClips(clips: Array<any>) {
        let clipsWithSeconds = clips.map((el) => {
            return {
                in: TMDTimecode.fromString(el.in, TimeCodeFormat[el.file.TimecodeFormat]).toSeconds(),
                out: TMDTimecode.fromString(el.out, TimeCodeFormat[el.file.TimecodeFormat]).toSeconds(),
                file: el.file
            }
        });

        let exportClips = [];

        for (let clip of clipsWithSeconds) {
            let exportClip: MediaClip = {};

            let startMs = (clip.in) * 1000;
            exportClip.start = TMDTimecode.fromMilliseconds(startMs, TimeCodeFormat[clip.file.TimecodeFormat]).toString();
            exportClip.mediaId = clip.file.ID;
            exportClip.file = clip.file;
            let endMs = (clip.out ) * 1000;
            exportClip.end = TMDTimecode.fromMilliseconds(endMs, TimeCodeFormat[clip.file.TimecodeFormat]).toString();
            exportClips.push(exportClip);
        }

        return exportClips;
    }
}
