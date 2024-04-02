import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import { IMFXModalPromptComponent } from "../../../../../../../modules/imfx-modal/comps/prompt/prompt";
import { SecurityService } from "../../../../../../../services/security/security.service";
import { TranslateService } from "@ngx-translate/core";
import {
    DBSettings,
    ServiceConfigService
} from "../../../../../../../services/system.config/settings.service-config.service";
import { NotificationService } from "../../../../../../../modules/notification/services/notification.service";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: 'version-modal',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [
        './styles/index.scss'
    ],
})
export class VersionModalComp extends IMFXModalPromptComponent {
    DBSettings: DBSettings;
    form: FormGroup;
    prevValue = '';

    constructor(protected injector: Injector,
                protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected translate: TranslateService,
                private serviceConfigService: ServiceConfigService,
                private notificationService: NotificationService,
                private formBuilder: FormBuilder) {
        super(injector, cdr, translate);
    }

    ngOnInit() {
        const {Major, Minor, Release} = this.DBSettings.MinRequiredAppVersion;
        this.form = new FormGroup({
            'major': new FormControl(Major),
            'minor': new FormControl(Minor),
            'release': new FormControl(Release)
        });
        this.form.get("major").valueChanges.subscribe(value => this.change(value));
        this.form.get("minor").valueChanges.subscribe(value => this.change(value));
        this.form.get("release").valueChanges.subscribe(value => this.change(value));
    }

    change(inputValue) {
        console.log(inputValue);
        const arrayVersion = String(inputValue).split('.');
        if (arrayVersion.length === 4) {
            this.prevValue = inputValue;
            this.form.setValue({
                'major': arrayVersion[0],
                'minor': arrayVersion[1],
                'release': arrayVersion[2],
            });
        }
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    setInputs(DBSettings: DBSettings) {
        this.DBSettings = DBSettings;
    }

    getInputs(): DBSettings {
        this.DBSettings.MinRequiredAppVersion.Major = this.form.get("major").value;
        this.DBSettings.MinRequiredAppVersion.Minor = this.form.get("minor").value;
        this.DBSettings.MinRequiredAppVersion.Release = this.form.get("release").value;
        return this.DBSettings;
    }

    ok() {
        this.serviceConfigService.saveVersionClient(this.getInputs())
            .subscribe(res => {
                },
                error => {
                    this.notificationService.notifyShow(2, "common.error");
                },
                () => {
                    this.notificationService.notifyShow(1, 'config_tables.save_success');
                    super.ok();
                });
    }

    hide() {
        this.modalRef.hide();
        this.modalRef.modalEvents.emit({
            name: 'hide'
        });
    }

}
