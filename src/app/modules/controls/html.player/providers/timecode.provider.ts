import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {Injectable} from "@angular/core";
import * as moment from "moment";

@Injectable()
export class TimecodeProvider {

    public getTimecodeString(time: number, timecodeFormat: number, somFrames: number) {
        if (!time) {
            time = 0;
        }
        if (somFrames) {
            var frames = TMDTimecode.fromMilliseconds(time * 1000,  timecodeFormat).toFrames();
            var res = TMDTimecode.fromFrames(frames + somFrames, timecodeFormat).toString();
        }
        else {
            var frames = TMDTimecode.fromMilliseconds(time * 1000, timecodeFormat).toFrames();
            var res = TMDTimecode.fromFrames(frames, timecodeFormat).toString();
        }
        return res || "";
    }

    public getTimeString(time: number) {
        let sec = Math.floor(time);
        let msec = time - sec;

        let dateSec = new Date(sec * 1000);
        dateSec.setHours(dateSec.getHours() + dateSec.getTimezoneOffset() / 60);
        return dateSec ? moment(dateSec).format("HH:mm:ss") : "";
    }

    public getAudioTimeString(time: number, som: number) { // for audio types
        let dateSec = new Date(time * 1000 + som);
        dateSec.setHours(dateSec.getHours() + dateSec.getTimezoneOffset() / 60);
        return dateSec ? moment(dateSec).format("HH:mm:ss.SSS") : "";
    }

    public getTimeFromTimecodeString(tc: string, timecodeFormat: number, somFrames: number) {
        let timecodeFormat1 = TimeCodeFormat[timecodeFormat];
        let frames = TMDTimecode.fromString(tc, timecodeFormat1).toFrames();
        let time = TMDTimecode.fromFrames(frames - somFrames, timecodeFormat1).toSeconds();
        return time;
    }

    public getTimeFromString(tc: string, som: number) {
        let dateSec = moment(tc, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
        // TMDTimecode.fromFrames(somFrames, timecodeFormat1)
        return (dateSec * 1000 - som) / 1000;
    }

    public getFrameToMillisecond(timecodeFormat: number) {
        let tc = new TMDTimecode({
            type: "frames",
            frames: 1,
            timecodeFormat: timecodeFormat
        }).toMilliseconds();
        return tc;
    }
    public getMillisecondsFromFrames(frames: number, timecodeFormat: number, somFrames: number) {
        let ms = TMDTimecode.fromFrames(frames - somFrames, timecodeFormat).toMilliseconds();
        return ms;
    }

    public getFramesFromTimecode(time: number,  timecodeFormat: number, somFrames: number) {
        let frames = TMDTimecode.fromMilliseconds(time * 1000, timecodeFormat).toFrames();
        return frames + somFrames; /*TMDTimecode.fromString(tc, timecodeFormat).toFrames();*/
    }
}
