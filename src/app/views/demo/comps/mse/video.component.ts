import {Component, ViewChild, ViewEncapsulation} from "@angular/core";
import {IMFXHtmlPlayerComponent} from "../../../../modules/controls/html.player/imfx.html.player";

@Component({
  selector: 'demo-video',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss',
  ],
  encapsulation: ViewEncapsulation.None
})
export class DemoMSEComponent {

  @ViewChild('player', {static: false}) player: IMFXHtmlPlayerComponent;

  // private src = "http://192.168.90.39/smoothstreaming/Black Sails season one reel-HD.mp4";

  private mediaSource;
  private playbackReady = false;

  private secondsPerSample = 1.0 / 44100;

  private audioFile: Array<any> = [
    {desc: 'mp3 - iTunes', type: 'audio/mpeg'},
    {
      file: 'http://commondatastorage.googleapis.com/dalecurtis-shared/gapless/lame/track01.mp3',
      length: 264960,
      delay: 528,
      padding: 2772
    },
    {
      file: 'http://commondatastorage.googleapis.com/dalecurtis-shared/gapless/lame/track02.mp3',
      length: 194688,
      delay: 528,
      padding: 1884
    },
  ]


  constructor() {

  }

  initMSE() {
    this.mediaSource = new MediaSource();
    let player = this.player.player;
    player.src(window.URL.createObjectURL(this.mediaSource));
    this.mediaSource.addEventListener('sourceopen', () => {
      this.playbackReady = true;
      this.startPlayback();
    }, false);

  }

  private  GET(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (e) {
      if (xhr.status == 200)
        callback(xhr.response);
      else
        alert('GET ' + url + ' failed: ' + xhr.status);
    };
    xhr.send();
  }

  startPlayback() {
    if (!this.playbackReady) {
      console.log('Playback not ready...');
      setTimeout(this.startPlayback, 100);
      return;
    }

    var audioFile = this.audioFile;
    var sourceBuffer = this.mediaSource.addSourceBuffer(audioFile[0]['type']);

    // As each buffer ends, queue the next one via loadAudio().
    sourceBuffer.addEventListener('updateend', loadAudio);

    // Load the next file from |audioFiles| as indexed by |audioIndex|.  If no
    // files are left for loading, flag end of stream.
    var audioIndex = 1;
    var startTime = 0;

    var compRef = this;

    function loadAudio(e) {
      if (audioIndex >= compRef.audioFile.length) {
        compRef.mediaSource.endOfStream();
        return;
      }
      console.log('Loading: ', audioFile[audioIndex].file);
      compRef.GET(audioFile[audioIndex++].file, function (data) {
        var track = audioFile[audioIndex - 1];
        var duration =
          (track.length - track.padding - track.delay) * compRef.secondsPerSample;
        sourceBuffer.timestampOffset = startTime - track.delay * compRef.secondsPerSample;
        sourceBuffer.appendWindowStart = startTime;
        sourceBuffer.appendBuffer(data);
        startTime += duration;
      });
    }

    // Load the first file and branding playback.
    loadAudio(null);
    this.player.player.play();
  }

}
