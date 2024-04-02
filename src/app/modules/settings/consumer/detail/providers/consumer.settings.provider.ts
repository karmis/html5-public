/**
 * Created by Sergey Trizna on 03.08.2017.
 */
import {Injectable} from "@angular/core";
import {ConsumerSettingsProvider} from "../../provider";

@Injectable()
export class ConsumerDetailSettingsProvider extends ConsumerSettingsProvider {
    public settings = this.getDefaultSettings('detail');
    public isSetupPage: boolean = false;
    public synopsisRef: any;

    getStylesForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        if (widgetType == 'dynamicWidgets') {
            customId = this.getIndexArrayByProperty(customId, this.settings[widgetType], 'id');
        }

        if (customId == 'Title') {
            // /*debugger*/
        }

        let resp = {};
        if (customId != null && this.settings[widgetType][customId]) {
            resp = {
                'width': this.getWidthForWidget(customId, widgetType),
                'left': this.getLeftForWidget(customId, widgetType),
                'top': this.getTopForWidget(customId, widgetType),
                'height': this.getHeightForWidget(customId, widgetType)
            }
        }
        return resp;
    }

    getHeightForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        return ((this.settings[widgetType][customId].height * 6) - 6) + 'px';
    }

    getWidthForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        return this.settings[widgetType][customId].width * 0.83333 * 4 + '%';
    }

    getLeftForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        return this.settings[widgetType][customId].x * 0.83333 * 4 + '%';
    }

    getTopForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        if (customId === 'Synopsis' && this.synopsisRef) {
            let synopsisY = this.settings['staticWidgets']['Synopsis'].y;
            let synopsisH = (this.settings['staticWidgets']['Synopsis'].height * 6) - 6;
            let synopsisDocH = $(this.synopsisRef.nativeElement).height();

            // this.settings[widgetType][customId].y = this.settings[widgetType][customId].y + 20;
            // is lower than synopsis
            if (this.settings[widgetType][customId] && this.settings[widgetType][customId].y > synopsisY) {
                // /*debugger*/
                // 20px - margin-top for lowers elements
                return (((6*this.settings[widgetType][customId].y) - (synopsisH - synopsisDocH)) + 20) + 'px';
            }
        } else {
            let wH = (this.settings['staticWidgets'][customId].height * 6) - 6;
            // is lower than synopsis
            if (this.settings[widgetType][customId] && this.settings[widgetType][customId].y > wH) {
                // /*debugger*/
                // 20px - margin-top for lowers elements
                return (((6*this.settings[widgetType][customId].y) - (wH)) + 20) + 'px';
            }
        }


        return 6 * this.settings[widgetType][customId].y + 'px'
    }
}
