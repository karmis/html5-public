var VjsButton = videojs.getComponent('Button');
var settingsButton = videojs.extend(VjsButton, {
    constructor: function(player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.player.shownSettings = false;
        this.on('click', this.onClick);
    },
    onClick: function() {
        this.player.componentContext.handleClickPlayerMenuButton(this.id());
        if( this.player.shownSettings ) {
            $('#settings-modal-wrapper').css('display', 'none');
            $('#settingsButton').removeClass('active');
        } else {
            $('#settings-modal-wrapper').css('display', 'flex');
            $('#settingsButton').addClass('active');
        }
        this.player.shownSettings = !this.player.shownSettings;
    },
    hideMenu: function(){
        if( this.player.shownSettings ) {
            $('#settings-modal-wrapper').css('display', 'none');
            $('#settingsButton').removeClass('active');
            this.player.shownSettings = false;
        }
    }
});
videojs.registerPlugin('playersettingsbutton', function (options) {
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
        player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new settingsButton(player, {
            el: videojs.dom.createEl("button", {
                className: 'icon-button ' + (player.options_.loop && 'active'),
                id: 'settingsButton',
                innerHTML: '<i class="fa fa-sliders icon-settings"></i>',
                title: options.settingsTitle
            }),
            pluginOptions : options
        }));
    });
});
