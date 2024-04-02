var VjsButton = videojs.getComponent('ProgressControl');
var progressBar = videojs.extend(VjsButton, {
    constructor: function(player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.controlTextEl_ = videojs.dom.createEl('span', {
            className: 'vjs-progress-control',
            innerHTML: '<span>TEST</span>'
        })
     }//,
    // handlePlay: function(event) {
    //     this.removeClass('vjs-paused');
    //     this.addClass('vjs-playing');
    //     // change the button text to "Pause"
    //     this.controlText(this.options_.pluginOptions.pauseTitle);
    // },
    // handlePause: function(event) {
    //     this.removeClass('vjs-playing');
    //     this.addClass('vjs-paused');
    //     // change the button text to "Play"
    //     this.controlText(this.options_.pluginOptions.playTitle);
    // },
    // handleClick: function (event) {
    //     if (this.player.player_.paused()) {
    //         var playPromise = this.player.player_.play();
    //         if (playPromise !== undefined) {
    //             playPromise.then(_ => { }).catch(error => { });
    //         }
    //         event.stopPropagation();
    //     } else {
    //         var playPromise = this.player.player_.pause();
    //         if (playPromise !== undefined) {
    //             playPromise.then(_ => { }).catch(error => { });
    //         }
    //         event.stopPropagation();
    //     }
    // }
});

videojs.registerPlugin('progressbar', function (options) {
     var player = this;
     player.ready(function () {
         // if (!player.controlBar.getChildById('sub_control_bar').getChildById('left_control_bar')){
         //     var cBar = player.controlBar.getChildById('sub_control_bar').addChild(
         //         'component', {
         //             text: "",
         //             id:"progress_control_bar"
         //         });
         //     cBar.setAttribute('id','progress_control_bar');
         // }
        player.controlBar.progressControl.addChild(
            new progressBar(player, {
                el: videojs.dom.createEl(
                    "div",
                    {
                        className: 'progress-control-bar',
                        innerHTML: 'TEST2',
                        title: options.playTitle
                    }
                ),
                pluginOptions: options
            }));
    });
});
