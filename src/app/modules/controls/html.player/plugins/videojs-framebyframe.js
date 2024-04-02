// videojs-framebyframe-plugin

var VjsButton = videojs.getComponent('Button');
var FBFButton = videojs.extend(VjsButton, {
  constructor: function(player, options) {
    VjsButton.call(this, player, options);
    this.player = player;
    this.getFrameTime = function(){return 1/options.getFps()};
    this.step_size = options.value;
    this.on('click', this.onClick);
  },

  onClick: function() {
    // Start by pausing the player
    this.player.pause();
    // Calculate movement distance
    var dist = this.getFrameTime() * this.step_size;
    this.player.currentTime(this.player.currentTime() + dist);
  },
});

function framebyframe(options) {
  var player = this;

  player.ready(function() {
    var _div = player.controlBar.addChild(
      'component', {
        text: "",
        id:"fbfbox"
      });
      _div.addClass("fbf-block");
    options.steps.forEach(function(opt) {
      _div.addChild(
        new FBFButton(player, {
          el: videojs.dom.createEl(
            'div',
            {
              className: 'vjs-res-button vjs-control',
              innerHTML: '<i class="icons-'+ opt.icon +' icon"></i>'
             /* innerHTML: '<div class="vjs-control-content vjs-frame-icons"><i title="' + opt.text + '" class="vjs-fb ' + opt.icon + '"></i></div>',*/

            },
            {
              role: 'button'
            }
          ),
          value: opt.step,
          getFps: options.getFps,
        }),
        {}, opt.index);
    });
  });
}
videojs.registerPlugin('framebyframe', framebyframe);
