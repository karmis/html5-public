import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from "@angular/core";
import {IMFXModalComponent} from "../../../../../../../../../modules/imfx-modal/imfx-modal";
import {lazyModules} from "../../../../../../../../../app.routes";
import {IMFXModalAlertComponent} from "../../../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../../../modules/imfx-modal/types";
import {IMFXModalProvider} from "../../../../../../../../../modules/imfx-modal/proivders/provider";
import {SettingsGroupsService} from "../../../../../../../../../services/system.config/settings.groups.service";
import {NotificationService} from "../../../../../../../../../modules/notification/services/notification.service";

@Component({
    selector: 'terms-conditions',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class TermsConditionsComponent implements OnChanges {
    @Input('data') data;
    @Input('settingsGroup') settingsGroup;

    textAreaValue = '';

    constructor(private settingsGroupsService: SettingsGroupsService,
                private notificationService: NotificationService,
                private modalProvider: IMFXModalProvider) {
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges.data && simpleChanges.data.currentValue) {
            this.setValues(simpleChanges.data.currentValue);
        }
    }

    onChangeTermsText(value) {
            this.data.text = this.textAreaValue;
    }

    setValues(val) {
        this.textAreaValue = val.text;
    }

    showConfirmReset() {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: "settings_group.terms_conditions.reset",
                position: 'center',
                footer: 'cancel|ok'
            });

        modal.load().then(cr => {
            const modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                "settings_group.terms_conditions.reset_text",
                {textParam: ''}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.settingsGroupsService.resetTermsAndConditions(this.settingsGroup.ID).subscribe((res)=>{
                        this.notificationService.notifyShow(1, "settings_group.terms_conditions.reset_success");
                    });
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });

        })
    }
}
