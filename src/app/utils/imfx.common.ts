import { IMFXProTimelineType } from '../modules/controls/imfx.pro.timeline/models/imfx.pro.timeline.model';

export function jsonParseHelper(key, value) {
    const cache = []
    if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
            try {
                // If this value does not reference a parent it can be deduped
                return JSON.parse(JSON.stringify(value));
            } catch (error) {
                // discard key if value cannot be deduped
                return;
            }
        }
        // Store value in our collection
        cache.push(value);
    }
    return value;
}

export const timelineConfigGroup = (waves, i) => {
    return {
        Name: waves.Tracks && i < waves.Tracks.length && waves.Tracks[i] && waves.Tracks[i].length > 0 ? waves.Tracks[i] : "Track " + (i + 1),
        Type: IMFXProTimelineType.Waveform,
        Keys: [],
        Data: {
            ScaleMax: waves.ScaleMax,
            TracksCount: waves.TracksCount,
            TimeCodeFormat: waves.TimeCodeFormat,
            TimeFrames: waves.TimeFrames,
            Values: waves.Values[i],
        }
    }
}
