import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ServerStorageService} from '../../../../services/storage/server.storage.service';
import {ProfileService} from '../../../../services/profile/profile.service';
import {JsonProvider} from '../../../../providers/common/json.provider';


@Component({
    selector: 'profile-settings-personal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [
        ProfileService
    ]
})
export class ProfilePersonalSettingsComponent implements OnInit {

    @ViewChild('loggerSettingsWrapper', {static: false}) private loggerSettingsWrapper;
    private data;
    private personalData = {
        Mute: false
    };
    private personalDataPrev = {
        Mute: false
    };
    private ready = false;

    constructor(private cdr: ChangeDetectorRef,
                private jsonProvider: JsonProvider,
                private storageService: ServerStorageService,
                private profileService: ProfileService) {
    };

    ngOnInit() {
        this.initPersonalSetting();
    }

    initPersonalSetting() {
        this.storageService.retrieve(['personal_settings'], false).subscribe(
            (res: any) => {
                const value = res && res[0].Value;
                const personalSettings = this.jsonProvider.isValidJSON(value)
                    ? JSON.parse(value)
                    : value || null;
                if (personalSettings) {
                    this.personalData = personalSettings;
                    this.personalDataPrev = personalSettings;
                }
                this.cdr.detectChanges();
                this.ready = true;
            });
    }

    SavePersonal() {
        if (!this.ready)
            return;
        let self = this;
        setTimeout(() => {
            this.personalData.Mute = !this.personalData.Mute;
            this.storageService.store('personal_settings', this.personalData).subscribe((res: any) => {
                self.profileService.SetPersonal(self.personalData);
                self.cdr.detectChanges();
            });
        }, 0);
    }
}
