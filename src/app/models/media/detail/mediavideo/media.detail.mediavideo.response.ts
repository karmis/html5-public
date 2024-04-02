import { MediaDetailMediaVideoAudioWavefrom } from './media.detail.mediavideo.audio.wavefrom';
import { MediaDetailMediaVideoScene } from './media.detail.mediavideo.scene';
import { MediaDetailMediaVideoSmudge } from './media.detail.mediavideo.smudge';

export type MediaDetailMediaVideoResponse = {
    AudioWaveform?: MediaDetailMediaVideoAudioWavefrom;
    AudioVolume?: any;
    OriginalVideo: boolean;
    PlayerType: string;
    ProxyUrl: string;
    Scene?: MediaDetailMediaVideoScene;
    Smudge?: MediaDetailMediaVideoSmudge;
    Som: string;
    SomMs: number;
    FileSomMs: number;
    TimecodeFormat: string;

    AspectRatio?: string, //""
    Eom?: string, //"00:00:00:00"
    EomFrames?: number, //0
    EomMs?: number, //0
    FileEom?: string, //"00:00:00:00"
    FileEomFrames?: number, //0
    FileEomMs?: number, //0
    FileSom?: string, //"00:00:00:00"
    FileSomFrames?: number, //0
    FirstTxPartSom?: any, //null
    FirstTxPartSomFrames?: number, //0
    FirstTxPartSomMs?: number, //0
    M_CTNR_ID?: string, //"|SmoothStreaming|"
    UsePresignedUrl?: boolean, //false
};
