export class LayoutManagerModel {
    public Id: number;
    public Name: string;
    public IsShared: boolean;
    public IsDefault: boolean;
    public IsMine: boolean;
    public TypeId: number;
    public Layout: string;
}

export enum LayoutType {
    Dashboard = 3,
    Logging = 4,
    Assess = 5,
    ClipEditorMedia = 6,
    ClipEditorVersion = 7,
    TaskLogger = 8,
    ComponentQC = 9,
    SubtitlesQC = 10,
    TaskClipEditor = 11,
    Production = 12,
    Segmenting = 13,
    Outgest = 14
}

export class LayoutManagerDefaults {
    static Dashboard: string = '{"settings": {"hasHeaders": true,"showPopoutIcon": false,"showMaximiseIcon": false,"showCloseIcon": false,"selectionEnabled": true},"content": [],"dimensions": {"headerHeight": 36,"borderWidth": 10}}';
    static Logging: string = `{
        "dimensions": {"headerHeight": 36, "borderWidth": 10},
        "settings": {
            "hasHeaders": true,
            "showPopoutIcon": true,
            "showMaximiseIcon": false,
            "showCloseIcon": true,
            "selectionEnabled": true
        },
        "labels": {
            "close": "Close",
            "maximise": "Maximise",
            "minimise": "Minimise",
            "popout": "Open In New Window",
            "popin": "Pop In",
            "tabDropdown": "Additional Tabs"
        },
        "content": [{
            "type": "row",
            "content": [{
                "type": "component",
                "componentName": "Data",
                "width": 25,
                "tTitle": "Data"
            }, {
                "type": "column",
                "content": [
                    {
                        "type": "component",
                        "componentName": "Media", "tTitle": "Media"
                    }, {
                        "type": "component",
                        "componentName": "VideoInfo",
                        "tTitle": "VideoInfo"
                    },
                    {
                        "componentName": "Timeline",
                        "type": "component", "tTitle": "Timeline"
                    }
                ]
            }, {
                "type": "column",
                "content": [{
                    "type": "component",
                    "componentName": "Tagging",
                    "width": 25,
                    "tTitle": "Tagging"
                },
                    {"type": "component", "componentName": "Taxonomy", "width": 25, "tTitle": "Taxonomy"}
                ]
            }]
        }]
    }`;
    static TaskLogger: string = '{"dimensions":{"headerHeight":36,"borderWidth":10},"settings":{"hasHeaders":true,"showPopoutIcon":true,"showMaximiseIcon":false,"showCloseIcon":true,"selectionEnabled":true},"labels":{"close":"Close","maximise":"Maximise","minimise":"Minimise","popout":"Open In New Window","popin":"Pop In","tabDropdown":"Additional Tabs"},"content":[{"type":"row","isClosable":true,"reorderEnabled":true,"title":"","content":[{"type":"column","isClosable":true,"reorderEnabled":true,"title":"","width":20.320738137082603,"content":[{"type":"stack","header":{},"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"height":50,"content":[{"type":"component","componentName":"JobData","tTitle":"JobData","title":"Workflow Metadata","isClosable":true,"reorderEnabled":true}]},{"type":"stack","width":25,"height":50,"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"content":[{"type":"component","componentName":"Data","width":25,"tTitle":"Data","isClosable":true,"reorderEnabled":true,"title":"Metadata"}]}]},{"type":"column","isClosable":true,"reorderEnabled":true,"title":"","width":42.17926186291741,"content":[{"type":"stack","height":33.333333333333336,"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"content":[{"type":"component","componentName":"Media","tTitle":"Media","isClosable":true,"reorderEnabled":true,"title":"Media"}]},{"type":"stack","height":33.333333333333336,"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"content":[{"componentName":"Timeline","type":"component","tTitle":"Timeline","isClosable":true,"reorderEnabled":true,"title":"Locator Timeline"}]}]},{"type":"column","isClosable":true,"reorderEnabled":true,"title":"","width":23.038856304985337,"content":[{"type":"stack","width":25,"height":50,"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"content":[{"type":"component","componentName":"Tagging","width":25,"tTitle":"Tagging","isClosable":true,"reorderEnabled":true,"title":"Locators"}]},{"type":"stack","width":25,"height":50,"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"content":[{"type":"component","componentName":"Taxonomy","width":25,"tTitle":"Taxonomy","isClosable":true,"reorderEnabled":true,"title":"Taxonomy"}]}]},{"type":"stack","header":{},"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"width":14.461143695014663,"content":[{"type":"component","componentName":"MediaItems","tTitle":"MediaItems","title":"Media Items","isClosable":true,"reorderEnabled":true}]}]}]}';
    static Assess: string = JSON.stringify({
        "dimensions": {
            "headerHeight": 36,
            "borderWidth": 10
        },
        "settings": {
            "hasHeaders": true,
            "showPopoutIcon": true,
            "showMaximiseIcon": false,
            "showCloseIcon": true,
            "selectionEnabled": true
        },
        "labels": {
            "close": "Close",
            "maximise": "Maximise",
            "minimise": "Minimise",
            "popout": "Open In New Window",
            "popin": "Pop In",
            "tabDropdown": "Additional Tabs"
        },
        "content": [
            {
                "type": "column",
                "content": [
                    {
                        "type": "row",
                        "content": [
                            {
                                "type": "component",
                                "componentName": "MediaItems",
                                "tTitle": "MediaItems",
                                "width": 25
                            },
                            {
                                "type": "column",
                                "content": [
                                    {
                                        "type": "component",
                                        "componentName": "Media",
                                        "tTitle": "Media"
                                    }
                                ]
                            },
                            {
                                "type": "column",
                                "width": 25,
                                "content": [
                                    {
                                        "type": "row",
                                        "content": [
                                            {
                                                "type": "component",
                                                "componentName": "JobData",
                                                "tTitle": "JobData",
                                                "width": 20
                                            }
                                        ]
                                    },
                                    {
                                        "type": "row",
                                        "content": [
                                            {
                                                "type": "component",
                                                "componentName": "Data",
                                                "tTitle": "Data",
                                                "width": 20
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "row",
                        "content": [
                            {
                                "type": "stack",
                                "content": [
                                    {
                                        "type": "component",
                                        "componentName": "MediaInfo",
                                        "tTitle": "MediaInfo"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Segments",
                                        "tTitle": "Segments"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Events",
                                        "tTitle": "Events"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "AudioTracks",
                                        "tTitle": "AudioTracks"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Tagging",
                                        "tTitle": "Tagging"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "VideoInfo",
                                        "tTitle": "VideoInfo"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Timeline",
                                        "tTitle": "Timeline"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Subtitles",
                                        "tTitle": "Subtitles"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Metadata",
                                        "tTitle": "Metadata"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Notes",
                                        "tTitle": "Notes"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "AI",
                                        "tTitle": "AI"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "QcReports",
                                        "tTitle": "QcReports"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
    static ClipEditorMedia: string = '{"dimensions":{"headerHeight":36,"borderWidth":10},"settings":{"hasHeaders":true,"showPopoutIcon":true,"showMaximiseIcon":false,"showCloseIcon":false,"reorderEnabled":false,"isClosable":false,"selectionEnabled":true},"labels":{"close":"Close","maximise":"Maximise","minimise":"Minimise","popout":"Open In New Window","popin":"Pop In","tabDropdown":"Additional Tabs"},"content":[{"type":"row","content":[{"type":"component","componentName":"Data","tTitle":"Data","width":25},{"type":"column","content":[{"type":"component","componentName":"Media","tTitle":"Media"},{"type":"component","componentName":"Timeline","tTitle":"Timeline"}]},{"type":"column","content":[{"type":"component","componentName":"Tagging","width":25, "tTitle": "Tagging"},{"componentName":"ClipComments","tTitle":"ClipsComments","type":"component"}]},{"type":"component","componentName":"MediaItems","tTitle":"MediaItems","width":15}]}]}';
    static ClipEditorVersion: string = '{ "dimensions": { "headerHeight": 36, "borderWidth": 10 }, "settings": { "hasHeaders": true, "showPopoutIcon": true, "showMaximiseIcon": false, "showCloseIcon": false, "reorderEnabled": false, "isClosable": false, "selectionEnabled": true }, "labels": { "close": "Close","maximise": "Maximise", "minimise": "Minimise", "popout": "Open In New Window", "popin": "Pop In", "tabDropdown": "Additional Tabs" }, "content": [{ "type": "row","content": [ { "type": "component", "componentName": "Data", "tTitle": "Data", "width": 25 }, { "type": "column", "content": [ { "type": "component", "componentName": "Media", "tTitle": "Media" }, { "type": "component", "componentName": "Timeline", "tTitle": "Timeline" } ] }, { "type": "column", "content": [ { "type": "component", "componentName": "Tagging", "width": 25, "tTitle": "Tagging" } ] } ] }] }';
    static ComponentQC: string = '{"dimensions":{"headerHeight":36,"borderWidth":10},"settings":{"hasHeaders":true,"showPopoutIcon":true,"showMaximiseIcon":false,"showCloseIcon":true,"selectionEnabled":true},"labels":{"close":"Close","maximise":"Maximise","minimise":"Minimise","popout":"Open In New Window","popin":"Pop In","tabDropdown":"Additional Tabs"},"content":[{"type":"row","content":[{"type":"column","width":25,"content":[{"type":"row","content":[{"type":"component","componentName":"JobData","tTitle":"JobData","width":20}]},{"type":"row","content":[{"type":"component","componentName":"Data","tTitle":"Data","width":20}]},{"type":"row","content":[{"type":"component","componentName":"Language","tTitle":"Language","width":20}]}]},{"type":"column","content":[{"type":"component","componentName":"Media","tTitle":"Media"},{"type":"row","content":[{"type":"stack","content":[{"type":"component","componentName":"Subtitles","tTitle":"Subtitles"},{"type":"component","componentName":"Notes","tTitle":"Notes"},{"type":"component","componentName":"MediaInfo","tTitle":"MediaInfo"}, { "type": "component", "componentName": "Timeline", "tTitle": "Timeline" }]}]}]}]}]}';
    static Outgest: string = '{"settings":{"hasHeaders":true,"constrainDragToContainer":false,"reorderEnabled":false,"selectionEnabled":true,"popoutWholeStack":false,"blockedPopoutsThrowError":true,"closePopoutsOnUnload":true,"showPopoutIcon":false,"showMaximiseIcon":false,"showCloseIcon":false,"responsiveMode":"onload","tabOverlapAllowance":0,"reorderOnTabMenuClick":true,"tabControlOffset":10,"isClosable":false},"dimensions":{"borderWidth":10,"borderGrabWidth":15,"minItemHeight":10,"minItemWidth":10,"headerHeight":36,"dragProxyWidth":300,"dragProxyHeight":200},"labels":{"close":"Close","maximise":"Maximise","minimise":"Minimise","popout":"Open In New Window","popin":"Pop In","tabDropdown":"Additional Tabs"},"content":[{"type":"row","isClosable":true,"reorderEnabled":true,"title":"","content":[{"type":"stack","header":{},"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"width":25,"content":[{"type":"component","componentName":"JobData","tTitle":"JobData","title":"Workflow Metadata","translateKey":"jobdata","isClosable":true,"reorderEnabled":true}]},{"type":"stack","header":{},"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"width":25,"content":[{"type":"component","componentName":"Data","tTitle":"Data","title":"Metadata","translateKey":"data","isClosable":true,"reorderEnabled":true}]},{"type":"column","isClosable":true,"reorderEnabled":true,"title":"","width":50,"content":[{"type":"stack","header":{},"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"height":50,"content":[{"type":"component","componentName":"Telestream","tTitle":"Telestream","title":"simple_assessment.telestream","translateKey":"telestream","isClosable":true,"reorderEnabled":true}]},{"type":"stack","header":{},"isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"width":50,"height":50,"content":[{"type":"component","componentName":"MediaItems","tTitle":"MediaItems","title":"Media Items","translateKey":"media_list","isValid":true,"isClosable":true,"reorderEnabled":true}]}]}]}],"isClosable":true,"reorderEnabled":true,"title":"","openPopouts":[],"maximisedItemId":null}';
    static SubtitlesQC: string = '{"dimensions":{"headerHeight":36,"borderWidth":10},"settings":{"hasHeaders":true,"showPopoutIcon":true,"showMaximiseIcon":false,"showCloseIcon":true,"selectionEnabled":true},"labels":{"close":"Close","maximise":"Maximise","minimise":"Minimise","popout":"Open In New Window","popin":"Pop In","tabDropdown":"Additional Tabs"},"content":[{"type":"row","content":[{"type":"column","width":25,"content":[{"type":"row","content":[{"type":"component","componentName":"JobData","tTitle":"JobData","width":20}]},{"type":"row","content":[{"type":"component","componentName":"Data","tTitle":"Data","width":20}]},{"type":"row","content":[{"type":"component","componentName":"Language","tTitle":"Language","width":20}]}]},{"type":"column","content":[{"type":"component","componentName":"Media","tTitle":"Media"},{"type":"row","content":[{"type":"stack","content":[{"type":"component","componentName":"Subtitles","tTitle":"Subtitles"},{"type":"component","componentName":"Notes","tTitle":"Notes"},{"type":"component","componentName":"MediaInfo","tTitle":"MediaInfo"}]}]}]}]}]}';
    static TaskClipEditor: string = '{"dimensions":{"headerHeight":36,"borderWidth":10},"settings":{"hasHeaders":true,"showPopoutIcon":true,"showMaximiseIcon":false,"showCloseIcon":false,"reorderEnabled":false,"isClosable":false,"selectionEnabled":true},"labels":{"close":"Close","maximise":"Maximise","minimise":"Minimise","popout":"Open In New Window","popin":"Pop In","tabDropdown":"Additional Tabs"},"content":[{"type":"row","content":[{"type":"column","width":25,"content":[{"content":[{"componentName":"Data","tTitle":"Data","title":"Metadata","type":"component"},{"componentName":"JobData","tTitle":"JobData","title":"Workflow Metadata","type":"component"}],"type":"stack"}]},{"type":"column","content":[{"type":"component","componentName":"Media","tTitle":"Media"},{"type":"component","componentName":"Timeline","tTitle":"Timeline"}]},{"type":"column","content":[{"type":"component","componentName":"Tagging","width":25,"tTitle":"Tagging"},{"type":"stack","content":[{"componentName":"ClipComments","tTitle":"ClipsComments","type":"component"},{"type":"component","componentName":"Notes","tTitle":"Notes"}]}]},{"type":"component","componentName":"MediaItems","tTitle":"MediaItems","width":15}]}]}'
    static Production: string = JSON.stringify({
        "dimensions": {"headerHeight": 36, "borderWidth": 10},
        "settings": {
            "hasHeaders": true,
            "showPopoutIcon": true,
            "showMaximiseIcon": false,
            "showCloseIcon": true,
            "selectionEnabled": true
        },
        "labels": {
            "close": "Close",
            "maximise": "Maximise",
            "minimise": "Minimise",
            "popout": "Open In New Window",
            "popin": "Pop In",
            "tabDropdown": "Additional Tabs"
        },
        "content": [
            {
                "type": "row",
                "content": [
                    {
                        "type": "column",
                        "width": 25,
                        "content": [
                            {
                                "type": "row",
                                "content": [
                                    {
                                        "type": "component",
                                        "componentName": "ProductionInfo",
                                        "tTitle": "ProductionInfo",
                                    }
                                ]
                            },
                            {
                                "type": "row",
                                "content": [
                                    {
                                        "type": "component",
                                        "componentName": "ProductionList",
                                        "tTitle": "ProductionList",
                                    }
                                ]
                            },
                            {
                                "type": "stack",
                                "content": [
                                    {
                                        "type": "component",
                                        "componentName": "SourceMedia",
                                        "tTitle": "source_media",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "SourceTitles",
                                        "tTitle": "source_titles",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "MediaInProd",
                                        "tTitle": "media_in_prod",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Workflows",
                                        "tTitle": "workflows",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "History",
                                        "tTitle": "history",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Attachments",
                                        "tTitle": "attachments",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Audio",
                                        "tTitle": "audio",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Subtitles",
                                        "tTitle": "subtitles",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Segments",
                                        "tTitle": "segments",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Events",
                                        "tTitle": "events",
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Metadata",
                                        "tTitle": "metadata",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
    static Segmenting: string = JSON.stringify({
        "dimensions": {
            "headerHeight": 36,
            "borderWidth": 10
        },
        "settings": {
            "hasHeaders": true,
            "showPopoutIcon": true,
            "showMaximiseIcon": false,
            "showCloseIcon": true,
            "selectionEnabled": true
        },
        "labels": {
            "close": "Close",
            "maximise": "Maximise",
            "minimise": "Minimise",
            "popout": "Open In New Window",
            "popin": "Pop In",
            "tabDropdown": "Additional Tabs"
        },
        "content": [
            {
                "type": "column",
                "content": [
                    {
                        "type": "row",
                        "content": [
                            {
                                "type": "component",
                                "componentName": "MediaItems",
                                "tTitle": "MediaItems",
                                "width": 25
                            },
                            {
                                "type": "column",
                                "content": [
                                    {
                                        "type": "component",
                                        "componentName": "Media",
                                        "tTitle": "Media"
                                    }
                                ]
                            },
                            {
                                "type": "column",
                                "width": 25,
                                "content": [
                                    {
                                        "type": "row",
                                        "content": [
                                            {
                                                "type": "component",
                                                "componentName": "JobData",
                                                "tTitle": "JobData",
                                                "width": 20
                                            }
                                        ]
                                    },
                                    {
                                        "type": "row",
                                        "content": [
                                            {
                                                "type": "component",
                                                "componentName": "Data",
                                                "tTitle": "Data",
                                                "width": 20
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "row",
                        "content": [
                            {
                                "type": "stack",
                                "content": [
                                    {
                                        "type": "component",
                                        "componentName": "MediaInfo",
                                        "tTitle": "MediaInfo"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Segments",
                                        "tTitle": "Segments"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "VersionSegments",
                                        "tTitle": "VersionSegments"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Events",
                                        "tTitle": "Events"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "AudioTracks",
                                        "tTitle": "AudioTracks"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Tagging",
                                        "tTitle": "Tagging"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "VideoInfo",
                                        "tTitle": "VideoInfo"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Timeline",
                                        "tTitle": "Timeline"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Subtitles",
                                        "tTitle": "Subtitles"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Metadata",
                                        "tTitle": "Metadata"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "Notes",
                                        "tTitle": "Notes"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "AI",
                                        "tTitle": "AI"
                                    },
                                    {
                                        "type": "component",
                                        "componentName": "QcReports",
                                        "tTitle": "QcReports"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
}
