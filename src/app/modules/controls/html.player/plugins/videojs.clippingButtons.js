var VjsMenuButton = videojs.getComponent('MenuButton');
var clipMenuButton = videojs.extend(VjsMenuButton, {
    constructor: function(player, options, callback) {
        VjsMenuButton.call(this, player, options);
        this.player = player;
    },
    createItems: function() {
        for(var i = 0; i < this.options_.playerOptions.btns.length; i++){
            var opt = this.options_.playerOptions.btns[i];
            var btn = this.addChild(
                new clipButton(this.player_, {
                        el: videojs.dom.createEl(
                            "div",
                            {
                                className: 'vjs-button clipping-button '+ opt.id,
                                innerHTML: '<span class="vjs-control-text">' + opt.text + '</span>',
                                id: opt.id
                            }
                        )
                    },
                    {
                        onClick: opt.onClick
                    }),{})
            $(btn.el()).attr('id',opt.id).attr('disabled',opt.disabled);
        }
        return this.children_;
    }
});
var VjsButton = videojs.getComponent('Button');
var clipButton = videojs.extend(VjsButton, {
    constructor: function(player, options, callback) {
        VjsButton.call(this, player, options);
        this.player = player;

        this.on(this.el(), 'click', this.onClick, options);
        this.on(this.el(), 'touchstart', this.onClick, options);
    },
    onClick: function(options) {
        this.player.componentContext.markersProvider.clipProvider.onAddClipFromPlayer.emit({id:this.id_})
    }
});

videojs.registerPlugin('clippingbuttonspopup', function (options) {
     var player = this;
    $($(player.el_.parentElement).find("iframe")[0].contentWindow).resize(function(){
        var controlBarWidth = $('.vjs-control-bar').width();
        if(controlBarWidth < 1135){
            $('.clipping-btns-popup').show();
            $('.clipping-btns-block').hide();
        }
        else {
            $('.clipping-btns-popup').hide();
            $('.clipping-btns-block').show();
        }
    })
     player.ready(function () {
        var _div = player.controlBar.addChild(
            'component', {
                text: "",
                id: "clippingpopup"
            });
         _div.addClass("clipping-btns-popup");

            var btn = _div.addChild(
                new clipMenuButton(player, {
                            el: videojs.dom.createEl(
                                "div",
                                {
                                    className: 'vjs-menu-button vjs-menu-button-popup vjs-control vjs-button clipping-button-popup',
                                    innerHTML: '<span class="vjs-control-text clip-menu">Clip</span>',
                                }
                            ),
                            playerOptions: options
                        }),{});
        var controlBarWidth = $('.vjs-control-bar').width();
        if(controlBarWidth < 1135){
            $('.clipping-btns-popup').show();
            $('.clipping-btns-block').hide();
        }
        else {
            $('.clipping-btns-popup').hide();
            $('.clipping-btns-block').show();
        }

    });
});
videojs.registerPlugin('clippingbuttons', function (options) {
     var player = this;
     player.ready(function () {
         if (!player.controlBar.getChildById('clipping_control_bar')) {
             var cBar = player.controlBar.addChild(
                 'component', {
                     text: "",
                     id: "clipping_control_bar"
                 });
             cBar.addClass('sub-control-bar');
             cBar.addClass('clipping-btns-block');
         }
         var _div = player.controlBar.getChildById('clipping_control_bar');
         $(_div.el_).empty();
         options.btns.forEach(function (opt) {
             var btn = _div.addChild(
                 new clipButton(player, {
                         el: videojs.dom.createEl(
                             "div",
                             {
                                 className: 'vjs-control vjs-button clipping-button icon-button ' + opt.id,
                                 innerHTML: '<span class="vjs-control-text">' + opt.text + '</span>',
                                 id: opt.id
                             }
                         ),
                         id: opt.id
                     },
                     {
                         onClick: opt.onClick
                     }), {})
             $(btn.el()).attr('id', opt.id).attr('disabled', opt.disabled);
         });
         player.componentContext.resizeProvider.onResize();
     });
});
