import { EventEmitter, Output, Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
@Injectable()
export class LocatorsProvider {
    @Output() onGetMediaTaggingForSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSavedMediaTagging: EventEmitter<any> = new EventEmitter<any>();
    @Output() onReloadMediaTagging: EventEmitter<any> = new EventEmitter<any>();
    config: any;
    saveValid: boolean = false;
    constructor() {
    }
    /**
     * Calling on Save button clicking.
     */
    getMediaTaggingForSave(): any {
     //   this.onGetMediaTaggingForSave.emit();
    }

    /**
     * Sent request for saving media tagging
     */
    saveMediaTagging(res, guid): Observable<Subscription> {
        let self = this;
        return new Observable((observer: any) => {
            self.config.options.service.saveMediaTagging(res, guid)
                .subscribe(resp => {
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
        });
    };

    successSave() {
        this.saveValid = false;
    };
    errorSave() {
        this.saveValid = true;
    };

    isSaveValid(): boolean {
        return this.saveValid;
    };
}
