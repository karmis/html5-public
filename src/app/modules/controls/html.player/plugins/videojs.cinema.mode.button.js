var VjsButton = videojs.getComponent('Button');
var cinemaModeButton = videojs.extend(VjsButton, {
    constructor: function (player, options, callback) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.controlTextEl_ = videojs.createEl('span', {
            className: 'vjs-control-text',
            innerHTML: '<span></span>'
        })
        $(this.el()).find('.icon-non-cinema-mode').hide();
        this.on(this.el(), 'click', this.onClick, options);
        if (this.player.cinemaMode.cinemaModeOn) {
            $(this.el()).find('.icon-non-cinema-mode').show();
            $(this.el()).find('.icon-cinema-mode').hide();
            this.controlText(options.nonCinemaModeTitle);
        }
        else {
            $(this.el()).find('.icon-non-cinema-mode').hide();
            $(this.el()).find('.icon-cinema-mode').show();
            this.controlText(options.cinemaModeTitle);
        }
    },
    onClick: function () {
        var options = this.options_.pluginOptions;
        var paused = this.player.paused();
        if (!this.player.cinemaMode.cinemaModeOn) {
            // remove from old position and add into new
            $(options.videoContainerWrapper).css('opacity', 0);
            $(options.cinemaModePlayerWrapper).prepend($(options.videoContainerWrapper));
            setTimeout(() => {
                $(options.videoContainerWrapper).css('opacity', 1);
                this.player.componentContext.resizeProvider.onResize()
            });
            $(options.neighboringContainerWrapper).addClass('consumer-blocks-wrapper-with-cinema-player');
            this.player.cinemaMode.cinemaModeOn = true;
            $(this.el()).find('.icon-non-cinema-mode').show();
            $(this.el()).find('.icon-cinema-mode').hide();
            this.controlText(options.nonCinemaModeTitle);
        }
        else {
            if (this.player_.isFullscreen()) {
                this.player.exitFullscreen();
            }
            else {
                $(options.videoContainerWrapper).css('opacity', 0);
                $(options.simpleModePlayerWrapper).prepend($(options.videoContainerWrapper));
                setTimeout(() => {
                    $(options.videoContainerWrapper).css('opacity', 1);
                    this.player.componentContext.resizeProvider.onResize()
                });
                $(options.neighboringContainerWrapper).removeClass('consumer-blocks-wrapper-with-cinema-player');
                this.player.cinemaMode.cinemaModeOn = false;
                $(this.el()).find('.icon-non-cinema-mode').hide();
                $(this.el()).find('.icon-cinema-mode').show();
                this.controlText(options.cinemaModeTitle);
            }
        }
        if (!paused) {
            this.player.play();
        }
    }
});
videojs.registerPlugin('cinemamodebutton', function (options) {
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
        ;
        player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new cinemaModeButton(player, {
            el: videojs.dom.createEl("div", {
                className: 'icon-button',
                id: 'cinema-mode',
                innerHTML: '<i class="fa fa-square-o icon-cinema-mode"></i><i class="fa fa-square-o icon-non-cinema-mode"></i>',
                title: player.cinemaMode.cinemaModeOn ? options.nonCinemaModeTitle : options.cinemaModeTitle
            }),
            pluginOptions: options
        }));
        $('#cinema-mode').insertBefore($('#fullscreen-btn'));
    });
});
