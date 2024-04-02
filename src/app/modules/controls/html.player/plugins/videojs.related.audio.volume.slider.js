var VjsButton = videojs.getComponent('Button');
var relatedAudioSwitch = videojs.extend(VjsButton, {
    constructor: function(player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.el().checked = true;
        this.on('change', this.onChange);
    },
    onChange: function(event) {
        var checked = this.el().checked;
        this.el().blur();
        this.player.componentContext.toggleRelatedAudio(checked);

        let $elSlider = $("#related_volume_slider");
        if ($elSlider.length > 0 && $elSlider.slider) {
            $("#related_volume_slider").slider((checked) ? 'enable' : 'disable');
        }
    }
});

videojs.registerPlugin('relatedaudiovolumeslider', function (options) {
    var player = this;
    player.ready(function () {

        var cBar = player.controlBar.getChildById('sub_bottom_control_bar');
        if (!cBar) {
            cBar = player.controlBar.addChild('component', {
                text: "",
                id: "sub_bottom_control_bar"
            });
            cBar.addClass('sub-control-bar');
            cBar.addClass('sub-bottom-control-bar');
            cBar.setAttribute('id', 'sub_bottom_control_bar');
        }

        var lbcBar = cBar.getChildById('left_bottom_control_bar');
        if (!lbcBar) {
            lbcBar = player.controlBar.getChildById('sub_bottom_control_bar').addChild('component', {
                text: "",
                id: "left_bottom_control_bar"
            });
            lbcBar.addClass('sub-control-bar');
            lbcBar.setAttribute('id', 'left_bottom_control_bar');
        }

        var rasw_div = lbcBar.addChild('component', {
            text: "",
            id: "related-audio-switch-wrapper"
        });
        rasw_div.addClass("related-audio-switch-wrapper");

        var rast_div = rasw_div.addChild('component', {
            text: options.switchText, //"Overlay Audio"
            id: "related-audio-switch-title"
        });
        rast_div.addClass("related-audio-switch-title");
        rast_div.el_.innerText = options.switchText; //"Overlay Audio"

        var ras_cb = rasw_div.addChild(new relatedAudioSwitch(player, {
            el: videojs.dom.createEl("input", {
                className: 'related-audio-switch',
                title: options.switchTitle//'On/Off Related Audio'
            }, {
                type: 'checkbox',
                id: 'related-audio-switch'
            }),
            pluginOptions : options
        }));

        var rvsw_div = lbcBar.addChild('component', {
            text: "",
            id: "related-volume-slider-wrapper"
        });
        rvsw_div.addClass("related-volume-slider-wrapper");

        var rvt_div = rvsw_div.addChild('component', {
            text: options.sliderText, //"Volume"
            id: "related-volume-title"
        });
        rvt_div.addClass("related-volume-title");
        rvt_div.el_.innerText = options.sliderText; //"Volume"


        var rvs_div = rvsw_div.addChild('component', {
            text: "",
            id: "related-volume-slider"
        });
        rvs_div.addClass('related-volume-slider');
        rvs_div.setAttribute('id', 'related_volume_slider');
        $("#related_volume_slider").width(100);
        var $sliderEl = $("#related_volume_slider").slider({
            range: 'min',
            value: 1,
            min: 0,
            max: 1,
            step: 0.01,
            slide: function (event, ui) {
                player.componentContext.updateAudioVolume(ui.value);
            },
            change: function (event, ui) {

            }
        });

        player.componentContext.toggleVisibleRelatedAudioPanel(true);

    });
});
