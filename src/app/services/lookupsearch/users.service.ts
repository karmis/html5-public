/**
 * Created by initr on 16.12.2016.
 */
import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';
import {Observable} from 'rxjs';
import {UsersListLookupTypes} from './types';
import {LookupSearchService} from "./common.service";

@Injectable({
    providedIn: 'root'
})
export class LookupSearchUsersService {
    constructor(private httpService: HttpService,
                private lookupSearchService: LookupSearchService) {
    }

    /**
     * Returned list of users by params
     * @returns {any}
     */
    public getUsers(): Observable<UsersListLookupTypes> {
        return new Observable((observer: any) => {
                this.lookupSearchService.getLookup('users')
                    // .pipe(map((res:any) => res.body))
                    .subscribe(
                        (res: UsersListLookupTypes) => {
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });

            }
        );
    }


    public getCompanies(): Observable<UsersListLookupTypes> {
        return new Observable((observer: any) => {
                this.lookupSearchService.getLookup('companies')
                    // .pipe(map((res:any) => res.body))
                    .subscribe(
                        (res: UsersListLookupTypes) => {
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });

            }
        );
    }

    public getNamedAutority(): Observable<UsersListLookupTypes> {
        return new Observable((observer: any) => {
                this.lookupSearchService.getLookup('na')
                    // .pipe(map((res:any) => res.body))
                    .subscribe(
                        (res: UsersListLookupTypes) => {
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });

            }
        );
    }

    public getUrl() {
        return this.lookupSearchService.getLookupUrl('users');
    }
}
