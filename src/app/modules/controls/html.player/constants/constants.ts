import {Injectable} from '@angular/core';
@Injectable()
export class PlayerConstants {
    static offsetInSecForFramesSwitchingAllBrowsers = 0.0001;
    static offsetInSecForFramesSwitchingOpera = 0.0001; //0.005;
    static menuPopupButtons = ["audioTracksControl", "subtitleControl", "overlayControl", "aspectRatioControl", "settingsButton"];
}
