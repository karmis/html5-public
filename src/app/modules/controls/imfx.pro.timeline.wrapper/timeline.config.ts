/**
 * Created by Pavel on 16.05.2017.
 */


export class TimelineConfig {
    series: Array<TimelineSerie>;
    SOM: string;
    startTimecode: string;
    endTimecode: string;
    template?;
    mediaType?: number;
    readOnly?: boolean;
}

export class TimelineSerie {
  title: string;
  items: Array<TimelineSerieItem>
}

export class TimelineSerieItem {
  startTimecode: string;
  endTimecode?: string;
  label?: string;
  thumbnail?: string;
  mediaId?: number;
  id?: string;
  file?: any;
  comment?: any;
}
