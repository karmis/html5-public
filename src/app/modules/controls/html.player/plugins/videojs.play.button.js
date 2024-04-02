var VjsButton = videojs.getComponent('PlayToggle');
var playButton = videojs.extend(VjsButton, {
    constructor: function(player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.controlTextEl_ = videojs.dom.createEl('span', {
            className: 'vjs-control-text',
            innerHTML: '<span></span>'
        })
    },
    handlePlay: function(event) {
        // var compContext = this.player.componentContext;
        // if(!compContext.firstPlayback && !compContext.manualPlayback) {
        //     compContext.firstPlayback = true;
        //     compContext.manualPlayback = true;
        // }
        // if(!!compContext.audioSrc && compContext.manualPlayback) {
        //     this.removeClass('vjs-paused');
        //     this.addClass('vjs-playing');
        //     // change the button text to "Pause"
        //     this.controlText(this.options_.pluginOptions.pauseTitle);
        // }
        // else if(!compContext.audioSrc)
        // {
            this.removeClass('vjs-paused');
            this.addClass('vjs-playing');
            // change the button text to "Pause"
            this.controlText(this.options_.pluginOptions.pauseTitle);
            this.player.componentContext.processInternalTrackChanges();
        // }
    },
    handlePause: function(event) {
        // var compContext = this.player.componentContext;
        // if(!!compContext.audioSrc && !compContext.manualPlayback) {
        //     this.removeClass('vjs-playing');
        //     this.addClass('vjs-paused');
        //     // change the button text to "Play"
        //     this.controlText(this.options_.pluginOptions.playTitle);
        // }
        // else if(!compContext.audioSrc)
        // {
            this.removeClass('vjs-playing');
            this.addClass('vjs-paused');
            // change the button text to "Play"
            this.controlText(this.options_.pluginOptions.playTitle);
        // }
    },
    handleClick: function (event) {
        var compContext = this.player.componentContext;
        if(!compContext.firstPlayback) {
            compContext.firstPlayback = true;
        }
        if (!compContext.manualPlayback && !!compContext.audioSrc || !compContext.audioSrc && this.player.player_.paused()) {
            compContext.manualPlayback = true;
            var playPromise = this.player.player_.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => { }).catch(error => { });
            }
            event.stopPropagation();
        }
        else if(compContext.manualPlayback && !!compContext.audioSrc || !compContext.audioSrc)
        {
            if(compContext.manualPlayback && !!compContext.audioSrc && this.player.player_.paused()){
                compContext.manualPlayback = false;
                this.handlePause();
            }
            else
                compContext.manualPlayback = false;
            var playPromise = this.player.player_.pause();

            if (playPromise !== undefined) {
                playPromise.then(_ => { }).catch(error => { });
            }
            event.stopPropagation();
        }
    }
});

videojs.registerPlugin('playbutton', function (options) {
     var player = this;
     player.ready(function () {
         if (!player.controlBar.getChildById('sub_control_bar').getChildById('left_control_bar')){
             var cBar = player.controlBar.getChildById('sub_control_bar').addChild(
                 'component', {
                     text: "",
                     id:"left_control_bar"
                 });
             cBar.addClass('sub-control-bar')
             cBar.setAttribute('id','left_control_bar');
         }
        player.controlBar.getChildById('sub_control_bar').getChildById('left_control_bar').addChild(
            new playButton(player, {
                el: videojs.dom.createEl(
                    "div",
                    {
                        className: 'icon-button vjs-play-pause-button',
                        innerHTML: '<i class="icons-play icon play"></i><i class="icons-pause icon pause"></i>',
                        title: options.playTitle
                    }
                ),
                pluginOptions: options
            }));
    });
});
