var VjsButton = videojs.getComponent('BigPlayButton');
var playerComp;
var bigPlayButton = videojs.extend(VjsButton, {
    constructor: function(player, options, callback) {
        VjsButton.call(this, player, options);
        playerComp = player;
    },
    handleClick: function(event) {
        var playPromise = playerComp.play();
        if (!playerComp.componentContext.simpleMode) {
            playerComp.componentContext.processInternalTrackChanges();
        }
        if (playPromise !== undefined) {
            playPromise.then(_ => { }).catch(error => { });
        }
        event.stopPropagation();
    }
});

videojs.registerPlugin('bigplaybutton', function (options) {
    var player = this;
    player.ready(function () {
        player.addChild(
            new bigPlayButton(player, {
                el: videojs.dom.createEl(
                    "div",
                    {
                        className: 'imfx-big-play-btn',
                        innerHTML: '<button class="icon-button large"><i class="icons-play icon"></i></button>',
                        title: options.title
                    }
                )
            }));
    });
});
