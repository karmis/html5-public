var VjsButton = videojs.getComponent('VolumePanel');
var volumeButton = videojs.extend(VjsButton, {
    constructor: function(player, options, callback) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.muteToggle.addClass('icon-button');
        this.muteToggle.contentEl().append(videojs.dom.createEl('i', {
            className: 'icons-volume icon',
            innerHTML: '<i></i>'
        }));
    }
});

videojs.registerPlugin('volumemenubutton', function (options) {
    var player = this;
    player.ready(function () {
        player.controlBar.getChildById('sub_control_bar').getChildById('left_control_bar').addChild(
            new volumeButton(player, {
                inline: false,
                vertical: true
            }));
    });
});
