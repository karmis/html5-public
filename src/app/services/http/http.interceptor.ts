import {
    HttpEvent,
    HttpHandler,
    HttpHeaderResponse,
    HttpInterceptor,
    HttpProgressEvent,
    HttpRequest,
    HttpResponse,
    HttpSentEvent,
    HttpUserEvent
} from '@angular/common/http';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';
import {map, tap, timeout} from 'rxjs/operators';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable()
export class ImfxHttpInterceptor implements HttpInterceptor {
    constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const timeoutValue = req.headers.get('timeout') || this.defaultTimeout;
        const timeoutValueNumeric = Number(timeoutValue);
        // // operate req before backend sending
        // // e.g.
        // const authReq = req.clone({
        //     headers: req.headers.set('Accept-Language', 'Test')
        // });
        return next.handle(req)
            .pipe(timeout(timeoutValueNumeric))
            .pipe(
                tap(() => {
                }),
                // operate res before frontend handling
                map((res: HttpSentEvent
                    | HttpHeaderResponse
                    | HttpResponse<any>
                    | HttpProgressEvent
                    | HttpUserEvent<any>) => {
                    return res;
                })
            );
    }
}

