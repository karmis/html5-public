_TextTrackExtensions = function() {
    "use strict";
    var Cue,
        currentLanguage = "",
        ttmlRenderer = null;

    return {
        system: undefined,
        eventBus: undefined,
        videoModel: undefined,
        debug: undefined,
        config: undefined,

        setup: function() {
            Cue = window.VTTCue || window.TextTrackCue;
        },

        cueEnter: function(subtitle_style, subtitle_text, subtitle_type) {
            this.eventBus.dispatchEvent({
                type: "cueEnter",
                data: {
                    text: subtitle_text,
                    style: subtitle_style,
                    type: subtitle_type
                }
            });
        },

        cueExit: function(subtitle_style, subtitle_text, subtitle_type) {
            this.eventBus.dispatchEvent({
                type: "cueExit",
                data: {
                    text: subtitle_text,
                    style: subtitle_style,
                    type: subtitle_type
                }
            });
        },

        getCurrentTextTrack: function(video){
            for(var i=0; i< video.textTracks.length; i++){
                if(video.textTracks[i].label === 'hascaption'){
                    return video.textTracks[i];
                }
            }
            return null;
        },

        addTextTrack: function(video, captionData, label, scrlang, isDefaultTrack) {
            var track = null,
                currentItem = null,
                subtitleDisplayMode = 'subtitles',
                renderingDiv = this.videoModel.getTTMLRenderingDiv(),
                i;

            //no function removeTextTrack is defined
            //add one, only if it's necessary
            //deleteCues will be very efficient in this case
            track = this.getCurrentTextTrack(video);
            if (!track) {
                if (renderingDiv) {
                    ttmlRenderer = this.system.getObject("ttmlRenderer");
                    ttmlRenderer.initialize(renderingDiv);
                }
                subtitleDisplayMode = renderingDiv !== null ? 'metadata' : 'subtitles';
                if (subtitleDisplayMode === 'subtitles') {
                    subtitleDisplayMode = this.config.getParam("TextTrackExtensions.displayModeExtern", "boolean") === true ? 'metadata' : 'subtitles';
                }
                //TODO: Ability to define the KIND in the MPD - ie subtitle vs caption....
                track = video.addTextTrack(subtitleDisplayMode, 'hascaption', scrlang);
                currentLanguage = scrlang;
                // track.default is an object property identifier that is a reserved word
                // The following jshint directive is used to suppressed the warning "Expected an identifier and instead saw 'default' (a reserved word)"
                /*jshint -W024 */
                track.default = isDefaultTrack;
                if (subtitleDisplayMode !== 'metadata') {
                    track.mode = "showing";
                }else{
                    track.mode = "hidden";
                }

            } else {
                this.cleanSubtitles();
                track.default = isDefaultTrack;
                if (track.mode !== 'showing' && track.kind !== 'metadata') {
                    track.mode = "showing";
                }
                currentLanguage = scrlang;
            }

            for (i = 0; i < captionData.length; i += 1) {
                currentItem = captionData[i];
                track.addCue(new Cue(currentItem.start, currentItem.end, currentItem.data));
            }

            return track;
        },

        onCueEnter: function(e) {
            var renderingDiv = this.videoModel.getTTMLRenderingDiv();

            if (e.currentTarget.type === 'image' && renderingDiv === null) {
                this.debug.warn("[TextTrackExtensions] Rendering image subtitles without div is impossible");
            }

            if (renderingDiv) {
                ttmlRenderer.onCueEnter(e);
            }
            this.cueEnter(e.currentTarget.style, e.currentTarget.text, e.currentTarget.type);
        },

        onCueExit: function(e) {
            var renderingDiv = this.videoModel.getTTMLRenderingDiv();

            if (renderingDiv) {
                ttmlRenderer.onCueExit(e);
            }
            this.cueExit(e.currentTarget.style, e.currentTarget.text);
        },

        // Orange: addCues added so it is possible to add cues during playback,
        //         not only during track initialization

        addCues: function(track, captionData) {
            var i = 0,
                currentItem = null,
                newCue = null;

            for (i = 0; i < captionData.length; i += 1) {
                currentItem = captionData[i];
                if (currentItem.start < currentItem.end) {
                    if( this.fingerprint_browser().name == 'InternetExplorer' || this.fingerprint_browser().name == 'Edge' ) {
                        newCue = new TextTrackCue(currentItem.start, currentItem.end, currentItem.data);
                    }
                    else {
                        newCue = new Cue(currentItem.start, currentItem.end, currentItem.data);
                    }

                    newCue.id = currentLanguage;
                    newCue.type = currentItem.type;
                    newCue.onenter = this.onCueEnter.bind(this);
                    newCue.onexit = this.onCueExit.bind(this);
                    newCue.snapToLines = false;
                    newCue.line = currentItem.line;

                    if (currentItem.style) {
                        newCue.style = currentItem.style;
                    }

                    track.addCue(newCue);
                }
            }
        },

        deleteCues: function(video, disabled, start, end) {
            var track = null,
                cues = null,
                lastIdx = null,
                currentTrackMode,
                i = 0;

            //when multiple tracks are supported - iterate through and delete all cues from all tracks.
            if (video) {
                track = video.textTracks[0];
                if (track) {
                    currentTrackMode = track.mode;
                    //if track mode is disabled, the cues are not accessible
                    //we have to change the mode value to be sure the delete process is correctly executed.
                    if (currentTrackMode === 'disabled') {
                        track.mode = 'hidden';
                    }
                    cues = track.cues;
                    if (cues) {
                        lastIdx = cues.length - 1;

                        for (i = lastIdx; i >= 0; i -= 1) {
                            if (((end === undefined || end === -1) || (cues[i].endTime <= end)) &&
                                ((start === undefined || start === -1) || (cues[i].startTime >= start))) {
                                track.removeCue(cues[i]);
                            }
                        }
                    }
                    track.mode = currentTrackMode;
                }
            }
        },

        cleanSubtitles: function() {
            var renderingDiv = this.videoModel.getTTMLRenderingDiv();
            if (renderingDiv && ttmlRenderer) {
                ttmlRenderer.cleanSubtitles();
            }
        },
        fingerprint_browser: function() {
            var userAgent,
                name,
                version;

            try {

                userAgent = navigator.userAgent.toLowerCase();

                if (/msie (\d+\.\d+);/.test(userAgent)) { //test for MSIE x.x;
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    if (userAgent.indexOf("trident/6") > -1) {
                        version = 10;
                    }
                    if (userAgent.indexOf("trident/5") > -1) {
                        version = 9;
                    }
                    if (userAgent.indexOf("trident/4") > -1) {
                        version = 8;
                    }
                    name = "Internet Explorer";
                } else if (userAgent.indexOf("trident/7") > -1) { //IE 11+ gets rid of the legacy 'MSIE' in the user-agent string;
                    version = 11;
                    name = "Internet Explorer";
                }  else if (/edge[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Edge";
                }  else if (/firefox[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Firefox";
                } else if (/opera[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Opera/x.x or Opera x.x (ignoring remaining decimal places);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Opera";
                } else if (/chrome[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Chrome/x.x or Chrome x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Chrome";
                } else if (/version[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Version/x.x or Version x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Safari";
                } else if (/rv[\/\s](\d+\.\d+)/.test(userAgent)) { //test for rv/x.x or rv x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Mozilla";
                } else if (/mozilla[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Mozilla/x.x or Mozilla x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Mozilla";
                } else if (/binget[\/\s](\d+\.\d+)/.test(userAgent)) { //test for BinGet/x.x or BinGet x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (BinGet)";
                } else if (/curl[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Curl/x.x or Curl x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (cURL)";
                } else if (/java[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Java/x.x or Java x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (Java)";
                } else if (/libwww-perl[\/\s](\d+\.\d+)/.test(userAgent)) { //test for libwww-perl/x.x or libwww-perl x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (libwww-perl)";
                } else if (/microsoft url control -[\s](\d+\.\d+)/.test(userAgent)) { //test for Microsoft URL Control - x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (Microsoft URL Control)";
                } else if (/peach[\/\s](\d+\.\d+)/.test(userAgent)) { //test for Peach/x.x or Peach x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (Peach)";
                } else if (/php[\/\s](\d+\.\d+)/.test(userAgent)) { //test for PHP/x.x or PHP x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (PHP)";
                } else if (/pxyscand[\/\s](\d+\.\d+)/.test(userAgent)) { //test for pxyscand/x.x or pxyscand x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (pxyscand)";
                } else if (/pycurl[\/\s](\d+\.\d+)/.test(userAgent)) { //test for pycurl/x.x or pycurl x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (PycURL)";
                } else if (/python-urllib[\/\s](\d+\.\d+)/.test(userAgent)) { //test for python-urllib/x.x or python-urllib x.x (ignoring remaining digits);
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Library (Python URLlib)";
                } else if (/appengine-google/.test(userAgent)) { //test for AppEngine-Google;
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Cloud (Google AppEngine)";
                } else if (/trident/.test(userAgent)) { //test for Trident;
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Trident";
                } else if (/adventurer/.test(userAgent)) { //test for Orange Adventurer;
                    version = Number(RegExp.$1); // capture x.x portion and store as a number
                    name = "Adventurer";
                } else {
                    version = "unknown";
                    name = "unknown";
                }
            } catch (err) {
                name = "error";
                version = "error";
            }

            return {
                name: name.replace(/\s+/g, ''),
                version: version
            };
        }
    };
};
