var VjsButton = videojs.getComponent('Button');
var repeatButton = videojs.extend(VjsButton, {
  constructor: function(player, options) {
    VjsButton.call(this, player, options);
    this.player = player;
    this.on('click', this.onClick);
  },
  onClick: function() {
    this.player.loop(!this.player.options_.loop);
    if (this.player.options_.loop) {
      $('#repeat-media').addClass('active');
    }
    else {
      $('#repeat-media').removeClass('active');
    }
    if ( this.player.componentContext ) {
      this.player.componentContext.repeatMode = this.player.options_.loop;
    }
  }
});
videojs.registerPlugin('repeatbutton', function (options) {
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
    player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new repeatButton(player, {
      el: videojs.dom.createEl("button", {
        className: 'icon-button ' + (player.options_.loop && 'active'),
        id: 'repeat-media',
        innerHTML: '<i class="fa fa-repeat icon-repeat-media"></i>',
        title: options.repeatTitle
      }),
      pluginOptions : options
    }));
  });
});
