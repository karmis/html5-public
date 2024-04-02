/**
 * Created by Sergey Trizna on 19.12.2017.
 */
import {AppSettings} from "../../../../../modules/common/app.settings/app.settings";
import {CoreProvider} from "../../../../../core/core.provider";
import {ConfigService} from "../../../../../services/config/config.service";



export class InfoPanelThumbProvider extends CoreProvider {
    buildURL(el: any, appSettings: AppSettings, defaultThumb: string = './assets/img/default-thumb.png') {
        if (el.THUMBID == -1) {
            el.THUMBURL = defaultThumb;
        } else {
            el.THUMBURL = ConfigService.getAppApiUrl() + "/getfile.aspx?id=" + el.THUMBID;
        }
        el._media_icon = appSettings.getMediaIcon(el.MediaFormatIconId);
        el._hdSd_icon = appSettings.getMediaIcon(el.SdHdIconId);
        el._media_icon_not_formated = el.MediaFormatIconId;
        el._hdSd_icon_not_formated = el.SdHdIconId;
        el.STATUS = 1;

        return el;
    }
}
