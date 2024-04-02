export class IMFXInfiniteTimeline {
    public ShowLabels: boolean;
    public ShowLogos: boolean;
    public Rows: Array<IMFXInfiniteTimelineRow>;
}

export class IMFXInfiniteTimelineRow {
    public Label: string;
    public ImageUrl: string;
    public Events: Array<IMFXInfiniteTimelineRowItem>;
}

export class IMFXInfiniteTimelineRowItem {
    public Title: string;
    public Description: string;
    public StartDateTime: Date;
    public EndDateTime: Date;
    public Data?: any;
}

export class IMFXInfiniteTimelineVisibilityRange {
    public From: Date;
    public To: Date;
}
