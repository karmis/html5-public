var VjsButton = videojs.getComponent('Button');
var copyTimecodeButton = videojs.extend(VjsButton, {
    constructor: function(player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.on('click', this.onClick);
    },
    onClick: function() {
        let compContext = this.player.componentContext,
            tcStr = compContext.getCurrentTimecodeString() || null;

        if (tcStr) {
            compContext.clipboardProvider.copy(tcStr);
            let st = compContext.clipboardProvider.pasteLocal();
            if(!st) {
                st = {pasteTc: tcStr};
            } else {
                st.pasteTc = tcStr;
            }
            compContext.clipboardProvider.copyLocal(st);

            compContext.notificationService.notifyShow(1, 'common.copied');
            // compContext.notificationService.notifyShow(2, 'common.error_unknown');
        }
    }
});
videojs.registerPlugin('copytimecodebutton', function (options) {
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
        player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new copyTimecodeButton(player, {
            el: videojs.dom.createEl("button", {
                className: 'icon-button',
                id: 'copy-timecode',
                innerHTML: '<i class="fa fa-clone icon-copy-timecode"></i>',
                title: options.title
            }),
            pluginOptions : options
        }));
    });
});
