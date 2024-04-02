var VjsOverlayButton = videojs.getComponent('MenuButton');
var overlayButton = videojs.extend(VjsOverlayButton, {
    constructor: function (player, options, callback) {
        VjsOverlayButton.call(this, player, options);
        this.player = player;
        this.menuButton_.contentEl().append(videojs.dom.createEl('i', {
            className: 'icon-overlay-select fa fa-desktop',
            innerHTML: '<i></i>'
        }))
        this.player.overlay = this;
        this.menu.__proto__.unlockShowing = function() {}
    },
    buildCSSClass: function () {
        return 'icon-button';
    },
    controlText_: 'Overlay',
    createItems: function () {
        var screenResolution = [
            {text: "Overlay Off", url: ''},
            {text: "Pillarbox", url: "url('assets/img/player-overlays/pillarbox.png')"},
            {text: "16 : 9", url: "url('assets/img/player-overlays/16-9.png')"},
            {text: "4 : 3", url: "url('assets/img/player-overlays/center-cut-safe1.png')"}
        ]
        var ComponentClass = videojs.getComponent('Component').getComponent('MenuItem');
        var items = [];
        for (var i = 0; i < screenResolution.length; i++) {
            var component = new ComponentClass(this.player_ || this, {name: "MenuItem", id: 'video-overlay-' + i});
            component.selectable = true;
            if (i == 0) {
                component.selected(true);
            }
            component.el_.innerText = screenResolution[i].text;
            component._backgroundUrl = screenResolution[i].url;
            component.on('click', function (event) {
                var _this = this;
                var items = this.player().overlay.items;
                $('.png-overlay').css('background-image', this._backgroundUrl);
                items.forEach(function (el) {
                    if (el.id_ !== _this.id_) {
                        el.selected(false);
                    }
                })
            })
            items.push(component);
        }
        return items;
    },
    handleClick: function handleClick(event) {
        this.player.componentContext.handleClickPlayerMenuButton(this.id());
        if (this.menuButton_.hasClass('active')) {
            this.unpressButton();
            this.menuButton_.removeClass('active');
            this.menu.removeClass('vjs-lock-showing');
        } else {
            this.pressButton();
            this.menuButton_.addClass('active');
        }
    },
    hideMenu: function(){
        if (this.menuButton_.hasClass('active')) {
            this.unpressButton();
            this.menuButton_.removeClass('active');
            this.menu.removeClass('vjs-lock-showing');
        }
    }
});

videojs.registerPlugin('overlaybutton', function (options) {
    if (!options) return;
    var player = this;
    player.ready(function () {
        var _div = player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new overlayButton(player, {id: 'overlayControl'}));
    });
});
