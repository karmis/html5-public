/**
 * Created by initr on 26.10.2016.
 */
import { EventEmitter, Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs';
import { NetworkError } from '../../modules/error/models/network.error';
import { ArrayProvider } from '../../providers/common/array.provider';
import { map } from 'rxjs/operators';
import { ErrorManagerProvider } from '../../modules/error/providers/error.manager.provider';
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import * as Cookies from 'js-cookie';
import { JsonProvider } from '../../providers/common/json.provider';
import {ErrorManager} from "../../modules/error/error.manager";
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse,
    HttpEventType, HttpEvent
} from '@angular/common/http';

export enum Action { QueryStart, QueryStop }

export type HttpServiceSpecialOptions = { isRelativeURL?: boolean, specialType?: 'refreshToken' | 'auth', preErrorText?: string }
export enum HttpRequestMethod  { Post = 'POST', Put = 'PUT', Patch = 'PATCH', Delete = 'DELETE', Get = 'GET', Head = 'HEAD', Jsonp = 'JSONP', Options = 'OPTIONS' }

@Injectable()
export class HttpService {
    authFailed: EventEmitter<any> = new EventEmitter<any>();
    authSuccess: EventEmitter<any> = new EventEmitter<any>();
    noPermissions: EventEmitter<any> = new EventEmitter<any>();
    baseUrl = ConfigService.getAppApiUrl();
    errorMessage: boolean;
    authMode = null;
    private notShowErrorForItRoutes = [
        'token',
        'MediaOrder',
        'user-preferences',
        'export'
    ];

    constructor(public http: HttpClient,
                private emp: ErrorManagerProvider,
                public localStorage: LocalStorageService,
                public sessionStorage: SessionStorageService,
                private arrayProvier: ArrayProvider,
                private jsonProvider: JsonProvider) {
    }

    public setAuthMode(mode) {
        // Cookies.set('access_auth_mode', mode, {expires: 1});
        this.localStorage.store('access_auth_mode', mode);
    }

    public getAuthMode() {
        return this.localStorage.retrieve('access_auth_mode');
        // Cookies.get('access_auth_mode')
    }

    public auth(url: string, username: string,
                password: string, options?: any, data2fa?, tacAccept?): Observable<HttpResponse<any>> {
        let body = 'username=' + username + '&password=' + password
            + (data2fa && data2fa.state ? "&2fa_state=" + data2fa.state : "")
            + (data2fa && data2fa.code ? "&2fa_code=" + data2fa.code : "")
            + (tacAccept ? '&tacAccept=true' : '')
            + '&grant_type=password';

        if (options.headers instanceof HttpHeaders) {
            options.headers = options.header.set('Content-Type', 'application/x-www-form-urlencoded');
        } else {
            options.headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        }

        return this._request(HttpRequestMethod.Post, url, body, options, {'specialType': 'auth'});
    }

    public refreshToken(url: string = '/token', refreshToken: string = this.getRefreshToken(),
                        options?: any): Observable<HttpResponse<any>> {
        let body = 'refresh_token=' + refreshToken + '&grant_type=refresh_token';

        if (options.headers instanceof HttpHeaders) {
            options.headers = options.header.set('Content-Type', 'application/x-www-form-urlencoded');
        } else {
            options.headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        }

        return this._request(HttpRequestMethod.Post, url, body, options,
            {'specialType': 'refreshToken'});
    }

    public get(url: string, options?: any,
               specialOptions: HttpServiceSpecialOptions = {}): Observable<HttpResponse<any>> {

        return this._request(HttpRequestMethod.Get, url, null, options, specialOptions);
    }

    public post(url: string, body: any, options?: any,
                specialOptions: HttpServiceSpecialOptions = {}, errorMessage = true): Observable<HttpResponse<any>> {
        this.errorMessage = errorMessage;
        return this._request(HttpRequestMethod.Post, url, body, options, specialOptions);
    }

    public put(url: string, body: string, options?: any,
               specialOptions = {}, errorMessage = true): Observable<HttpResponse<any>> {
        this.errorMessage = errorMessage;
        return this._request(HttpRequestMethod.Put, url, body, options, specialOptions);
    }

    public delete(url: string, options?: any): Observable<HttpResponse<any>> {
        return this._request(HttpRequestMethod.Delete, url, null, options);
    }

    public patch(url: string, body: string, options?: any): Observable<HttpResponse<any>> {
        return this._request(HttpRequestMethod.Patch, url, body, options);
    }

    public head(url: string, options?: any): Observable<HttpResponse<any>> {
        return this._request(HttpRequestMethod.Head, url, null, options);
    }

    public getBlob(url: string, options?: any, specialOptions = {}) {
        return this._request(HttpRequestMethod.Get, url, null, {responseType: 'blob'}, specialOptions)
            .pipe(map(response => (<HttpResponse<any>>response)));
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public setRefreshToken(refreshToken: string): void {
        this.localStorage.store('refresh_token', refreshToken);
    }

    public setAccessToken(accessToken: string): void {
        this.localStorage.store('access_token', accessToken);
        Cookies.set('access_token', accessToken, {expires: 1});
    }

    public deleteAllTokens(): void {
        this.localStorage.clear('access_token');
        this.localStorage.clear('refresh_token');
        Cookies.remove('access_token');
    }

    public getAccessToken(): string {
        return this.localStorage.retrieve('access_token');
    }

    public getRefreshToken(): string {
        return this.localStorage.retrieve('refresh_token');
    }

    private _request(method: HttpRequestMethod, url: string,
                     body: string, options: any = {},
                     specialOptions: HttpServiceSpecialOptions = {
                         isRelativeURL: true,
                     }): Observable<HttpResponse<any>> { // both HttpResponse<any> and HttpEvent<any> if reportProgress == true
        const so: HttpServiceSpecialOptions = Object.assign({}, {isRelativeURL: true}, specialOptions);
        // let authData = JSON.parse(Cookie.get('auth_data'));
        const accessToken = this.getAccessToken();
        const authMode = this.getAuthMode();

        let requestOptions = {
            method: options.method || method,
            url: options.url || (so.isRelativeURL === true ? this.baseUrl + url : url),
            headers: options.headers || new HttpHeaders(),
            body: options.body || body,
            params: options.params || new HttpParams(),
            responseType: options.responseType || null,
            withCredentials: options.withCredentials || null,
            reportProgress: options.reportProgress || false,
        };

        // if (!requestOptions.headers.has('Content-Type')) {
        //     requestOptions.headers = requestOptions.headers.set('Content-Type', 'application/x-www-form-urlencoded');
        // }

        if(!requestOptions.headers.has('Content-Type')) {
            requestOptions.headers = requestOptions.headers.set('Content-Type', 'application/json');
        }

        // Custom TMD type
        requestOptions.headers = requestOptions.headers.set('Accept', 'application/vnd.tmd.mediaflex.api+json;version=1');

        if (!specialOptions.specialType
            && url != '/api/appinfo'
            && url != '/api/v3/token2'
            && url != '/api/v3/token3'
            && authMode != null
            && authMode != "ActiveDirectory")
        {
            requestOptions.headers = requestOptions.headers.set('Authorization', 'Bearer ' + accessToken);
        }


        if (authMode != null && authMode == "ActiveDirectory") {
            requestOptions.withCredentials = true;
        }

        requestOptions.params = requestOptions.params.set('_dc', new Date().getTime().toString());

        let _this = this;
        return new Observable((observer: any) => {
            let req = this.http.request(new HttpRequest(
                requestOptions.method,
                requestOptions.url,
                requestOptions.body,
                {
                    headers: requestOptions.headers,
                    reportProgress: requestOptions.reportProgress,
                    params: requestOptions.params,
                    responseType: requestOptions.responseType,
                    withCredentials: requestOptions.withCredentials
                }
            ));

            req.subscribe(
                (res: HttpResponse<any> | HttpEvent<any>) => {
                    if (requestOptions.reportProgress) {
                        observer.next(res); // HttpEvent<any> | HttpResponse<any>
                    } else {
                        if (res.type !== HttpEventType.Response) {
                            return;
                        }
                        observer.next(res as HttpResponse<any>);
                    }
                },
                (err: HttpErrorResponse) => {
                    // console.error('>>> trace-id: ', err.headers.get('trace-id'));
                    // this.authFailed.next(err);
                    // observer.error(err);
                    // this.removeActiveRequest(method + '__' + url + '__' + requestOptions.params.get('_dc'));

                    let showErr = (_this.errorMessage);

                    // throw error to user interface
                    switch (err.status) {
                        case 403:
                            // intercept 403
                            this.noPermissions.emit(err);

                            let _err = (<any>err);

                            if (!_err.text
                                || (_err.text() && !this.jsonProvider.isValidJSON(_err.text()))) {
                                showErr = false;
                                observer.error(new HttpErrorResponse({status: _err.status, statusText: 'JSON parse error.'}));

                            } else {
                                observer.error(err);
                            }
                            // prevent show network error,
                            // need to handle it inside the component
                            break;
                        case 401:
                            // intercept 401
                            this.authFailed.next(err);
                            observer.error(err);
                            break;
                        case 400:
                            // intercept 400
                            observer.error(err);
                            // prevent show network error,
                            // need to handle it inside the component
                            return;
                        default:
                            observer.error(err);
                            break;
                    }

                    setTimeout(() => {
                        if (showErr) {
                            if (err.url) {
                                let urll = err.url.replace(/\?(.*)/, '');
                                let paths = urll.split('/');
                                let uris = paths.splice(3);

                                $.each(_this.notShowErrorForItRoutes, (k, routeItem) => {
                                    if (_this.arrayProvier.inArray(uris, routeItem)) {
                                        showErr = false;
                                        return false;
                                    }
                                });

                                let _err = (<any>err);

                                if(!_err.text || !this.jsonProvider.isValidJSON(_err.text())) {
                                    showErr = false;
                                    return false;
                                }
                            }

                            if (showErr) {
                                let error = new NetworkError();
                                error.setOriginalError(err);
                                error.setRequest(requestOptions);
                                error.setText(specialOptions.preErrorText);
                                const m: ErrorManager = this.emp.getManager();
                                m.handleNetworkError(error);
                                // this.emp.onErrorThrown.emit({error: error});
                            }
                        }
                    });
                }, () => {
                    observer.complete();
                });

                // this.activeRequests[method + '__' + url + '__' + requestOptions.params.get('_dc')] = req;
            }
        );
    }

    getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    };
}
