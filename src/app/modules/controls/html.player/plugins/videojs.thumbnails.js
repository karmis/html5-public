(function() {
  var defaults = {
      0: {
        src: ''
      }
    },
    extend = function() {
      var args, target, i, object, property;
      args = Array.prototype.slice.call(arguments);
      target = args.shift() || {};
      for (i in args) {
        object = args[i];
        for (property in object) {
          if (object.hasOwnProperty(property)) {
            if (typeof object[property] === 'object') {
              target[property] = extend(target[property], object[property]);
            } else {
              target[property] = object[property];
            }
          }
        }
      }
      return target;
    },
    getComputedStyle = function(el, pseudo) {
      return function(prop) {
        if (window.getComputedStyle) {
          return window.getComputedStyle(el, pseudo)[prop];
        } else {
          return el.currentStyle[prop];
        }
      };
    },
    offsetParent = function(el) {
      if (el.nodeName !== 'HTML' && getComputedStyle(el)('position') === 'static') {
        return offsetParent(el.offsetParent);
      }
      return el;
    },
    getVisibleWidth = function(el, width) {
      var clip;

      if (width) {
        return parseFloat(width);
      }

      clip = getComputedStyle(el)('clip');
      if (clip && clip !== 'auto' && clip !== 'inherit') {
        clip = clip.split(/(?:\(|\))/)[1].split(/(?:,| )/);
        if (clip.length === 4) {
          return (parseFloat(clip[1]) - parseFloat(clip[3]));
        }
      }
      return 0;
    },
    getScrollOffset = function() {
      if (window.pageXOffset) {
        return {
          x: window.pageXOffset,
          y: window.pageYOffset
        };
      }
      return {
        x: document.documentElement.scrollLeft,
        y: document.documentElement.scrollTop
      };
    };

  /**
   * register the thubmnails plugin
   */
  videojs.registerPlugin('thumbnails', function(options) {
    var div, settings, img, player, progressControl, duration, moveListener, moveCancel;
    settings = extend({}, defaults, options);
    player = this;

    (function() {
      var progressControl, addFakeActive, removeFakeActive;
      // Android doesn't support :active and :hover on non-anchor and non-button elements
      // so, we need to fake the :active selector for thumbnails to show up.
      if (navigator.userAgent.toLowerCase().indexOf("android") !== -1) {
        progressControl = player.controlBar.progressControl;

        addFakeActive = function() {
          progressControl.addClass('fake-active');
        };
        removeFakeActive = function() {
          progressControl.removeClass('fake-active');
        };

        progressControl.on('touchstart', addFakeActive);
        progressControl.on('touchend', removeFakeActive);
        progressControl.on('touchcancel', removeFakeActive);
      }
    })();

    $(".vjs-thumbnail-holder").remove();
    $(".vjs-thumbnail-full").remove();

    // create the thumbnail
    div = document.createElement('div');
    div.className = 'vjs-thumbnail-holder';
    img = document.createElement('img');
    div.appendChild(img);
    img.src = settings['0'].src;
    img.className = 'vjs-thumbnail';
    extend(img.style, settings['0'].style);

    // create fullwidth thumnail for drag
    fwThumbDiv = document.createElement('div');
    fwThumbDiv.className = 'vjs-thumbnail-full';
    fwThumbImg = document.createElement('img');
    fwThumbDiv.appendChild(fwThumbImg);
    fwThumbImg.src = settings['0'].src;
   // fwThumbImg.className = 'vjs-thumbnail-full';
   // extend(img.style, settings['0'].style);

      audioThumbDiv = document.createElement('div');
      audioThumbDiv.className = 'vjs-thumbnail-audio-wave';
      audioThumbImg = document.createElement('img');
      audioThumbDiv.appendChild(audioThumbImg);
      audioThumbImg.src = settings['0'].src;


    // center the thumbnail over the cursor if an offset wasn't provided
    if (!img.style.left && !img.style.right) {
      img.onload = function() {
        img.style.left = -(img.naturalWidth / 2) + 'px';
      };
    }

    // keep track of the duration to calculate correct thumbnail to display
    duration = player.duration();

    // when the container is MP4
    player.on('durationchange', function(event) {
      duration = player.duration();
    });

    // when the container is HLS
    player.on('loadedmetadata', function(event) {
      duration = player.duration();
    });

    // add the thumbnail to the player
    progressControl = player.controlBar.progressControl;
    progressControl.el().appendChild(div);
    progressControl.el().appendChild(fwThumbDiv);
    progressControl.el().appendChild(audioThumbDiv);
    // move full width thumb when drag on progress bar
    moveFullWithThumb = function(left, imgFullWidth, progressBarWidth, player){
        var percent = left * 100 / progressBarWidth;
        var _left = percent * imgFullWidth / 100

        $(player.el()).find('.vjs-thumbnail-full img')[0].style.left = -(_left-progressBarWidth/2) + 'px';
        // fwThumbImg.style.left = -(_left-progressBarWidth/2) + 'px';
    };

    moveListener = function(event) {
      var mouseTime, time, active, left, setting, pageX, right, width, halfWidth, pageXOffset, clientRect;
      active = 0;
      pageXOffset = getScrollOffset().x;
      clientRect = offsetParent(progressControl.el()).getBoundingClientRect();
      right = (clientRect.width || clientRect.right) + pageXOffset;

      pageX = event.pageX;
      if (event.changedTouches) {
        pageX = event.changedTouches[0].pageX;
      }

      // find the page offset of the mouse
      left = pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
      // subtract the page offset of the positioned offset parent
      left -= offsetParent(progressControl.el()).getBoundingClientRect().left + pageXOffset;

      // apply updated styles to the thumbnail if necessary
      // mouseTime is the position of the mouse along the progress control bar
      // `left` applies to the mouse position relative to the player so we need
      // to remove the progress control's left offset to know the mouse position
      // relative to the progress control
//      mouseTime = Math.floor((left - progressControl.el().offsetLeft) / progressControl.width() * duration);
      //mouseTime = (left - progressControl.el().offsetLeft) / progressControl.width() * duration;
      mouseTime = (left) / progressControl.width() * duration;
      for (time in settings) {
        if (mouseTime > time) {
          active = Math.max(active, time);
        }
      }
      setting = settings[active];
      if (setting.src && img.src != setting.src) {
        img.src = setting.src;
      }
      if (setting.style && img.style != setting.style) {
        extend(img.style, setting.style);
      }

      width = getVisibleWidth(img, setting.width || settings[0].width);
      halfWidth = width / 2;

      // make sure that the thumbnail doesn't fall off the right side of the left side of the player
      if ( (left + halfWidth) > right ) {
        left -= (left + halfWidth) - right;
      } else if (left < halfWidth) {
        left = halfWidth;
      }
      if(this.player_){
          if(this.player_.componentContext.type !== 150) {
              if (progressControl.dragging) {
                  div.style.left = right/2  + 'px';
              } else {
                  // 45px - 'vjs-mouse-display-text' width / 2
                  if (left <= 45) {
                      div.style.left = 45 + 'px';
                  } else if (left > clientRect.width - 45) {
                      div.style.left =  (clientRect.width - 45) + 'px';
                  } else {
                      div.style.left = left + 'px';
                  }
              }
          } else {
              // find the page offset of the mouse
              $(audioThumbDiv).show();
              $(".vjs-thumbnail-holder").hide();
              var h = $('#imfx-video-' + this.player_.componentContext.internalId + ' video').height();
              $('.vjs-thumbnail-audio-wave').height(h);
              $('.vjs-thumbnail-audio-wave img').height(h);

              leftCursorPosition = pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
              // subtract the page offset of the positioned offset parent
              leftCursorPosition -= offsetParent(progressControl.el()).getBoundingClientRect().left + pageXOffset;
              var percent = leftCursorPosition * 100 / right;
              var _left = percent * audioThumbImg.width / 100

              audioThumbImg.left =  -(_left-right/2) + 'px';
              $('.vjs-thumbnail-audio-wave img').css('left', -(_left-right/2));
          }
      }

      if(this.player_ && this.player_.componentContext.type !== 150 && progressControl.dragging) {
        // find the page offset of the mouse
        leftCursorPosition = pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
        // subtract the page offset of the positioned offset parent
        leftCursorPosition -= offsetParent(progressControl.el()).getBoundingClientRect().left + pageXOffset;
        moveFullWithThumb(leftCursorPosition, fwThumbImg.width, right, this.player_);
      }
    };
    dragStartListener = function(event) {
        var _this = this;
        this.start_dragging = true;
        setTimeout(function () {
            if (_this.start_dragging && _this.player_.componentContext.type !== 150) { // not for audio
                progressControl.dragging = true;
                $(".vjs-thumbnail-full").show();
                $(".vjs-thumbnail-holder").css('zIndex', 1);
            }
        }, 300);
    };
    dragStopListener = function(event) {
      if( event.data ){
        var progressControl = event.data;
        progressControl.dragging = false;
        progressControl.start_dragging = false;
      }
      else {
        this.dragging = false;
        this.start_dragging = false;
      }
      $(".vjs-thumbnail-full").hide();
      $(".vjs-thumbnail-holder").css('zIndex', 0);
    };
    moveOnPlayerListener = function(event) {
      // for moving thumbs when drag not only on timeline
      if( event.data ) {
        var progressControl = event.data;
        if (event.data.player_ && event.data.player_.componentContext.type !== 150 && progressControl.dragging) {
          moveListener(event);
        }
      }
    };
    // update the thumbnail while hovering
    progressControl.on('mousemove', moveListener);
    $('.video-js').on('mousemove', progressControl, moveOnPlayerListener);
    progressControl.on('touchmove', moveListener);
    // drag
    if (!player.multiSegments) {
        player.controlBar.progressControl.seekBar.on('mousedown', dragStartListener);
        player.controlBar.progressControl.seekBar.on('mouseup', dragStopListener);
        $('body').on('mouseup', progressControl, dragStopListener);
    }

    moveCancel = function(event) {
        if (!this.dragging)
            div.style.left = '-1000px';
        $(".vjs-thumbnail-audio-wave").hide();
    };

    // move the placeholder out of the way when not hovering
    progressControl.on('mouseout', moveCancel);
    progressControl.on('touchcancel', moveCancel);
    progressControl.on('touchend', moveCancel);
    player.on('userinactive', moveCancel);
  });
})();
