var VjsButton = videojs.getComponent('FullscreenToggle');
var fullscreenButton = videojs.extend(VjsButton, {
    constructor: function (player, options, callback) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.controlTextEl_ = videojs.dom.createEl('span', {
            className: 'vjs-control-text',
            innerHTML: '<span></span>'
        });
        this.on(player, 'fullscreenchange', this.handleFullscreenChange);
    },
    handleFullscreenChange: function(e){
        var videoHeight = $(e.target).height();
        var controlBarHeight = $(e.target).find('.vjs-control-bar').height();
        $(e.target).find('video.vjs-tech').height(videoHeight-controlBarHeight);
        if (this.player.componentContext.isFullscreen) {
            this.controlText(this.options_.pluginOptions.nonFullscreenTitle);
            $('#cinema-mode').hide();
            // for displaing overlay in the fullscreen mode
            $(this.player.el()).append($('#png-overlay'));
            $(this.player.el()).append($('#timecode-overlay'));
            $(this.player.el()).append($('#settings-modal-wrapper'));
            $(this.player.el()).append($('#audio-track-overlay'));
        } else {
            this.controlText(this.options_.pluginOptions.fullscreenTitle);
            $('#cinema-mode').show();
            $(this.player.el().parentElement).append($('#png-overlay'));
            $(this.player.el().parentElement).append($('#settings-modal-wrapper'));
            $(this.player.el().parentElement).append($('#timecode-overlay'));
            $(this.player.el().parentElement).append($('#audio-track-overlay'));
        }
    }
});
videojs.registerPlugin('fullscreenbutton', function (options) {
    var player = this;
    player.ready(function () {
        if (!player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar')) {
            var cBar = player.controlBar.getChildById('sub_control_bar').addChild('component', {
                text: "",
                id: "right_control_bar"
            });
            cBar.addClass('sub-control-bar');
            cBar.setAttribute('id', 'right_control_bar');
        }
        player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new fullscreenButton(player, {
            el: videojs.dom.createEl("div", {
                className: 'icon-button',
                id: 'fullscreen-btn',
                innerHTML: '<i class="icons-fullscreen icon"></i><i class="icons-exit-fullscreen icon"></i>',
                title: options.fullscreenTitle
            }),
            pluginOptions : options
        }));
    });
});
