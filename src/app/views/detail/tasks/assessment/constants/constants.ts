export class GoldenTabs {
    static tabs = [
        {
            type: 'component',
            componentName: 'Data',
            tTitle: 'Data',
            title: 'Metadata',
            translateKey: 'data',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Media',
            tTitle: 'Media',
            title: 'Media',
            translateKey: 'media',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Tagging',
            tTitle: 'Tagging',
            title: 'Tagging',
            translateKey: 'tagging',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'MediaItems',
            tTitle: 'MediaItems',
            title: 'Media Items',
            translateKey: 'media_list',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'JobData',
            tTitle: 'JobData',
            title: 'Workflow Metadata',
            translateKey: 'jobdata',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Segments',
            tTitle: 'Segments',
            title: 'Segments',
            translateKey: 'segments',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Events',
            tTitle: 'Events',
            title: 'Events',
            translateKey: 'events',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'AudioTracks',
            tTitle: 'AudioTracks',
            title: 'Audio Tracks',
            translateKey: 'audiotracks',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'MediaInfo',
            tTitle: 'MediaInfo',
            title: 'MediaInfo',
            translateKey: 'media_info',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Timeline',
            tTitle: 'Timeline',
            title: 'Timeline',
            translateKey: 'timeline',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Subtitles',
            tTitle: 'Subtitles',
            title: 'Timed Text',
            translateKey: 'subtitles',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Metadata',
            tTitle: 'Metadata',
            title: 'Custom Metadata',
            translateKey: 'metadata',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'Notes',
            tTitle: 'Notes',
            title: 'Notes',
            translateKey: 'notes',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'AI',
            tTitle: 'AI',
            title: 'AI',
            translateKey: 'ai',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'AVFaults',
            tTitle: 'AVFaults',
            title: 'A/V Faults',
            translateKey: 'av_faults',
            isValid: true,
            timecodesInvalid: false
        },
        {
            type: 'component',
            componentName: 'QcReports',
            tTitle: 'QcReports',
            title: 'QcReports',
            translateKey: 'qcreports',
            isValid: true,
            timecodesInvalid: false
        },
    ];
    static timecodesTabs = {
        Tagging: 'Tagging',
        Segments: 'Segments',
        Events: 'Events',
        AVFaults: 'AVFaults'
    };
}

export class PassFailOption {
    static Mandatory = 'Mandatory';
    static Optional = 'Optional';
    static Disabled = 'Disabled';
}
