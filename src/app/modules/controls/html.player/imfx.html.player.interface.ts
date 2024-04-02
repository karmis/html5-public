export interface IMFXHtmlPlayerInterface {
  setTimecode(tc: string): void;
    setTimecodeFrames(frame: number): void;
  setPercent(percent: number): void;
  setMarkers(o): void;
}
