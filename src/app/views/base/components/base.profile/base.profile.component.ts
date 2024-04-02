/**
 * Created by initr on 28.11.2016.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ViewEncapsulation
} from "@angular/core";
import { LoginService } from "../../../../services/login/login.service";
import { LoginProvider } from "../../../login/providers/login.provider";
import { ProfileService } from "../../../../services/profile/profile.service";
import { Router } from "@angular/router";
import { UploadProvider } from "../../../../modules/upload/providers/upload.provider";

@Component({
    selector: 'base-profile',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

/**
 * Shown small info about user
 */
export class BaseProfileComponent {

    // @Output() logout: EventEmitter<any> = new EventEmitter<any>();
    data: Object = {};
    window: any;

    constructor(private cdr: ChangeDetectorRef,
                private loginService: LoginService,
                private profileService: ProfileService,
                private loginProvider: LoginProvider,
                private router: Router,
                protected uploadProvider: UploadProvider // dont remove it
    ) {
        this.window = window;
    }

    /**
     * On init component
     */
    ngOnInit() {
        // Loading data
        let authData = this.loginService.getAuthData();
        if (Object.keys(authData).length === 0) {
            return this.logout();
        }

        this.profileService.getUserProfile()
            .subscribe(
                (resp: any) => {
                    this.data = Object.assign({}, this.data, resp);
                    this.profileService.userData = this.data as any;
                    this.profileService.onGetUserData.next(this.profileService.userData);
                },
                (error: any) => {
                    console.error('Failed from /api/userprofile', error);
                }
            );

        this.cdr.detectChanges();
    }

    logout() {
        if(this.uploadProvider.getUploadModelsByStates('waiting', 'progress').length > 0) {
            if(confirm('Are you sure you want to log out? There are still uploads in progress, media may not be created if you log out now.')){
                this.loginProvider.logout({redirectFrom: this.router.url});
            }
        } else {
            this.loginProvider.logout({redirectFrom: this.router.url});
        }
    }

    onChangeColorSchema(schema) {
        this.profileService.colorSchemaChange(schema);
    }
}
