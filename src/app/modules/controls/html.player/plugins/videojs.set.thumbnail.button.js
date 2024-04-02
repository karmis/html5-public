import $ from "jquery";

var VjsSetThumbnailButton = videojs.getComponent('MenuButton');
var setThumbnailButton = videojs.extend(VjsSetThumbnailButton, {
    constructor: function (player, options, callback) {
        VjsSetThumbnailButton.call(this, player, options);
        this.player = player;
        this.menuButton_.contentEl().append(videojs.dom.createEl('span', {
            className: 'icon-set-thumbnail-select',
            innerHTML: '<i class="icons-thumbs icon"></i>'
        }))
        player.componentContext.player.on('canplay', function () {
            $('.set-thumbnail-btn').removeClass('disabled');
        });
        player.componentContext.player.on('waiting', function () {
            $('.set-thumbnail-btn').addClass('disabled');
        });
        player.componentContext.player.on('pause', function () {
            $('.set-thumbnail-btn').removeClass('disabled');
        });
        this.menu.__proto__.unlockShowing = function() {}
    },
    buildWrapperCSSClass: function () {
        return 'vjs-menu-button vjs-menu-button-popup vjs-control vjs-button set-thumbnail-btn';
    },
    buildCSSClass: function () {
        return 'icon-button';
    },
    controlText_: 'Set Thumbnail',
    createItems: function () {
        var p = this.player();
        var dropdownOptions = [];
        if(this.options_.options.allowMedia) {
            dropdownOptions.push({text: "Set Media Thumbnail", id: 0, type: "media", targetId: p.componentContext.file.ID});
        }
        if(this.options_.options.allowVersion && p.componentContext.file.PGM_PARENT_ID) {
            dropdownOptions.push({text: "Set Version Thumbnail", id: 1, type: "version", targetId: p.componentContext.file.PGM_PARENT_ID});
        }
        if(this.options_.options.allowSeries) {
            if(p.componentContext.file.SER_ABS_ID > 0) {
                dropdownOptions.push({text: "Set Series Thumbnail", id: 2, type: "title", targetId: p.componentContext.file.SER_ABS_ID});
            }
            if(p.componentContext.file.SER_ABS2_ID > 0) {
                dropdownOptions.push({text: "Set Season Thumbnail", id: 3, type: "title", targetId: p.componentContext.file.SER_ABS2_ID});
            }
            if(p.componentContext.file.PGM_ABS_ID > 0 &&
                p.componentContext.file.PGM_ABS_ID != p.componentContext.file.SER_ABS_ID &&
                p.componentContext.file.PGM_ABS_ID != p.componentContext.file.SER_ABS2_ID &&
                (p.componentContext.file.PGM_PARENT_TYPE == 1040 ||
                p.componentContext.file.PGM_PARENT_TYPE == 1050)) {
                dropdownOptions.push({text: "Set Episode Thumbnail", id: 4, type: "title", targetId: p.componentContext.file.PGM_ABS_ID});
            }
            if(p.componentContext.file.PGM_ABS_ID > 0 &&
                p.componentContext.file.PGM_ABS_ID != p.componentContext.file.SER_ABS_ID &&
                p.componentContext.file.PGM_ABS_ID != p.componentContext.file.SER_ABS2_ID &&
                (p.componentContext.file.PGM_PARENT_TYPE == 3020 ||
                p.componentContext.file.PGM_PARENT_TYPE == 3030)) {
                dropdownOptions.push({text: "Set Title Thumbnail", id: 5, type: "title", targetId: p.componentContext.file.PGM_ABS_ID});
            }
        }

        var ComponentClass = videojs.getComponent('Component').getComponent('MenuItem');
        var items = [];
        for (var i = 0; i < dropdownOptions.length; i++) {
            var component = new ComponentClass(this.player_ || this, {name: "MenuItem", id: 'set-thumbnail-' + i});
            component.selectable = false;
            component.el_.innerText = dropdownOptions[i].text;
            component._id = dropdownOptions[i].id;
            component._type = dropdownOptions[i].type;
            component._targetId = dropdownOptions[i].targetId;
            var self = this;
            component.on('click', function(ev) {
                var thumb = this.player().componentContext.clipsProvider.getCurrentClip();
                if(thumb && thumb.length > 0 && thumb.startsWith('data:image/png;base64')) {
                    this.player().componentContext.saveThumbnail(this._type, this._targetId, thumb.split(';base64,')[1]);
                    self.hideMenu();
                }
                else {
                    this.player().componentContext.notificationService.notifyShow(2, this.player().componentContext.translate.instant('player.thumbnail.t_not_ready'), true);
                }
            });
            items.push(component);
        }
        return items;
    },
    handleClick: function handleClick(ev) {
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

videojs.registerPlugin('setthumbnailbutton', function (options) {
    if (!options) return;
    var player = this;
    player.ready(function () {
        player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new setThumbnailButton(player, {id: 'setThumbnailButtonControl', options: options}));
    });
});
