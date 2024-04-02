var VjsAudiotrackButton = videojs.getComponent('AudioTrackButton');
var audiotrackButton = videojs.extend(VjsAudiotrackButton, {
    constructor: function (player, options, callback) {
        VjsAudiotrackButton.call(this, player, options);
        this.player = player;
        this.menuButton_.contentEl().append(videojs.dom.createEl('i', {
            className: 'icons-audio-select icon',
            innerHTML: '<i></i>'
        }));
        this.menu.__proto__.unlockShowing = function() {}
    },
    buildCSSClass: function () {
        return 'icon-button';
    },
    controlText_: 'Audio Tracks',
    handleClick: function handleClick(event) {
        this.player.componentContext.handleClickPlayerMenuButton(this.id());
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
    },
    setCurrentAudioByIndex: function(index) {
        var tracks = this.player.audioTracks();
        if (index >= tracks.length) {
            return;
        }
        for (var i = 0; i < tracks.length; i++) {
            if (i === index) {
                tracks[i].enabled = true;
            } else {
                tracks[i].enabled = false;
            }
        }
    }
});

videojs.registerPlugin('audiotrackbutton', function (options) {
    var player = this;
    player.ready(function () {
        var _div = player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new audiotrackButton(player, {id: 'audioTracksControl'}));
    });
});
