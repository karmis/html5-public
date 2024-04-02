var VjsQualityButton = videojs.getComponent('MenuButton');
var qualityButton = videojs.extend(VjsQualityButton, {
    constructor: function (player, options, callback) {
        VjsQualityButton.call(this, player, options);
        this.player = player;
        this.menuButton_.contentEl().append(videojs.dom.createEl('i', {
            className: 'icon-overlay-select fa fa-cog',
            innerHTML: '<i></i>'
        }))
        this.player.qualityMenu = this;
        this.menu.__proto__.unlockShowing = function() {}
    },
    buildWrapperCSSClass: function () {
        return 'vjs-menu-button vjs-menu-button-popup vjs-control vjs-button quality-menu-btn';
    },
    buildCSSClass: function () {
        return 'icon-button';
    },
    controlText_: 'Quality',
    createItems: function () {
        let representations = [];
        let items = [];
        if (this.player_.tech_.hls || (this.player_.dash && this.player_.dash.mediaPlayer)) {
            if(this.player_.tech_.hls) {
                representations = this.player_.tech_.hls.representations();
            } else {
                representations = this.player_.dash.mediaPlayer.getBitrateInfoListFor('video');
                this.player_.dash.mediaPlayer.setTrackSwitchModeFor('video', 'alwaysReplace');
            }
            var ComponentClass = videojs.getComponent('Component').getComponent('MenuItem');
            let index = 0;
            //---------------create 'auto' button------
            var component = new ComponentClass(this.player_ || this, {
                name: "MenuItem",
                id: 'video-representation-auto'
            });
            component.selectable = true;
            component.selected(true);
            component.el_.innerText = 'Auto';
            component.on('click', function (event) {
                var _this = this;
                var items = this.player().qualityMenu.items;
                if(this.player_.tech_.hls) {
                    items.forEach(function (el) {
                        if (el.id_ !== _this.id_) {
                            el.selected(false);
                            el.state.enabled_ && el.state.enabled_(true);
                        }
                    });
                } else {
                    items.forEach(function (el) {
                        if (el.id_ !== _this.id_) {
                            el.selected(false);
                        }
                    });
                    this.player_.dash.mediaPlayer.getSettings().streaming.abr.autoSwitchBitrate.video = true;
                    // this.player_.dash.mediaPlayer.setQualityFor('video', items[items.length-1].state.id);
                    if(!this.player_.paused()) {
                        //--to clear loaded buffer-----
                        var curr_time = this.player_.currentTime();
                        this.player_.currentTime(0);
                        let self = this;
                        setTimeout(function () {
                            self.player_.currentTime(curr_time);
                            self.player_.play();
                        }, 100);
                    }
                }
            })
            items.push(component);
            //-----------END----create 'auto' button------
            // if(representations.length) {
            //     representations.unshift({
            //         height: 'auto',
            //         id: 'auto',
            //         enabled: true
            //     });
            // }

            for (var i = 0; i < representations.length; i++) {
                let id = 0;
                if(this.player_.tech_.hls) {
                    id = representations[i].id;
                } else {
                    id = representations[i].qualityIndex;
                }
                var component = new ComponentClass(this.player_ || this, {
                    name: "MenuItem",
                    id: id
                });
                if(this.player_.tech_.hls) {
                    component.setState({
                        id: representations[i].id,
                        width: representations[i].width,
                        height: representations[i].height,
                        bitrate: representations[i].bandwidth,
                        enabled_: representations[i].enabled,
                    });
                } else {
                    component.setState({
                        id: representations[i].qualityIndex,
                        width: representations[i].width,
                        height: representations[i].height,
                        bitrate: representations[i].bitrate
                    });
                }
                component.selectable = true;
                component.el_.innerText = representations[i].height + 'p';
                component.on('click', function (event) {
                    var _this = this;
                    var items = this.player().qualityMenu.items;
                    items.forEach(function (el) {
                        if (el.id_ !== _this.id_) {
                            el.selected(false);
                            el.state.enabled_ && el.state.enabled_(false);
                        }
                    });
                    let selectedItem = items.filter(el => {return el.isSelected_})[0];
                    if(selectedItem) {
                        if(this.player_.tech_.hls) {
                            selectedItem.state.enabled_(true);
                        } else {
                            this.player_.dash.mediaPlayer.getSettings().streaming.abr.autoSwitchBitrate.video = false;
                            this.player_.dash.mediaPlayer.setQualityFor('video', selectedItem.state.id);
                            if(!this.player_.paused()) {
                                //--to clear loaded buffer-----
                                var curr_time = this.player_.currentTime();
                                this.player_.currentTime(0);
                                let self = this;
                                setTimeout(function () {
                                    self.player_.currentTime(curr_time);
                                    self.player_.play();
                                }, 100);
                            }
                        }
                    };
                })
                items.push(component);
            }
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

videojs.registerPlugin('qualitybutton', function (options) {
    if (!options) return;
    var player = this;
    player.ready(function () {
        var _div = player.controlBar.getChildById('sub_control_bar').getChildById('right_control_bar').addChild(new qualityButton(player, {id: 'qualityControl'}));
    });
});
