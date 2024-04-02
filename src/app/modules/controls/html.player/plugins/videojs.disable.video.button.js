var VjsButton = videojs.getComponent('Button');
var disableVideoButton = videojs.extend(VjsButton, {
    constructor: function(player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.on('click', this.onClick);
    },
    onClick: function() {
        $('#disable-video').toggleClass('active');
        $('#disable-video-wrap').toggle();
    }
});
videojs.registerPlugin('disablevideobutton', function (options) {
    var player = this;
    player.ready(function () {
        if (!player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar')) {
            var cBar = player.controlBar.getChildById('sub_control_bar').addChild('component', {
                text: "",
                id: "right_control_bar"
            });
            cBar.addClass('sub-control-bar');
            cBar.setAttribute('id', 'right_control_bar');
        };
        player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new disableVideoButton(player, {
            el: videojs.dom.createEl("button", {
                className: 'icon-button',
                id: 'disable-video',
                innerHTML: '<div class="icon-disable-video"><?xml version="1.0" ?><svg fill="none" height="24" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" x2="23" y1="1" y2="23"/></svg></div>',
                title: options.title
            }),
            pluginOptions : options
        }));
    });
});
