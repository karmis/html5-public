(function() {

  "use strict";


/* videojs-offset main */

// Base function.
var vjsoffset = function(options) {
  var Player;
  this._offsetStart = options.start || 0;
  this._offsetEnd = options.end || 0;
  this._restartBeginning = options.restart_beginning || false;

  Player = this.constructor;
  if(!Player.__super__ || !Player.__super__.__offsetInit) {
    Player.__super__ = {
      __offsetInit: true,
      duration: Player.prototype.duration,
      currentTime: Player.prototype.currentTime,
      bufferedPercent: Player.prototype.bufferedPercent,
      remainingTime: Player.prototype.remainingTime
    };

    Player.prototype.duration = function(){
      if(this._offsetEnd > 0) {
        return this._offsetEnd - this._offsetStart;
      }
      return Player.__super__.duration.apply(this, arguments) - this._offsetStart;
    };

    Player.prototype.currentTime = function(seconds){
      var offsetStart = this._segmentOffsetStart ? this._segmentOffsetStart : this._offsetStart;
      if(seconds !== undefined){
        return Player.__super__.currentTime.call(this, seconds + offsetStart) - offsetStart;
      }
      return Player.__super__.currentTime.apply(this, arguments) - offsetStart;
    };

    Player.prototype.remainingTime = function(){
      var curr = this.currentTime();
      if(curr < this._offsetStart) {
        curr = 0;
      }
      return this.duration() - curr;
    };

    Player.prototype.startOffset = function(){
      return this._offsetStart;
    };

    Player.prototype.endOffset = function(){
      if(this._offsetEnd > 0) {
        return this._offsetEnd;
      }
      return this.duration();
    };
  }

  this.on('timeupdate', function(){
    var curr = this.currentTime();
    var offsetStart = this._segmentOffsetStart ? this._segmentOffsetStart : this._offsetStart;
    var offsetEnd = this._segmentOffsetEnd ? this._segmentOffsetEnd : (this._offsetEnd || this.duration());
    if(curr < 0){
      this.currentTime(0);
      this.play();
    }
    // this.segmentStart = 0;
    if(offsetEnd > 0 && (curr > (offsetEnd-offsetStart + this.segmentStart))) {
     // if(curr > this.duration()) {
      this.pause();
      if (!this._restartBeginning) {
        this.currentTime(offsetEnd-offsetStart + this.segmentStart);
        if (curr < this.duration()) {
          this.play();
        }
      } else {
        this.trigger('loadstart');
        this.currentTime(0);
      }
    }
  });

  return this;

};


// Version.
vjsoffset.VERSION = '1.0.1';


// Export to the root, which is probably `window`.
window.vjsoffset = vjsoffset;
window.videojs.registerPlugin('offset', vjsoffset);


}).call(this);
