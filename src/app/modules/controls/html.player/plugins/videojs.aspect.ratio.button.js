var VjsAspectButton = videojs.getComponent('MenuButton');
var aspectButton = videojs.extend(VjsAspectButton, {
    constructor: function (player, options, callback) {
        VjsAspectButton.call(this, player, options);
        this.player = player;
        this.menuButton_.contentEl().append(videojs.dom.createEl('span', {
            className: 'icon-aspect-select',
            innerHTML: '[&mdash;]'
        }))
        this.player.aspect = this;
        this.player.customAspect = null;
        this.player.defaultAspect = false;
        // set default aspect getting from backend
        var context = this.player.componentContext;
        if(context.videoDetails && context.videoDetails.AspectRatio !== null && context.videoDetails.AspectRatio !== '') {
            var defaultResolution = context.videoDetails.AspectRatio.split(':');
            this.player.aspect.items[0].w = defaultResolution[0];
            this.player.aspect.items[0].h = defaultResolution[1];
            this.player.customAspect = {
                h: defaultResolution[1],
                w: defaultResolution[0]
            }
            $(this.player.el()).find('video').addClass('stretch-video');
            this.player.defaultAspect = true;
        }

        this.menu.__proto__.unlockShowing = function() {}
    },
    buildWrapperCSSClass: function () {
        return 'vjs-menu-button vjs-menu-button-popup vjs-control vjs-button aspect-ratio-btn';
    },
    buildCSSClass: function () {
        return 'icon-button';
    },
    controlText_: 'Aspect Ratio',
    createItems: function () {
        var screenResolution = [
            {text: "Default", id: 0, h: 0, w: 0},
            {text: "1.85 : 1", id: 1, h: 1, w: 1.85},
            {text: "2.21 : 1", id: 2, h: 1, w: 2.21},
            {text: "2.35 : 1", id: 3, h: 1, w: 2.35},
            {text: "2.39 : 1", id: 4, h: 1, w: 2.39},
            {text: "16 : 9", id: 5, h: 9, w: 16},
            {text: "4 : 3", id: 6, h: 3, w: 4},
            {text: "2 : 1", id: 7, h: 1, w: 2}
        ]
        var ComponentClass = videojs.getComponent('Component').getComponent('MenuItem');
        var items = [];
        for (var i = 0; i < screenResolution.length; i++) {
            var component = new ComponentClass(this.player_ || this, {name: "MenuItem", id: 'video-aspect-' + i});
            component.selectable = true;
            if (i == 0) {
                component.selected(true);
            }
            component.el_.innerText = screenResolution[i].text;
            component._id = screenResolution[i].id;
            component.h = screenResolution[i].h;
            component.w = screenResolution[i].w;
            component.on('click', function (event) {
                var _this = this;
                var items = this.player().aspect.items;
                if(this._id || this.player().defaultAspect) {
                    this.player().customAspect = {
                        h: this.h,
                        w: this.w
                    }
                    $(this.player().el()).find('video').addClass('stretch-video');
                    if(this._id == 0) {
                        $(this.player().aspect.el()).find('span.icon-aspect-select').html('[&mdash;]');
                    } else {
                        $(this.player().aspect.el()).find('span.icon-aspect-select').text('[' + this.el_.innerText + ']');
                    }
                } else {
                    this.player().customAspect = null;
                    $(this.player().el()).find('video').removeClass('stretch-video');
                    $(this.player().aspect.el()).find('span.icon-aspect-select').html('[&mdash;]');
                }
                items.forEach(function (el) {
                    if (el.id_ !== _this.id_) {
                        el.selected(false);
                    }
                });
                this.player().componentContext.resizeProvider.onResize();
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

videojs.registerPlugin('aspectratiobutton', function (options) {
    if (!options) return;
    var player = this;
    player.ready(function () {
        var _div = player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new aspectButton(player, {id: 'aspectRatioControl'}));
    });
});
