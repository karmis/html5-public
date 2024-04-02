/**
 * Created by Sergey Trizna on 09.08.2017.
 */
import {EventEmitter, Injectable, Injector} from "@angular/core";
import { ErrorInterface } from '../models/interface.error';
import {ErrorManager} from "../error.manager";


@Injectable()
export class ErrorManagerProvider {
    isEnabled: boolean = (<any>window).IMFX_VERSION !== 'dev_version'; // defined in ErrorManager (in promise)
    modalOpened: boolean = false;
    modalRefreshErrorOpened: boolean = false;
    onErrorThrown: EventEmitter<{ error: ErrorInterface }> = new EventEmitter();
    onErrorResolve: EventEmitter<any> = new EventEmitter();
    private regexpForPrevent: RegExp[] = [
        new RegExp('The search returned', 'i'),
        new RegExp('The element or ID supplied is not valid', 'i'),
        new RegExp('request was interrupted by a call to pause', 'i'),
        new RegExp('ViewDestroyedError', 'i'),
        new RegExp('/presigned-url/', 'i'),
        new RegExp('Authorization has been denied for this request', 'i'),
        new RegExp('LoadSubtitlesById', 'i'),
        new RegExp('UploadRemoteComponent.prototype.getPaths', 'i'), // for safari & ff (it throws extra-error)
        new RegExp('Sequence contains no elements', 'i'),
        new RegExp("Cannot set property 'muted' of null", 'i'),
        new RegExp("Cannot read property 'autoplay' of null", 'i'),
        new RegExp('Media not found for ID', 'i'),
        new RegExp('Cannot delete. The group has users', 'i'),
        new RegExp('No Custom UI settings found', 'i')
    ];

    private regexpForSpecialHandler: { [key: string]: RegExp[] } = {
        needToRefreshBuild: [new RegExp('Loading chunk', 'i')],
        needToShowNotification: [
            new RegExp('device folder is not accessible from the server', 'i'),
            new RegExp('Error loading file. Please contact support', 'i'),
            new RegExp('The given path\'s format is not supported', 'i'),
            new RegExp('DASH_', 'i')
        ]
    };

    private regexpForEndpoints: RegExp[] = [
        new RegExp('/api/v3/config/user/[0-9]+/passthru', 'i'),
        new RegExp('/api/v3/config/user/[0-9]+/lock', 'i'),
        new RegExp('/api/v3/config/user/[0-9]+/dba', 'i'),
        new RegExp('/api/v3/loginfile', 'i'),
        new RegExp('/api/v3/upload/multi-part/.*', 'i')
    ];
    constructor(private injector: Injector) {
    }

    getManager() {
        return this.injector.get(ErrorManager);
    }

    errorIsPrevented(error: ErrorInterface): boolean {
        let res: boolean = false;
        $.each(this.regexpForPrevent, (key, regExp: RegExp) => {
            if (regExp.test(error.getTitle())) {
                console.log(error.getTitle(), 'prevented by regexp', regExp.toString());
                res = true;
                return false;
            }
        });

        return res;
    }

    errorIsSpecialEndpoint(error: ErrorInterface): boolean {
        let res: boolean = false;
        console.log(error);
        $.each(this.regexpForEndpoints, (key, regExp: RegExp) => {
            if (error.originalError && (regExp.test(error.originalError.url) || regExp.test(error.originalError.responseURL))) {
                console.log(error.originalError.url|error.originalError.responseURL, 'prevented by regexp', regExp.toString());
                res = true;
                return false;
            }
        });

        return res;
    }

    errorHasSpecialHandler(error: ErrorInterface): boolean | string {
        let res: boolean | string = false;
        $.each(this.regexpForSpecialHandler, (methodName, regExps: RegExp[]) => {
            $.each(regExps, (k, regExp: RegExp) => {
                if (regExp.test(error.getTitle())) {
                    res = methodName;
                    console.log(
                        error.getTitle(),
                        'handled by regexp',
                        regExp.toString(),
                        'to handler',
                        methodName
                    );
                    return false;
                }
            })
        });

        return res;
    }
}
