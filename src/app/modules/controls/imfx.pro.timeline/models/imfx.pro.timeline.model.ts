export class IMFXProTimeline {
    /**
     * Timeline name
     */
    public Name: string;
    /**
     * Start timeline frame
     */
    public From: number;
    /**
     * Timeline length in frames
     */
    public Length: number;
    /**
     * Timeline frames per second
     */
    public Framerate: number;
    /**
     * Timeline timecode format
     */
    public TimecodeFormat: any;
    /**
     * Timeline length in frames
     */
    public Groups: Array<IMFXProTimelineGroup>;
    /**
     * Timeline should run in clip mode
     */
    public ClipsData?: Array<IMFXProTimelineClip>;
}

export class IMFXProTimelineClip {
    /**
     * Clip start frame
     */
    public ClipId: string;
    /**
     * Clip start frame in timeline range
     */
    public TimelineStartFrame: number;
    /**
     * Clip start frame in initial video range
     */
    public RealFrame: number;
    /**
     * Clip length in frames
     */
    public Length: number
    /**
     * Additional text which can be showed on clip
     */
    public ClipText?: string
    /**
     * Media Id - clip owner
     */
    public MediaId?: number
}

export class IMFXProTimelineGroup {
    /**
     * Group name
     */
    public Name: string;
    /**
     * Group can be expanded\collapsed
     */
    public Expandable: boolean;
    /**
     * Array of timeline rows
     */
    public Rows: Array<IMFXProTimelineRow>;
    /**
     * Utility field for group state
     */
    public Expanded?: boolean;
    /**
     * Show group header
     */
    public WithHeader?: boolean;
    /**
     * Show gear button on header
     */
    public WithGearButton?: boolean;
    /**
     * Show additional text on header row
     */
    public HeaderAdditionalText?: string;
}

export class IMFXProTimelineRow {
    /**
     * Timeline row label
     */
    public Name: string;
    /**
     * Timeline row type
     */
    public Type: IMFXProTimelineType;
    /**
     * Timeline row keys array or source image url
     */
    public Keys: Array<IMFXProTimelineItem> | any;
    /**
     * Row height
     */
    public Height?: number;
    /**
     * Allow drag items inside row
     */
    public WithDrag?: boolean;
    /**
     * Row additional data
     */
    public Data?: any;
    /**
     * Highlight row
     */
    public Highlighted?: any;
    /**
     * Highlight default row
     */
    public HighlightedDefault?: any;
}

export class IMFXProTimelineItem {
    /**
     * Key start position frame
     */
    public Frame: number;
    /**
     * Key length in frames
     */
    public Length: number;
    /**
     * Value of frame
     */
    public Value: any;
    /**
     * Key additional data
     */
    public Data?: any;
}


export enum IMFXProTimelineType {
    Image = 0,
    Marker = 1,
    Waveform = 2
}
