var VjsSubtitlesButton = videojs.getComponent('SubsCapsButton');
var subtitlesButton = videojs.extend(VjsSubtitlesButton, {
    constructor: function (player, options, callback) {
        VjsSubtitlesButton.call(this, player, options);
        // this.player = player;
        this.menuButton_.contentEl().append(videojs.dom.createEl('i', {
            className: 'icons-subtitles icon',
            innerHTML: '<i></i>'
        }));
        var _player = player;

        if (player.increaseMenuLength) {
            $(this.el()).addClass('vjs-menu-big-length');
        }
        player.textTracks().on("change", function action(event) {
            if( !_player.componentContext.helperProvider.isSmoothStreaming(_player.src()) ) {
                var showing = this.tracks_.filter(function (track) {
                    if (track.mode === "showing") {
                        return true;
                    }
                })[0];
                if (showing) {
                    _player.componentContext.textTracksProvider.timedTextChanged({src: showing.src, id: showing.id});
                } else {
                    _player.componentContext.textTracksProvider.timedTextChanged({src: undefined, id: undefined});
                }
            }
        });
        this.menu.__proto__.unlockShowing = function() {}
    },
    buildCSSClass: function () {
        return 'icon-button';
    },
    controlText_: 'Timed Text',
    label_: 'Timed Text',
    setCurrentTimedTextByUrl: function (url) {
        this.menu.children().forEach(function(el){
            if(el.track.src == url){
                el.track.mode = "showing";
            } else {
                el.track.mode = "disabled";
            }
        })
    },
    setCurrentTimedTextByIndex: function(index) {
        var textTracks = this.player_.textTracks().tracks_;
        if(index < 0) {
            textTracks.forEach(function(el){
                el.mode = "disabled";
            });
        } else {
            textTracks.forEach(function(el, ind){
                if (ind == index) {
                    el.mode = "showing";
                } else {
                    el.mode = "disabled";
                }
            });
        }
    },
    handleClick: function handleClick(event) {
        this.player_.componentContext.handleClickPlayerMenuButton(this.id());
        if (this.menuButton_.hasClass('active')) {
            this.unpressButton();
            this.menuButton_.removeClass('active');
            this.menu.removeClass('vjs-lock-showing');
        } else {
            this.pressButton();
            this.menuButton_.addClass('active');
        }
    },
    hideMenu: function(){
        if (this.menuButton_.hasClass('active')) {
            this.unpressButton();
            this.menuButton_.removeClass('active');
            this.menu.removeClass('vjs-lock-showing');
        }
    }
});
videojs.registerPlugin('subtitlesbutton', function (options) {
    var player = this;
    player.ready(function () {
        var _div = player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new subtitlesButton(player, {id: 'subtitleControl'}));
    });
});
