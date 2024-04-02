import {Injectable, NgZone} from "@angular/core";
import * as _ from "lodash";
import {GoogleAuthService} from "ng-gapi/lib/GoogleAuthService";
import GoogleUser = gapi.auth2.GoogleUser;
import GoogleAuth = gapi.auth2.GoogleAuth;
import {LoginService} from "../../services/login/login.service";

@Injectable()
export class CustomGoogleService {
    public static readonly SESSION_STORAGE_KEY: string = "tmd.youtubetoken";
    private user: GoogleUser = undefined;

    constructor(private googleAuthService: GoogleAuthService,
                private ngZone: NgZone,
                private loginService: LoginService) {
    }

    public setUser(user: GoogleUser): void {
        this.user = user;
    }

    public getCurrentUser(): GoogleUser {
        return this.user;
    }

    public getToken(): string {
        let token: string = sessionStorage.getItem(CustomGoogleService.SESSION_STORAGE_KEY);
        if (!token) {
            throw new Error("no token set , authentication required");
        }
        return sessionStorage.getItem(CustomGoogleService.SESSION_STORAGE_KEY);
    }

    public signInOffline() {
        this.googleAuthService.getAuth().subscribe((auth) => {
            auth.grantOfflineAccess().then(res => this.offlineAccessSuccessHandler(res), err => this.signInErrorHandler(err));
        });
    }
    public signIn() {
        this.googleAuthService.getAuth().subscribe((auth) => {
            auth.signIn().then(res => this.signInSuccessHandler(res), err => this.signInErrorHandler(err));
        });
    }

    //TODO: Rework
    public signOut(): void {
        this.googleAuthService.getAuth().subscribe((auth) => {
            try {
                auth.signOut();
            } catch (e) {
                console.error(e);
            }
            sessionStorage.removeItem(CustomGoogleService.SESSION_STORAGE_KEY)
        });
    }

    public isUserSignedIn(): boolean {
        return !_.isEmpty(sessionStorage.getItem(CustomGoogleService.SESSION_STORAGE_KEY));
    }

    private signInSuccessHandler(res: GoogleUser) {
        this.ngZone.run(() => {
            this.user = res;
            sessionStorage.setItem(
                CustomGoogleService.SESSION_STORAGE_KEY, res.getAuthResponse().access_token
            );
            console.log(res.getAuthResponse());
            this.loginService.sendYouTubeResponse(res.getAuthResponse()).subscribe((res2)=>{
                alert("YouTube response Sended! ");
            });
        });
    }

    private offlineAccessSuccessHandler(res) {
        this.ngZone.run(() => {
            console.log(res);
            this.loginService.sendYouTubeResponse2(res).subscribe((res2)=>{
                alert("YouTube response Sended! ");
            });
        });
    }

    private signInErrorHandler(err) {
        console.warn(err);
    }
}
