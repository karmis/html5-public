var VjsButton = videojs.getComponent('Button');
var pitchButton = videojs.extend(VjsButton, {
    constructor: function(player, options) {
        VjsButton.call(this, player, options);
        this.player = player;
    }
});

videojs.registerPlugin('pitchmenubutton', function (options) {
    var player = this;
    player.ready(function () {
        var cBar = player.controlBar.getChildById('sub_control_bar');
        if (!cBar) {
            cBar = player.controlBar.addChild('component', {
                text: "",
                id: "sub_control_bar"
            });
            cBar.addClass('sub-control-bar');
            // cBar.addClass('sub-bottom-control-bar');
            cBar.setAttribute('id', 'sub_control_bar');
        }

        var rcBar = cBar.getChildById('right_control_bar');

        if (!rcBar) {
            rcBar = cBar.addChild('component', {
                text: "",
                id: "right_control_bar"
            });
            rcBar.addClass('sub-control-bar');
            rcBar.setAttribute('id', 'right_control_bar');
        }

        var $sliderEl;
        //pitch button on tool panel
        var pitchBtn = rcBar.addChild(new pitchButton(player, {
            el: videojs.dom.createEl("div", {
                className: 'icon-button pitch-button-wrapper',
                id: 'pitch-btn',
                // innerHTML: '<i class="icons-audio-select icon"></i>',
                // innerHTML: '<span class="pitch-icon"></span>',
                innerHTML: '<div class="pitch-icon"><?xml version="1.0" encoding="iso-8859-1"?>\n' +
                    '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
                    '\t viewBox="0 0 477.867 477.867" xml:space="preserve">\n' +
                    '<g>\n' +
                    '\t<g>\n' +
                    '\t\t<path d="M460.8,238.93H358.4c-7.828,0-14.652,5.326-16.555,12.919l-28.45,113.783L272.947,15.1\n' +
                    '\t\t\tc-1.089-9.363-9.561-16.07-18.924-14.981c-7.323,0.852-13.271,6.308-14.749,13.53L185.19,284.157l-32.188-117.982\n' +
                    '\t\t\tc-2.465-9.098-11.839-14.474-20.936-12.009c-5.181,1.404-9.399,5.163-11.388,10.148L90.846,238.93H17.067\n' +
                    '\t\t\tC7.641,238.93,0,246.571,0,255.996s7.641,17.067,17.067,17.067H102.4c6.984,0.003,13.264-4.25,15.855-10.735l15.206-38.042\n' +
                    '\t\t\tl37.803,138.598c2.025,7.427,8.771,12.58,16.469,12.578h0.58c7.892-0.268,14.57-5.915,16.145-13.653l47.002-235.093\n' +
                    '\t\t\tl38.792,336.026c0.939,8.196,7.606,14.547,15.838,15.087l1.109,0.034c7.827-0.01,14.644-5.342,16.538-12.937l47.992-191.863H460.8\n' +
                    '\t\t\tc9.426,0,17.067-7.641,17.067-17.067S470.226,238.93,460.8,238.93z"/>\n' +
                    '\t</g>\n' +
                    '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g>\n' +
                    // '<g>\n' +
                    // '</g><g></g><g></g><g></g><g></g><g></g><g></g>\n' +
                    '</svg></div>',
                title: options.pitchTitle
            }),
            pluginOptions : options
        }));

        pitchBtn.on('click', function(event) {
            // console.log('onClick', event);
            if (event.target.classList.contains('pitch-slider-wrapper') || event.target.closest('.pitch-slider-wrapper')) {
                return;
            }
            $sliderEl.slider('value', 0);
            this.el().querySelector('.pitch-level').innerHTML = '0.0';
            this.player.componentContext.onPitchChanged(0);
        });

        var rvsw_div = pitchBtn.addChild('component', {
            text: "",
            id: "pitch-slider-wrapper"
        });
        rvsw_div.addClass("pitch-slider-wrapper");

        //pitch value display
        var pLevel_div = rvsw_div.addChild('component', {
            text: "",
            id: "pitch-level"
        });
        pLevel_div.addClass("pitch-level");
        pLevel_div.el().innerHTML = '0.0';


        var rvs_div = rvsw_div.addChild('component', {
            text: "",
            id: "pitch-slider"
        });
        rvs_div.addClass('pitch-slider');
        rvs_div.setAttribute('id', 'pitch_slider');
        $("#pitch_slider").width(5);

        $sliderEl = $("#pitch_slider").slider({
            range: 'min',
            orientation: "vertical",
            value: 0,
            min: -1,
            max: 1,
            step: 0.1,
            slide: function (event, ui) {
                // player.componentContext.updateAudioVolume(ui.value);
                pLevel_div.el().innerHTML = ui.value.toFixed(1);
            },
            change: function (event, ui) {
                // console.log('onChangeSlider',pLevel_div);
                pLevel_div.el().innerHTML = ui.value.toFixed(1);
                player.componentContext.onPitchChanged(ui.value);
            }
        });

        // player.componentContext.toggleVisibleRelatedAudioPanel(true);
    });
});
