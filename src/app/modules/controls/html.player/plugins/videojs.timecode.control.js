var VjsButton = videojs.getComponent('CurrentTimeDisplay');

var $block1, $block2, $block3, $block4, $separator1, $separator2, $separator3, pattern, isValid = true, validEditableTimecode = '';

var currentTimeDisplay = videojs.extend(VjsButton, {
    constructor: function(player, options, callback) {
        VjsButton.call(this, player, options);
        this.player = player;
        this.contentEl_ = videojs.dom.createEl('span', {
            className: 'vjs-control-text',
            innerHTML: '<span></span>'
        })
    },
    setCurrentTime: function(str){
        // var timeArray = str.split(':');
        var VRegExp = new RegExp(/\W/g);
        var timeArray = str.split(VRegExp);
        var sepArray = str.match(VRegExp);
        var tcLength = timeArray.length;

        if (this.tcLength != tcLength) {
          if (tcLength==3) {
            $(this.player.el_).find(".separator-3,.block-4").hide();
            if(timeArray[2].indexOf('.') >= 0) {
                $(this.player.el_).find(".block.block-3").width(35);
            }
          } else {
            $(this.player.el_).find(".separator-3,.block-4").show();
          }
          this.tcLength = tcLength;
        }

        $block1.innerText = timeArray[0];
        $block2.innerText = timeArray[1];
        $block3.innerText = timeArray[2];

        $separator1.innerText = sepArray[0];
        $separator2.innerText = sepArray[1];

        if (tcLength == 4) {
            $block4.innerText = timeArray[3];
            $separator3.innerText = sepArray[2];
        }
        validEditableTimecode = str;
    },
    hideTimecodeEditor: function(){
        $('#enter-timecode').hide();
        $('#current-timecode-text').show();
    }
});

videojs.registerPlugin('timecodecontrol', function (options) {
     var player = this;
     var frameRate = options.getFrameRate();
     player.ready(function () {
        player.controlBar.getChildById('sub_control_bar').getChildById('left_control_bar').addChild(
            new currentTimeDisplay(player, {
                el: videojs.dom.createEl(
                    "div",
                    {
                        className: 'vjs-time-controls vjs-timecode vjs-control',
                        innerHTML: '<div class="currentTimecode" id="current-timecode-text">' +
                                        '<div class="block block-1">00</div>' +
                                        '<span class="separator separator-1">:</span>' +
                                        '<div class="block block-2">00</div>' +
                                        '<span class="separator separator-2">:</span>' +
                                        '<div class="block block-3">00</div>' +
                                        '<span class="separator separator-3">:</span>' +
                                        '<div class="block block-4">00</div>' +
                                    '</div>' +
                                    '<div id="enter-timecode-wrapper" style="display: none;">' +
                                        '<input class="field enter-timecode"  id="enter-timecode"/>' +
                                        '<i class="icons-cross icon"></i>' +
                                    '</div>' +
                                    '&nbsp;&nbsp;/&nbsp;&nbsp;<div class="durationTimecode">00:00:00:00</div>'
                    }
                ),
                id: 'timeControl'
            }));

         $block1 = $(player.el_).find(".vjs-timecode .block-1")[0];
         $block2 = $(player.el_).find(".vjs-timecode .block-2")[0];
         $block3 = $(player.el_).find(".vjs-timecode .block-3")[0];
         $block4 = $(player.el_).find(".vjs-timecode .block-4")[0];

         $separator1 = $(player.el_).find(".vjs-timecode .separator-1")[0];
         $separator2 = $(player.el_).find(".vjs-timecode .separator-2")[0];
         $separator3 = $(player.el_).find(".vjs-timecode .separator-3")[0];

         if($('#current-timecode-text').get(0)) {
             $('#current-timecode-text').get(0).ondblclick = function () {
                 $('#enter-timecode-wrapper').show();
                 $('#enter-timecode').val($('#current-timecode-text').text());
                 if (player.componentContext.type == 150 && (!player.componentContext.getTvStandart() || !player.componentContext.videoDetails.TimecodeFormat)) {
                     // timecode 'hh:mm:ss'
                     $('#enter-timecode').mask("99:99:99", {placeholder: "-", autoclear: false});
                     pattern = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;
                 } else {
                     //toDo to redo
                     var strTemplate = player.componentContext.videoDetails.Som || player.componentContext.videoDetails.Eom || '';
                     var arrSeparators = strTemplate.match(/\W/g);
                     var mask;
                     if (arrSeparators.length == 3) {
                         mask = '99' + arrSeparators.join('99') + '99';
                         pattern = new RegExp('^(?:(?:(?:([01]?\\d|2[0-3])'
                             + arrSeparators[0]
                             + ')?([0-5]?\\d)'
                             + arrSeparators[1]
                             + ')?([0-5]?\\d)'
                             + arrSeparators[2]
                             + ')?([0-2]?\\d)$');
                     } else {
                         mask = '99:99:99:99';
                         pattern = /^(?:(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)[:|;])?([0-2]?\d)$/;
                     }

                     // timecode with frames
                     $('#enter-timecode').mask(mask, {placeholder: "-", autoclear: false});

                 }
                 $('#enter-timecode-wrapper .icons-cross').click(function () {
                     $('#enter-timecode-wrapper').hide();
                 });
                 $('#enter-timecode').removeClass('error');
                 isValid = true;
                 $('#enter-timecode').focus();
             };
         }
         $('#enter-timecode').on('keyup', function(e){
             if (!e) e = window.event;
             var keyCode = e.keyCode || e.which;
             if (keyCode == '13'){
                 if(isValid) {
                     var som = player.componentContext.som; // in frames
                     if(player.componentContext.type == 150 && (!player.componentContext.getTvStandart() || !player.componentContext.videoDetails.TimecodeFormat)) {
                         var timecode = $('#enter-timecode').val();
                         var som = player.componentContext.videoDetails.FileSomMs; // if there is no TimecodeFormat we can't convert frames to milliseconds
                         var time = player.componentContext.clipsProvider.timecodeProvider.getTimeFromString(timecode, som);
                     } else {
                         var timecodeFormat = player.componentContext.videoDetails.TimecodeFormat;
                         var timecode = $('#enter-timecode').val();
                         var time = player.componentContext.clipsProvider.timecodeProvider.getTimeFromTimecodeString(timecode, timecodeFormat, som) + player.componentContext.offsetInSecForFramesSwitching;
                     }
                     player.currentTime(time);
                 }
             } else if(keyCode == '27') {
                 $('#enter-timecode-wrapper').hide();
             }
             else {
                 validEditableTimecode = e.target.value;
                 if( e.target.value.match(pattern) ) {
                     isValid = true;
                     $(e.target).removeClass('error');
                 } else {
                     isValid = false;
                     $(e.target).addClass('error');
                 }
             }
         });
    });
});
